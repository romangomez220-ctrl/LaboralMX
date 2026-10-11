import { Link, useLocation } from 'react-router-dom'
import PaidReportRecovery from '../components/PaidReportRecovery'
import { resolveReportRecoveryToken } from '../reports/recovery'
import type { PaidReportCalculator } from '../reports/types'

const CALCULATORS = new Set<PaidReportCalculator>(['liquidacion', 'finiquito', 'aguinaldo', 'vacaciones', 'sdi'])

export default function PaidReportPage() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const purchaseId = query.get('report_purchase')
  const reportToken = resolveReportRecoveryToken(purchaseId, query.get('report_token'))
  const checkoutState = query.get('checkout')
  const candidate = query.get('calculator') as PaidReportCalculator | null
  const calculatorType = candidate && CALCULATORS.has(candidate) ? candidate : 'liquidacion'

  if (!purchaseId || !reportToken) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h1 className="text-2xl font-semibold text-primary">Reporte ROMANUS</h1>
        <p className="mt-2 text-sm text-gray-600">No encontramos una compra de reporte para recuperar.</p>
        <Link to="/laboral-suite" className="mt-4 inline-block text-sm font-semibold text-primary underline">Volver a Laboral Suite</Link>
      </section>
    )
  }

  return <PaidReportRecovery purchaseId={purchaseId} recoveryToken={reportToken} checkoutState={checkoutState} calculatorType={calculatorType} />
}
