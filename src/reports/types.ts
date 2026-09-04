import type { ResultadoCalculo, TipoCapturaSalarial, TipoSalidaLiquidacion, ZonaSalarioMinimo } from '../types/labor'
import type { PracticalGuide } from './practicalGuide'

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

export interface ReportModel {
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

export interface ReportMetadata {
  folio: string
  generatedAt: string
  reportVersion: string
  calculatorVersion: string
}
