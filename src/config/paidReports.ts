import { REPORT_PRODUCT_CONFIG } from '../../shared/reportConfig'

export const PAID_REPORTS_CONFIG = {
  ...REPORT_PRODUCT_CONFIG,
  enabled: (import.meta.env.VITE_PAID_REPORTS_ENABLED ?? 'false') === 'true',
  freeLaborOrientationEnabled:
    (import.meta.env.VITE_FREE_LABOR_ORIENTATION_ENABLED ?? 'false') === 'true',
} as const

export function formatReportPrice(): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: PAID_REPORTS_CONFIG.currency,
    maximumFractionDigits: 0,
  }).format(PAID_REPORTS_CONFIG.priceMinor / 100)
}
