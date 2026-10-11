import { describe, expect, it, vi } from 'vitest'
import migrationSql from '../../supabase/migrations/202609020001_paid_reports.sql?raw'
import expandedMigrationSql from '../../supabase/migrations/202610110002_expand_paid_reports.sql?raw'
import accessFunctionSource from '../../supabase/functions/report-access/index.ts?raw'
import finalizeFunctionSource from '../../supabase/functions/finalize-report/index.ts?raw'
import webhookFunctionSource from '../../supabase/functions/stripe-report-webhook/index.ts?raw'
import supabaseConfig from '../../supabase/config.toml?raw'
import checkoutFunctionSource from '../../supabase/functions/create-report-checkout/index.ts?raw'
import recoveryComponentSource from '../components/PaidReportRecovery.tsx?raw'
import {
  buildStripeCheckoutParams,
  evaluateStripeEvent,
  reportGenerationCanBeClaimed,
  verifyStripeSignature,
  type PurchasePaymentRecord,
  type StripeEventLike,
} from '../../shared/reportPayments'
import { resolveReportRecoveryToken, storeReportRecoveryToken } from './recovery'
import { sanitizeAnalyticsPath, trackPaidReport } from '../utils/analytics'

const purchase: PurchasePaymentRecord = {
  id: '11111111-1111-4111-8111-111111111111',
  amount_minor: 3900,
  currency: 'MXN',
  payment_status: 'pending',
  provider_checkout_id: 'cs_test_romanus',
  provider_payment_id: null,
}

function checkoutEvent(overrides: Record<string, unknown> = {}): StripeEventLike {
  return {
    id: 'evt_test_romanus',
    type: 'checkout.session.completed',
    data: { object: {
      id: 'cs_test_romanus', mode: 'payment', amount_total: 3900, currency: 'mxn',
      payment_status: 'paid', payment_intent: 'pi_test_romanus',
      client_reference_id: purchase.id, metadata: { purchase_id: purchase.id },
      ...overrides,
    } },
  }
}

