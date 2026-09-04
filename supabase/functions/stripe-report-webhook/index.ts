import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import {
  evaluateStripeEvent,
  purchaseIdFromStripeEvent,
  verifyStripeSignature,
  type PurchasePaymentRecord,
  type StripeEventLike,
} from '../../../shared/reportPayments.ts'

function response(message: string, status = 200): Response {
  return new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return response('Method not allowed', 405)

  const payload = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
  if (!await verifyStripeSignature(payload, signature, webhookSecret)) return response('Invalid signature', 400)

  let event: StripeEventLike
  try {
    event = JSON.parse(payload) as StripeEventLike
  } catch {
    return response('Invalid payload', 400)
  }

  if (event.type !== 'checkout.session.completed' && event.type !== 'payment_intent.payment_failed') {
    return response('ok')
  }

  const purchaseId = purchaseIdFromStripeEvent(event)
  if (!purchaseId) return response('Missing purchase reference', 400)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return response('Backend not configured', 503)
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const { data, error: lookupError } = await admin.from('report_purchases')
    .select('id,amount_minor,currency,payment_status,provider_checkout_id,provider_payment_id')
    .eq('id', purchaseId)
    .maybeSingle()
  if (lookupError) {
    console.error('Unable to load report purchase', event.id)
    return response('Database error', 500)
  }

  const decision = evaluateStripeEvent(event, data as PurchasePaymentRecord | null)
  if (decision.action === 'reject') {
    console.error('Rejected Stripe report event', event.id, decision.reason)
    return response(decision.reason, decision.status)
  }
  if (decision.action === 'ignore' || decision.action === 'duplicate') return response('ok')

  if (decision.action === 'mark_paid') {
    const { error } = await admin.from('report_purchases').update({
      payment_status: 'paid',
      report_status: 'authorized',
      provider_payment_id: decision.paymentId,
      paid_at: new Date().toISOString(),
    }).eq('id', decision.purchaseId).in('payment_status', ['pending', 'failed'])
    if (error) {
      console.error('Unable to confirm report payment', event.id)
      return response('Database error', 500)
    }
    return response('ok')
  }

  const { error } = await admin.from('report_purchases').update({
    payment_status: 'failed',
    provider_payment_id: decision.paymentId,
  }).eq('id', decision.purchaseId).eq('payment_status', 'pending')
  if (error) {
    console.error('Unable to record failed report payment', event.id)
    return response('Database error', 500)
  }
  return response('ok')
})
