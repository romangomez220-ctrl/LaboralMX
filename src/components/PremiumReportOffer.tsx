import { useEffect, useRef, useState } from 'react'
import { PAID_REPORTS_CONFIG, formatReportPrice } from '../config/paidReports'
import type { PaidReportSnapshot } from '../reports/types'
import { createReportCheckout } from '../reports/api'
import { trackPaidReport } from '../utils/analytics'
import { storeReportRecoveryToken } from '../reports/recovery'

interface Props { snapshot: PaidReportSnapshot }

export default function PremiumReportOffer({ snapshot }: Props) {
  const viewed = useRef(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (viewed.current) return
    viewed.current = true
    trackPaidReport('offer_viewed', snapshot.calculatorType)
  }, [snapshot.calculatorType])

  async function beginCheckout() {
    try {
      setLoading(true)
      setError(false)
      const checkout = await createReportCheckout(snapshot)
      storeReportRecoveryToken(checkout.purchaseId, checkout.recoveryToken)
      trackPaidReport('checkout_started', snapshot.calculatorType)
      window.location.assign(checkout.checkoutUrl)
    } catch {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-gold/70 bg-gradient-to-br from-white to-ivory p-5 shadow-sm sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Reporte ROMANUS</p>
      <h2 className="mt-2 text-2xl font-semibold text-primary">Descarga tu resultado como Reporte ROMANUS</h2>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Convierte el resultado gratuito en un documento profesional con folio, metodología y próximos pasos.
      </p>
      <ul className="mt-5 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
        {['Resumen ejecutivo', 'Datos utilizados y resultados', 'Metodología explicada', 'Checklist de verificación', 'Documento listo para conservar o compartir', 'Folio ROMANUS'].map((item) => (
          <li key={item} className="flex gap-2"><span className="font-bold text-success">✓</span>{item}</li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" onClick={beginCheckout} disabled={loading}
          className="min-h-12 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light disabled:cursor-wait disabled:bg-gray-400">
          {loading ? 'Preparando pago…' : `Generar mi reporte — ${formatReportPrice()}`}
        </button>
        <p className="text-sm text-gray-600">Pago único · Producto digital</p>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">No fue posible iniciar el pago. Inténtalo nuevamente.</p>}
      <p className="mt-4 text-xs text-stone">
        Tu cálculo y sus resultados permanecen disponibles gratuitamente. El pago corresponde únicamente a la generación del reporte descargable.
      </p>
    </section>
  )
}
