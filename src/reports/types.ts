import type { ResultadoCalculo, TipoCapturaSalarial, TipoSalidaLiquidacion, ZonaSalarioMinimo } from '../types/labor'
import type { PracticalGuide } from './practicalGuide'

export type PaidReportCalculator = 'liquidacion' | 'finiquito' | 'aguinaldo' | 'vacaciones' | 'sdi'

export interface ReportDisplayRow {
  label: string
  value: string
  detail?: string
}

export interface StandardLaborReportSnapshot {
  calculatorType: Exclude<PaidReportCalculator, 'liquidacion'>
  title: string
  description: string
  captured: ReportDisplayRow[]
  results: ReportDisplayRow[]
  summary: ReportDisplayRow
  checklist: string[]
  methodology: string[]
  disclaimer: string
}

export interface LiquidacionSnapshot {
  calculatorType: 'liquidacion'
  fechaIngreso: string
  fechaSalida: string
  salarioBase: number
  tipoSalario: TipoCapturaSalarial
  salarioDiarioIntegradoCapturado?: number
  diasPendientes: number
  vacacionesDisfrutadas: number
  tipoSalida: TipoSalidaLiquidacion
  incluirPrimaAntiguedad: boolean
  incluir20Dias: boolean
  zonaSalarioMinimo: ZonaSalarioMinimo
  resultado: ResultadoCalculo
}

export interface ReportInsight {
  id: string
  text: string
}

export interface LiquidacionReportModel {
  calculatorType: 'liquidacion'
  title: string
  folio: string
  generatedAt: string
  reportVersion: string
  calculatorVersion: string
  snapshot: LiquidacionSnapshot
  resultado: ResultadoCalculo
  insights: ReportInsight[]
  checklist: string[]
  practicalGuide: PracticalGuide
}

export interface StandardLaborReportModel extends StandardLaborReportSnapshot, ReportMetadata {
  calculatorType: StandardLaborReportSnapshot['calculatorType']
}

export type PaidReportSnapshot = LiquidacionSnapshot | StandardLaborReportSnapshot
export type ReportModel = LiquidacionReportModel | StandardLaborReportModel

export interface ReportMetadata {
  folio: string
  generatedAt: string
  reportVersion: string
  calculatorVersion: string
}
