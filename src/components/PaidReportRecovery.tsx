import { useEffect, useState } from 'react'
import { recoverPaidReport, type ReportAccessResult } from '../reports/api'
import { trackPaidReport } from '../utils/analytics'
import type { PaidReportCalculator } from '../reports/types'

interface Props {
  purchaseId: string
  recoveryToken: string
  checkoutState: string | null
  calculatorType?: PaidReportCalculator
}

export default function PaidReportRecovery({ purchaseId, recoveryToken, checkoutState, calculatorType = 'liquidacion' }: Props) {
  const [report, setReport] = useState<ReportAccessResult>({ status: 'pending' })
  const [error, setError] = useState(false)

  useEffect(() => {
    if (checkoutState === 'cancelled') return
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0
    const trackConfirmedPayment = () => {
      const paymentKey = `romanus_pdf_payment_tracked_${purchaseId}`
      if (!localStorage.getItem(paymentKey)) {
        trackPaidReport('payment_succeeded', calculatorType)
        localStorage.setItem(paymentKey, '1')
      }
    }
    const check = () => recoverPaidReport(purchaseId, recoveryToken, trackConfirmedPayment).then((result) => {
      if (!active) return
      setReport(result)
      if (result.status === 'pending' && attempts < 15) {
        attempts += 1
        timer = setTimeout(check, 2000)
        return
      }
      if (result.status === 'generated') {
        const generatedKey = `romanus_pdf_generated_tracked_${purchaseId}`
        if (!localStorage.getItem(generatedKey)) {
          trackPaidReport('generated', calculatorType)
          localStorage.setItem(generatedKey, '1')
        }
      } else if (result.status === 'failed') {
        const failedKey = `romanus_pdf_payment_failed_tracked_${purchaseId}`
        if (!localStorage.getItem(failedKey)) {
          trackPaidReport('payment_failed', calculatorType)
          localStorage.setItem(failedKey, '1')
        }
      }
    }).catch(() => active && setError(true))
    check()
    return () => { active = false; if (timer) clearTimeout(timer) }
  }, [purchaseId, recoveryToken, checkoutState, calculatorType])

  if (checkoutState === 'cancelled') return <p className="rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-700">El pago fue cancelado. No se realizó ningún cargo confirmado.</p>
  if (error) return <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">No pudimos recuperar el reporte en este momento. Conserva esta dirección e inténtalo nuevamente.</p>
  if (report.status === 'pending') return <p className="rounded-lg border border-gold/60 bg-ivory p-4 text-sm text-primary">Estamos confirmando el pago con Stripe. No cierres esta página.</p>
  if (report.status === 'generated' && report.downloadUrl) return (
    <section className="rounded-2xl border-2 border-success bg-success-light p-5">
      <h1 className="text-2xl font-semibold text-primary">Tu reporte está listo</h1>
      <p className="mt-2 text-sm text-gray-700">Folio {report.folio}. El enlace de descarga es temporal.</p>
      <a href={report.downloadUrl} onClick={() => trackPaidReport('downloaded', calculatorType)}
        className="mt-4 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-light">Descargar Reporte ROMANUS</a>
    </section>
  )
  return null
}
