import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Disclaimer from '../components/Disclaimer'
import PaidReportRecovery from '../components/PaidReportRecovery'
import PremiumReportOffer from '../components/PremiumReportOffer'
import ResultConfidenceStamp from '../components/ResultConfidenceStamp'
import { PAID_REPORTS_CONFIG } from '../config/paidReports'
import { resolveReportDraft } from '../reports/draftVault'
import { resolveReportRecoveryToken } from '../reports/recovery'
import type { PaidReportCalculator } from '../reports/types'
import type { TipoCalculo } from '../types/labor'
import { trackResultAction, trackResultViewed } from '../utils/analytics'
import { formatCurrency } from '../utils/formatCurrency'

interface PublicResult {
  tipo: TipoCalculo
  totalEstimado: number
}

interface ResultNavigationState {
  reportDraftId?: string
  publicResult?: PublicResult
}

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationState = location.state as ResultNavigationState | null
  const publicResult = navigationState?.publicResult
  const reportDraftId = navigationState?.reportDraftId
  const reportSnapshot = resolveReportDraft(reportDraftId)
  const query = new URLSearchParams(location.search)
  const reportPurchaseId = query.get('report_purchase')
  const reportToken = resolveReportRecoveryToken(reportPurchaseId, query.get('report_token'))
  const checkoutState = query.get('checkout')
  const [generatedAt] = useState(() => new Date())

  useEffect(() => {
    if (publicResult) trackResultViewed(publicResult.tipo)
  }, [publicResult])

  if (!publicResult && reportPurchaseId && reportToken) {
    return <PaidReportRecovery purchaseId={reportPurchaseId} recoveryToken={reportToken} checkoutState={checkoutState} />
  }

  if (!publicResult) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-gray-700">No hay un resultado para mostrar. Realiza un cálculo primero.</p>
        <Link
          to="/productos/laboralmx"
          className="rounded-lg bg-primary px-5 py-2 font-semibold text-white transition hover:bg-primary-light"
        >
          Ir al inicio
        </Link>
      </div>
    )
  }

  const calculatorPath = publicResult.tipo === 'finiquito'
    ? '/productos/laboralmx/finiquito'
    : '/productos/laboralmx/liquidacion'
  const premiumAvailable = PAID_REPORTS_CONFIG.enabled && Boolean(reportSnapshot)

  return (
    <div className="flex flex-col gap-5">
      <section className="overflow-hidden rounded-2xl border border-gold/60 bg-gradient-to-br from-white via-ivory to-success-light p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Estimación gratuita</p>
            <h1 className="mt-1 text-2xl font-bold text-primary sm:text-3xl">
              {publicResult.tipo === 'finiquito' ? 'Finiquito estimado' : 'Liquidación estimada'}
            </h1>
            <p
              className="mt-4 text-4xl font-bold tracking-tight text-success sm:text-5xl"
              aria-label={`Total estimado ${formatCurrency(publicResult.totalEstimado)}`}
            >
              {formatCurrency(publicResult.totalEstimado)}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
              Este monto es un cálculo orientativo elaborado con los datos que capturaste. No constituye asesoría legal ni sustituye la revisión de documentos y circunstancias particulares.
            </p>
          </div>
          <ResultConfidenceStamp generatedAt={generatedAt} />
        </div>
        <div className="romanus-result-rule mt-5" aria-hidden="true" />
      </section>

      {premiumAvailable && reportSnapshot && (
        <PremiumReportOffer
          calculatorType={publicResult.tipo as PaidReportCalculator}
          resolveSnapshot={() => resolveReportDraft(reportDraftId)}
        />
      )}

      {!premiumAvailable && PAID_REPORTS_CONFIG.enabled && (
        <section className="rounded-xl border border-amber-200 bg-warning-light p-4 text-sm text-warning">
          Para proteger el detalle de tu cálculo, no lo guardamos en el navegador. Modifica o confirma nuevamente tus datos para preparar el reporte PDF.
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          trackResultAction(publicResult.tipo, 'new_calculation')
          navigate(calculatorPath)
        }}
        className="min-h-12 self-start rounded-lg border border-gray-300 bg-white px-5 py-2 font-semibold text-primary transition hover:border-primary"
      >
        Modificar datos
      </button>

      <Disclaimer compact />
    </div>
  )
}
