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
  formula?: string
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

// --- Módulos independientes (SDI, Aguinaldo, Vacaciones) ---
// No reemplazan ni modifican el flujo de Finiquito/Liquidación.

export interface SDIFormData {
  fechaIngreso: string
  salarioMensual: number
}

export interface ResultadoSDI {
  salarioDiario: number
  diasVacacionesAplicados: number
  factorIntegracion: number
  sdi: number
  antiguedadTexto: string
}

export interface AguinaldoFormData {
  fechaIngreso: string
  salarioMensual: number
}

export interface ResultadoAguinaldoEstimado {
  salarioDiario: number
  diasComputados: number
  aguinaldoEstimado: number
  fechaCorte: string
}

export interface VacacionesFormData {
  fechaIngreso: string
  salarioMensual: number
  diasDisfrutados: number
}

export interface ResultadoVacacionesEstimadas {
  salarioDiario: number
  antiguedadTexto: string
  diasVacacionesCorrespondientes: number
  diasDisfrutados: number
  diasPendientes: number
  valorPendiente: number
  primaVacacional: number
  totalEstimado: number
}
