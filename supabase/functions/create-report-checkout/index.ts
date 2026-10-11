import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { corsHeaders, json, randomToken, REPORT_CONFIG, sha256 } from '../_shared/report.ts'
import { buildStripeCheckoutParams } from '../../../shared/reportPayments.ts'
import { isReportProductType, REPORT_PRODUCT_NAMES } from '../../../shared/reportConfig.ts'

function isShortText(value: unknown, max = 500): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max
}

function isDisplayRow(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return isShortText(row.label, 120) && isShortText(row.value, 300)
    && (row.detail === undefined || isShortText(row.detail, 600))
}

function isValidStandardSnapshot(snapshot: Record<string, unknown>): boolean {
  const captured = snapshot.captured
  const results = snapshot.results
  const checklist = snapshot.checklist
  const methodology = snapshot.methodology
  return isShortText(snapshot.title, 160)
    && isShortText(snapshot.description, 700)
    && Array.isArray(captured) && captured.length > 0 && captured.length <= 20 && captured.every(isDisplayRow)
    && Array.isArray(results) && results.length > 0 && results.length <= 25 && results.every(isDisplayRow)
    && isDisplayRow(snapshot.summary)
    && Array.isArray(checklist) && checklist.length > 0 && checklist.length <= 15 && checklist.every((item) => isShortText(item, 500))
    && Array.isArray(methodology) && methodology.length > 0 && methodology.length <= 12 && methodology.every((item) => isShortText(item, 700))
    && isShortText(snapshot.disclaimer, 1500)
}

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
    const calculatorType = snapshot.calculatorType
    if (!isReportProductType(calculatorType)) {
      return json({ error: 'Invalid calculation snapshot' }, 400)
    }
    const resultado = snapshot.resultado as { tipo?: string; conceptos?: unknown; totalEstimado?: unknown } | undefined
    const validLiquidacion = calculatorType === 'liquidacion'
      && resultado?.tipo === 'liquidacion'
      && Array.isArray(resultado.conceptos)
      && Number.isFinite(resultado.totalEstimado)
    const validStandard = calculatorType !== 'liquidacion' && isValidStandardSnapshot(snapshot)
    if (!validLiquidacion && !validStandard) {
      return json({ error: 'Invalid calculation result' }, 400)
    }

    const recoveryToken = randomToken()
    const accessTokenHash = await sha256(recoveryToken)
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { data: purchase, error: insertError } = await admin.from('report_purchases').insert({
      calculator_type: calculatorType, amount_minor: REPORT_CONFIG.priceMinor,
      currency: REPORT_CONFIG.currency, payment_provider: REPORT_CONFIG.paymentProvider,
      report_version: REPORT_CONFIG.reportVersion, calculator_version: REPORT_CONFIG.calculatorVersion,
      calculation_snapshot: snapshot, access_token_hash: accessTokenHash,
    }).select('id').single()
    if (insertError) {
      console.error('Unable to create report purchase', insertError.code)
      return json({ error: 'Unable to create checkout', code: 'purchase_create_failed' }, 500)
    }

    const resultUrl = new URL('/reporte', appBaseUrl.origin)
    resultUrl.searchParams.set('report_purchase', purchase.id)
    resultUrl.searchParams.set('report_token', recoveryToken)
    resultUrl.searchParams.set('checkout', 'success')
    resultUrl.searchParams.set('calculator', calculatorType)
    const success = resultUrl.toString()
    resultUrl.searchParams.set('checkout', 'cancelled')
    const cancel = resultUrl.toString()
    const form = buildStripeCheckoutParams(purchase.id, success, cancel, REPORT_PRODUCT_NAMES[calculatorType])
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
