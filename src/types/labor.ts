export type TipoCalculo = 'finiquito' | 'liquidacion'

export type TipoSalidaLiquidacion =
  | 'despido_injustificado'
  | 'despido_justificado'
  | 'renuncia'

/**
 * Zona geográfica para efectos del salario mínimo vigente (relevante para
 * el tope de la prima de antigüedad del Art. 162 LFT).
 */
export type ZonaSalarioMinimo = 'general' | 'frontera_norte'

export interface FiniquitoFormData {
  fechaIngreso: string
  fechaSalida: string
  salarioMensual: number
  diasPendientes: number
  vacacionesDisfrutadas: number
  renunciaVoluntaria: boolean
  tiene15Anios: boolean
  incluirPrimaAntiguedad: boolean
  zonaSalarioMinimo: ZonaSalarioMinimo
}

export interface LiquidacionFormData {
  fechaIngreso: string
  fechaSalida: string
  salarioMensual: number
  diasPendientes: number
  vacacionesDisfrutadas: number
  tipoSalida: TipoSalidaLiquidacion
  incluirPrimaAntiguedad: boolean
  incluir20Dias: boolean
  zonaSalarioMinimo: ZonaSalarioMinimo
}

export interface ConceptoResultado {
  etiqueta: string
  monto: number
  detalle?: string
}

export interface ResultadoCalculo {
  tipo: TipoCalculo
  salarioDiario: number
  antiguedadAnios: number
  antiguedadTexto: string
  conceptos: ConceptoResultado[]
  totalEstimado: number
  veinteDiasInformativo?: ConceptoResultado
  totalConEscenarioInformativo?: number
  notas: string[]
}
