export const REPORT_FOLIO_PATTERN = /^RMS-LAB-LIQ-[A-F0-9]{8}$/

export function isValidReportFolio(value: string): boolean {
  return REPORT_FOLIO_PATTERN.test(value)
}
