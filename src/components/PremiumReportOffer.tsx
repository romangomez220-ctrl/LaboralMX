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
      trackPaidReport('checkout_failed', snapshot.calculatorType)
      setError(true)
      setLoading(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-gold/70 bg-gradient-to-br from-white via-ivory to-success-light/40 shadow-md">
      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Reporte ROMANUS Premium</p>
            <span className="rounded-full border border-green-200 bg-white px-2.5 py-1 text-xs font-semibold text-success">
              Entrega digital inmediata
            </span>
          </div>
          <h2 className="mt-3 max-w-2xl font-serif text-2xl font-semibold leading-tight text-primary sm:text-3xl">
            Convierte tu estimación en un documento claro para revisar, negociar o compartir
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            El total gratuito te orienta. El reporte organiza el caso, explica los conceptos y deja por escrito qué conviene verificar antes de aceptar una propuesta.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ['Entiende cada cifra', 'Desglose, metodología y supuestos en un solo documento.'],
              ['Detecta qué revisar', 'Alertas prácticas y checklist de información pendiente.'],
              ['Llévalo contigo', 'PDF con folio para conservar o compartir con quien te asesore.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border border-white/80 bg-white/80 p-3 shadow-sm">
                <p className="text-sm font-semibold text-primary"><span className="mr-1 text-success">✓</span>{title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-600">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={beginCheckout}
              disabled={loading}
              className="min-h-12 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:bg-gray-400"
            >
              {loading ? 'Preparando pago seguro…' : `Desbloquear reporte completo — ${formatReportPrice()}`}
            </button>
            <div className="text-xs leading-5 text-gray-600">
              <p className="font-semibold text-primary">Pago único procesado por Stripe</p>
              <p>Sin suscripción · Descarga al confirmarse el pago</p>
            </div>
          </div>
          {error && (
            <p role="alert" aria-live="polite" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              No fue posible abrir el pago seguro. Tu resultado no se perdió; inténtalo nuevamente en unos momentos.
            </p>
          )}
          <p className="mt-4 text-xs leading-5 text-stone">
            Tu cálculo permanece disponible gratuitamente. El pago corresponde al documento Premium, su estructura de revisión y la descarga protegida.
          </p>
        </div>

        <div className="border-t border-gold/40 bg-primary p-5 text-white lg:border-l lg:border-t-0 sm:p-7" aria-label="Vista previa del Reporte ROMANUS Premium">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Vista previa</p>
          <div className="mt-4 rounded-xl bg-white p-4 text-primary shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-200 pb-3">
              <div>
                <p className="font-serif text-lg font-semibold">Reporte ROMANUS</p>
                <p className="text-[11px] text-gray-500">Estimación laboral personalizada</p>
              </div>
              <span className="rounded bg-ivory px-2 py-1 text-[10px] font-semibold text-gold-dark">FOLIO</span>
            </div>
            <div className="mt-4 space-y-3">
              {['Resumen ejecutivo', 'Desglose y metodología', 'Puntos que debes verificar', 'Checklist y próximos pasos'].map((section, index) => (
                <div key={section} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span>
                  <span className="text-xs font-semibold">{section}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-[10px] text-gray-400">PDF profesional · generado para tu estimación</p>
          </div>
        </div>
      </div>
    </section>
  )
}
