export const REPORT_PRODUCT_CONFIG = {
  priceMinor: 3900,
  currency: 'MXN',
  reportVersion: '1.1.0',
  calculatorVersion: 'laboral-2026.1',
  paymentProvider: 'stripe',
} as const

export const REPORT_PRODUCT_NAMES = {
  liquidacion: 'Reporte ROMANUS de liquidación',
  finiquito: 'Reporte ROMANUS de finiquito',
  aguinaldo: 'Reporte ROMANUS de aguinaldo',
  vacaciones: 'Reporte ROMANUS de vacaciones',
  sdi: 'Reporte ROMANUS de Salario Diario Integrado',
} as const

export type ReportProductType = keyof typeof REPORT_PRODUCT_NAMES

export function isReportProductType(value: unknown): value is ReportProductType {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(REPORT_PRODUCT_NAMES, value)
}
