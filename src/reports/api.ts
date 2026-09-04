import { supabase } from '../repositories/supabase/client'
import type { LiquidacionSnapshot } from './types'
import { buildLiquidacionReportModel } from './model'

interface CheckoutResponse {
  purchaseId: string
  checkoutUrl: string
  recoveryToken: string
}

export interface ReportAccessResult {
  status: 'pending' | 'failed' | 'authorized' | 'generated'
  paymentConfirmed?: boolean
  downloadUrl?: string
  folio?: string
}

async function checksum(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function recoverPaidReport(
  purchaseId: string,
  recoveryToken: string,
  onPaymentConfirmed?: () => void,
): Promise<ReportAccessResult> {
  const { data, error } = await supabase.functions.invoke('report-access', { body: { purchaseId, recoveryToken } })
  if (error) throw error
  if (data?.paymentConfirmed) onPaymentConfirmed?.()
  if (data.status !== 'authorized') return data as ReportAccessResult

  try {
    const model = buildLiquidacionReportModel(data.snapshot as LiquidacionSnapshot, {
      folio: data.folio,
      generatedAt: new Date().toISOString(),
      reportVersion: data.reportVersion,
      calculatorVersion: data.calculatorVersion,
    })
    const { premiumReportBlob } = await import('../utils/pdfGenerator')
    const blob = premiumReportBlob(model)
    const { error: uploadError } = await supabase.storage.from('paid-reports')
      .uploadToSignedUrl(data.uploadPath, data.uploadToken, blob, { contentType: 'application/pdf', upsert: true })
    if (uploadError) throw uploadError
    const { data: finalized, error: finalizeError } = await supabase.functions.invoke('finalize-report', {
      body: { purchaseId, recoveryToken, storagePath: data.uploadPath, checksum: await checksum(blob), outcome: 'generated' },
    })
    if (finalizeError) throw finalizeError
    return finalized as ReportAccessResult
  } catch (error) {
    await supabase.functions.invoke('finalize-report', {
      body: { purchaseId, recoveryToken, outcome: 'failed' },
    }).catch(() => undefined)
    throw error
  }
}

export async function createReportCheckout(snapshot: LiquidacionSnapshot): Promise<CheckoutResponse> {
  const { data, error } = await supabase.functions.invoke('create-report-checkout', {
    body: { snapshot },
  })
  if (error) throw error
  if (!data?.purchaseId || !data?.checkoutUrl || !data?.recoveryToken) {
    throw new Error('La respuesta del checkout está incompleta.')
  }
  return data as CheckoutResponse
}
