import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { corsHeaders, json, randomToken, REPORT_CONFIG, sha256 } from '../_shared/report.ts'
import { buildStripeCheckoutParams } from '../../../shared/reportPayments.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const baseUrl = Deno.env.get('APP_BASE_URL')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!stripeKey || !baseUrl || !supabaseUrl || !serviceKey) return json({ error: 'Backend not configured' }, 503)

    let appBaseUrl: URL
    try {
      appBaseUrl = new URL(baseUrl)
      if (appBaseUrl.protocol !== 'https:' && appBaseUrl.hostname !== 'localhost') throw new Error('Unsafe APP_BASE_URL')
    } catch {
      return json({ error: 'Backend not configured' }, 503)
    }

    const rawBody = await req.text()
    if (rawBody.length > 100_000) return json({ error: 'Payload too large' }, 413)
    let snapshot: Record<string, unknown>
    try {
      const parsed = JSON.parse(rawBody) as { snapshot?: Record<string, unknown> }
      snapshot = parsed.snapshot ?? {}
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }
    const resultado = snapshot.resultado as { tipo?: string; conceptos?: unknown; totalEstimado?: unknown } | undefined
    if (snapshot.calculatorType !== 'liquidacion' || resultado?.tipo !== 'liquidacion') {
      return json({ error: 'Invalid calculation snapshot' }, 400)
    }
    if (!Array.isArray(resultado.conceptos) || !Number.isFinite(resultado.totalEstimado)) {
      return json({ error: 'Invalid calculation result' }, 400)
    }

    const recoveryToken = randomToken()
    const accessTokenHash = await sha256(recoveryToken)
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { data: purchase, error: insertError } = await admin.from('report_purchases').insert({
      calculator_type: 'liquidacion', amount_minor: REPORT_CONFIG.priceMinor,
      currency: REPORT_CONFIG.currency, payment_provider: REPORT_CONFIG.paymentProvider,
      report_version: REPORT_CONFIG.reportVersion, calculator_version: REPORT_CONFIG.calculatorVersion,
      calculation_snapshot: snapshot, access_token_hash: accessTokenHash,
    }).select('id').single()
    if (insertError) {
      console.error('Unable to create report purchase', insertError.code)
      return json({ error: 'Unable to create checkout', code: 'purchase_create_failed' }, 500)
    }

    const resultUrl = new URL('/productos/laboralmx/resultado', appBaseUrl.origin)
    resultUrl.searchParams.set('report_purchase', purchase.id)
    resultUrl.searchParams.set('report_token', recoveryToken)
    resultUrl.searchParams.set('checkout', 'success')
    const success = resultUrl.toString()
    resultUrl.searchParams.set('checkout', 'cancelled')
    const cancel = resultUrl.toString()
    const form = buildStripeCheckoutParams(purchase.id, success, cancel)
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST', headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': `romanus-report-${purchase.id}`,
      }, body: form,
    })
    const session = await stripeResponse.json()
    if (!stripeResponse.ok || typeof session.id !== 'string' || typeof session.url !== 'string') {
      await admin.from('report_purchases').update({ payment_status: 'failed' }).eq('id', purchase.id).eq('payment_status', 'pending')
      console.error('Stripe checkout rejected', stripeResponse.status, session.error?.type, session.error?.code)
      return json({ error: 'Unable to create checkout', code: 'stripe_checkout_failed' }, 502)
    }
    const { error: updateError } = await admin.from('report_purchases')
      .update({ provider_checkout_id: session.id }).eq('id', purchase.id).eq('payment_status', 'pending')
    if (updateError) {
      console.error('Unable to attach Stripe checkout', updateError.code)
      return json({ error: 'Unable to create checkout', code: 'purchase_update_failed' }, 500)
    }
    return json({ purchaseId: purchase.id, checkoutUrl: session.url, recoveryToken })
  } catch (error) {
    console.error(error)
    return json({ error: 'Unable to create checkout', code: 'unexpected_checkout_error' }, 500)
  }
})
