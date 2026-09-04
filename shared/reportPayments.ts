import { REPORT_PRODUCT_CONFIG } from './reportConfig.ts'

export interface PurchasePaymentRecord {
  id: string
  amount_minor: number
  currency: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  provider_checkout_id: string | null
  provider_payment_id: string | null
}

interface StripeObject {
  id?: string
  mode?: string
  amount?: number
  amount_total?: number
  currency?: string
  payment_intent?: string | null
  payment_status?: string
  client_reference_id?: string | null
  metadata?: Record<string, string | undefined>
}

export interface StripeEventLike {
  id?: string
  type?: string
  data?: { object?: StripeObject }
}

export function buildStripeCheckoutParams(
  purchaseId: string,
  successUrl: string,
  cancelUrl: string,
): URLSearchParams {
  return new URLSearchParams({
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: purchaseId,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': REPORT_PRODUCT_CONFIG.currency.toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(REPORT_PRODUCT_CONFIG.priceMinor),
    'line_items[0][price_data][product_data][name]': 'Reporte ROMANUS de cálculo laboral',
    'payment_method_types[0]': 'card',
    'metadata[purchase_id]': purchaseId,
    'payment_intent_data[metadata][purchase_id]': purchaseId,
  })
}

export type WebhookDecision =
  | { action: 'ignore'; reason: string }
  | { action: 'reject'; reason: string; status: number }
  | { action: 'duplicate'; reason: string }
  | { action: 'mark_paid'; purchaseId: string; paymentId: string }
  | { action: 'mark_failed'; purchaseId: string; paymentId: string }

export function purchaseIdFromStripeEvent(event: StripeEventLike): string | null {
  return event.data?.object?.metadata?.purchase_id ?? null
}

function hasExpectedCommercialTerms(purchase: PurchasePaymentRecord, amount: unknown, currency: unknown): boolean {
  return purchase.amount_minor === REPORT_PRODUCT_CONFIG.priceMinor
    && purchase.currency === REPORT_PRODUCT_CONFIG.currency
    && amount === purchase.amount_minor
    && typeof currency === 'string'
    && currency.toUpperCase() === purchase.currency
}

export function evaluateStripeEvent(
  event: StripeEventLike,
  purchase: PurchasePaymentRecord | null,
): WebhookDecision {
  if (event.type !== 'checkout.session.completed' && event.type !== 'payment_intent.payment_failed') {
    return { action: 'ignore', reason: 'event_not_used' }
  }

  const object = event.data?.object
  const purchaseId = purchaseIdFromStripeEvent(event)
  if (!object || !purchaseId) return { action: 'reject', reason: 'missing_purchase_reference', status: 400 }
  if (!purchase || purchase.id !== purchaseId) return { action: 'reject', reason: 'purchase_not_found', status: 404 }

  if (event.type === 'checkout.session.completed') {
    if (object.id !== purchase.provider_checkout_id || object.client_reference_id !== purchase.id || object.mode !== 'payment') {
      return { action: 'reject', reason: 'checkout_mismatch', status: 400 }
    }
    if (!hasExpectedCommercialTerms(purchase, object.amount_total, object.currency)) {
      return { action: 'reject', reason: 'commercial_terms_mismatch', status: 400 }
    }
    if (object.payment_status !== 'paid') return { action: 'ignore', reason: 'payment_not_paid' }
    if (typeof object.payment_intent !== 'string' || !object.payment_intent) {
      return { action: 'reject', reason: 'missing_payment_intent', status: 400 }
    }
    if (purchase.payment_status === 'paid') {
      return purchase.provider_payment_id === object.payment_intent
        ? { action: 'duplicate', reason: 'payment_already_processed' }
        : { action: 'reject', reason: 'payment_id_mismatch', status: 409 }
    }
    if (purchase.payment_status === 'refunded') return { action: 'reject', reason: 'purchase_refunded', status: 409 }
    return { action: 'mark_paid', purchaseId, paymentId: object.payment_intent }
  }

  if (!hasExpectedCommercialTerms(purchase, object.amount, object.currency)) {
    return { action: 'reject', reason: 'commercial_terms_mismatch', status: 400 }
  }
  if (typeof object.id !== 'string' || !object.id) {
    return { action: 'reject', reason: 'missing_payment_intent', status: 400 }
  }
  if (purchase.payment_status === 'paid' || purchase.payment_status === 'refunded') {
    return { action: 'ignore', reason: 'purchase_not_fail-able' }
  }
  if (purchase.payment_status === 'failed') return { action: 'duplicate', reason: 'failure_already_processed' }
  return { action: 'mark_failed', purchaseId, paymentId: object.id }
}

function decodeHex(value: string): Uint8Array | null {
  if (!/^[0-9a-f]{64}$/i.test(value)) return null
  return new Uint8Array(value.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)))
}

export async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  nowMs = Date.now(),
): Promise<boolean> {
  if (!payload || !signatureHeader || !secret) return false
  const fields = signatureHeader.split(',').map((part) => part.trim())
  const timestampText = fields.find((field) => field.startsWith('t='))?.slice(2)
  const timestamp = Number(timestampText)
  const signatures = fields.filter((field) => field.startsWith('v1=')).map((field) => field.slice(3))
  if (!timestampText || !Number.isInteger(timestamp) || Math.abs(nowMs / 1000 - timestamp) > 300) return false

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
  )
  const signedPayload = new TextEncoder().encode(`${timestampText}.${payload}`)
  for (const signature of signatures) {
    const bytes = decodeHex(signature)
    const signatureBuffer = bytes?.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer | undefined
    if (signatureBuffer && await crypto.subtle.verify('HMAC', key, signatureBuffer, signedPayload)) return true
  }
  return false
}

export function reportGenerationCanBeClaimed(
  status: 'pending' | 'authorized' | 'generating' | 'generated' | 'failed',
  generationStartedAt: string | null,
  nowMs = Date.now(),
): boolean {
  if (status === 'authorized' || status === 'failed') return true
  if (status !== 'generating' || !generationStartedAt) return false
  return Date.parse(generationStartedAt) < nowMs - 10 * 60 * 1000
}