async function stripeSignature(payload: string, secret: string, timestamp: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`))
  const hex = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `t=${timestamp},v1=${hex}`
}

describe('Pagos de reportes ROMANUS', () => {
  it('construye Checkout con el precio autoritativo de $39 MXN', () => {
    const params = buildStripeCheckoutParams(purchase.id, 'https://preview.romanus.mx/success', 'https://preview.romanus.mx/cancel')
    expect(params.get('line_items[0][price_data][unit_amount]')).toBe('3900')
    expect(params.get('line_items[0][price_data][currency]')).toBe('mxn')
    expect(params.get('client_reference_id')).toBe(purchase.id)
  })

  it('no acepta un precio proveniente del frontend', () => {
    const manipulatedFrontendPayload = { amount_minor: 1, currency: 'usd' }
    const params = buildStripeCheckoutParams(purchase.id, 'https://romanus.mx/success', 'https://romanus.mx/cancel')
    expect(params.get('line_items[0][price_data][unit_amount]')).not.toBe(String(manipulatedFrontendPayload.amount_minor))
    expect(params.get('line_items[0][price_data][currency]')).not.toBe(manipulatedFrontendPayload.currency)
  })

  it('acepta una firma Stripe válida y rechaza firma inválida o vencida', async () => {
    const payload = JSON.stringify(checkoutEvent())
    const secret = 'whsec_test_romanus'
    const now = 1_800_000_000_000
    const header = await stripeSignature(payload, secret, now / 1000)
    expect(await verifyStripeSignature(payload, header, secret, now)).toBe(true)
    expect(await verifyStripeSignature(`${payload}x`, header, secret, now)).toBe(false)
    expect(await verifyStripeSignature(payload, header, secret, now + 301_000)).toBe(false)
  })

  it('autoriza únicamente una sesión válida y pagada', () => {
    expect(evaluateStripeEvent(checkoutEvent(), purchase)).toEqual({
      action: 'mark_paid', purchaseId: purchase.id, paymentId: 'pi_test_romanus',
    })
    expect(evaluateStripeEvent(checkoutEvent({ payment_status: 'unpaid' }), purchase)).toMatchObject({ action: 'ignore' })
  })

  it('rechaza amount, currency, Checkout ID o compra inexistente', () => {
    expect(evaluateStripeEvent(checkoutEvent({ amount_total: 3800 }), purchase)).toMatchObject({ action: 'reject' })
    expect(evaluateStripeEvent(checkoutEvent({ currency: 'usd' }), purchase)).toMatchObject({ action: 'reject' })
    expect(evaluateStripeEvent(checkoutEvent({ id: 'cs_other' }), purchase)).toMatchObject({ action: 'reject' })
    expect(evaluateStripeEvent(checkoutEvent(), null)).toMatchObject({ action: 'reject', reason: 'purchase_not_found' })
  })

  it('trata un webhook repetido como idempotente', () => {
    const paid = { ...purchase, payment_status: 'paid' as const, provider_payment_id: 'pi_test_romanus' }
    expect(evaluateStripeEvent(checkoutEvent(), paid)).toMatchObject({ action: 'duplicate' })
  })

  it('registra fallos de PaymentIntent sin degradar una compra pagada', () => {
    const failedEvent: StripeEventLike = {
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_failed', amount: 3900, currency: 'mxn', metadata: { purchase_id: purchase.id } } },
    }
    expect(evaluateStripeEvent(failedEvent, purchase)).toMatchObject({ action: 'mark_failed' })
    expect(evaluateStripeEvent(failedEvent, { ...purchase, payment_status: 'paid' })).toMatchObject({ action: 'ignore' })
  })

  it('permite reintentar una generación fallida, pero no una activa reciente o terminada', () => {
    expect(reportGenerationCanBeClaimed('failed', null)).toBe(true)
    expect(reportGenerationCanBeClaimed('authorized', null)).toBe(true)
    expect(reportGenerationCanBeClaimed('generating', new Date().toISOString())).toBe(false)
    expect(reportGenerationCanBeClaimed('generated', null)).toBe(false)
    expect(reportGenerationCanBeClaimed('generating', '2020-01-01T00:00:00.000Z')).toBe(true)
  })

  it('recupera el token opaco desde sessionStorage después de recargar', () => {
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) }
    storeReportRecoveryToken(purchase.id, 'a'.repeat(64), storage)
    expect(resolveReportRecoveryToken(purchase.id, null, storage)).toBe('a'.repeat(64))
    expect(resolveReportRecoveryToken('other', null, storage)).toBeNull()
    expect(accessFunctionSource).toContain('purchase.access_token_hash !== await sha256(recoveryToken)')
  })

  it('elimina token e ID de compra de las rutas enviadas a Analytics', () => {
    expect(sanitizeAnalyticsPath(`/resultado?report_purchase=${purchase.id}&report_token=secret&checkout=success`))
      .toBe('/resultado?checkout=success')
  })

  it('emite el embudo premium sin datos laborales ni identificadores', () => {
    const gtag = vi.fn()
    vi.stubGlobal('window', { gtag, location: { pathname: '/resultado', search: '', origin: 'https://romanus.mx' } })
    trackPaidReport('payment_succeeded', 'liquidacion')
    expect(gtag).toHaveBeenCalledWith('event', 'romanus_pdf_payment_succeeded', expect.objectContaining({
      calculator_type: 'liquidacion', report_price: 39, currency: 'MXN',
    }))
    const serialized = JSON.stringify(gtag.mock.calls)
    for (const prohibited of ['salario', 'fechaIngreso', 'telefono', 'report_token', 'purchaseId']) {
      expect(serialized).not.toContain(prohibited)
    }
    vi.unstubAllGlobals()
  })

  it('mantiene RLS, estados explícitos, unicidad y bucket PDF privado', () => {
    expect(migrationSql).toContain("payment_status in ('pending','paid','failed','refunded')")
    expect(migrationSql).toContain("report_status in ('pending','authorized','generating','generated','failed')")
    expect(migrationSql).toContain('purchase_id uuid primary key')
    expect(migrationSql).toContain('report_purchases_access_token_hash_uidx')
    expect(migrationSql).toContain('extensions.gen_random_bytes(6)')
    expect(migrationSql).toContain("values ('paid-reports', 'paid-reports', false, 5242880")
    expect(migrationSql).toContain('enable row level security')
    expect(migrationSql).toContain('revoke all on public.report_purchases from anon, authenticated')
    expect(migrationSql).not.toMatch(/alter\s+table\s+storage\.objects/i)
    expect(expandedMigrationSql).toContain("'liquidacion', 'finiquito', 'aguinaldo', 'vacaciones', 'sdi'")
    expect(expandedMigrationSql).not.toMatch(/storage\.(objects|buckets)/i)
  })

  it('usa URLs firmadas cortas, subida única y recuperación de generación fallida', () => {
    expect(accessFunctionSource).toContain("createSignedUrl(file.storage_path, 300)")
    expect(accessFunctionSource).toContain("report_status: 'generating'")
    expect(accessFunctionSource).toContain('{ upsert: true }')
    expect(finalizeFunctionSource).toContain("outcome === 'failed'")
    expect(finalizeFunctionSource).toContain("signature !== '%PDF-'")
    expect(finalizeFunctionSource).toContain(".in('report_status', ['generating', 'generated'])")
  })

  it('el webhook aplica las transiciones con condiciones idempotentes', () => {
    expect(webhookFunctionSource).toContain('verifyStripeSignature')
    expect(webhookFunctionSource).toContain(".in('payment_status', ['pending', 'failed'])")
    expect(webhookFunctionSource).toContain(".eq('payment_status', 'pending')")
    expect(supabaseConfig).toContain('[functions.stripe-report-webhook]\nverify_jwt = false')
    expect(supabaseConfig).toContain('[functions.report-access]\nverify_jwt = true')
  })

  it('conserva estados seguros ante error de Stripe y retorno cancelado', () => {
    expect(checkoutFunctionSource).toContain("if (!stripeResponse.ok")
    expect(checkoutFunctionSource).toContain("update({ payment_status: 'failed' })")
    expect(recoveryComponentSource).toContain("if (checkoutState === 'cancelled') return")
    expect(recoveryComponentSource).toContain('recoverPaidReport(purchaseId, recoveryToken, trackConfirmedPayment)')
  })
})
