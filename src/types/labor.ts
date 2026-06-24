export type TipoCalculo = 'finiquito' | 'liquidacion'

export type TipoSalidaLiquidacion =
  | 'despido_injustificado'
  | 'despido_justificado'
  | 'renuncia'
  | 'mutuo_acuerdo'
  | 'fallecimiento'
  | 'incapacidad'

/**
 * Zona geográfica para efectos del salario mínimo vigente (relevante para
 * el tope de la prima de antigüedad del Art. 162 LFT).
 */
export type ZonaSalarioMinimo = 'general' | 'frontera_norte'

/**
 * Forma en que el usuario capturó el salario. "diario" se usa
 * directamente; "mensual" se convierte internamente a diario dividiendo
 * entre 30 (criterio ya usado en todo ROMANUS desde la primera versión).
 * Se guarda en el resultado para mostrar siempre, de forma transparente,
 * qué capturó el usuario y qué conversión se aplicó.
 */
export type TipoCapturaSalarial = 'diario' | 'mensual'

export interface FiniquitoFormData {
  fechaIngreso: string
  fechaSalida: string
  salarioBase: number
  tipoSalario: TipoCapturaSalarial
  diasPendientes: number
  vacacionesDisfrutadas: number
  renunciaVoluntaria: boolean
  incluirPrimaAntiguedad: boolean
  zonaSalarioMinimo: ZonaSalarioMinimo
}

export interface LiquidacionFormData {
  fechaIngreso: string
  fechaSalida: string
  salarioBase: number
  tipoSalario: TipoCapturaSalarial
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
  salarioBase: number
  tipoSalario: TipoCapturaSalarial
  salarioDiario: number
  antiguedadAnios: number
  antiguedadTexto: string
  conceptos: ConceptoResultado[]
  totalEstimado: number
  veinteDiasInformativo?: ConceptoResultado
  totalConEscenarioInformativo?: number
  /**
   * Prima de antigüedad calculada pero NO sumada al total principal,
   * porque el supuesto de terminación (mutuo acuerdo, incapacidad, u
   * "otro" en Finiquito) no tiene un tratamiento legal automático y
   * cierto como sí lo tienen renuncia con 15+ años, despido o
   * fallecimiento. Se muestra de forma informativa, separada, para que
   * el usuario y/o un profesional la revisen antes de asumirla como
   * parte del total.
   */
  primaAntiguedadInformativa?: ConceptoResultado
  notas: string[]
}

// --- Módulos independientes (SDI, Aguinaldo, Vacaciones) ---
// No reemplazan ni modifican el flujo de Finiquito/Liquidación.

export interface SDIFormData {
  fechaIngreso: string
  salarioBase: number
  tipoSalario: TipoCapturaSalarial
}

export interface ResultadoSDI {
  salarioBase: number
  tipoSalario: TipoCapturaSalarial
  salarioDiario: number
  diasVacacionesAplicados: number
  factorIntegracion: number
  sdi: number
  antiguedadTexto: string
}

export interface AguinaldoFormData {
  fechaIngreso: string
  salarioBase: number
  tipoSalario: TipoCapturaSalarial
}

export interface ResultadoAguinaldoEstimado {
  salarioBase: number
  tipoSalario: TipoCapturaSalarial
  salarioDiario: number
  diasComputados: number
  aguinaldoEstimado: number
  fechaCorte: string
}

export interface VacacionesFormData {
  fechaIngreso: string
  salarioBase: number
  tipoSalario: TipoCapturaSalarial
  diasDisfrutados: number
}

export interface ResultadoVacacionesEstimadas {
  salarioBase: number
  tipoSalario: TipoCapturaSalarial
  salarioDiario: number
  antiguedadTexto: string
  diasVacacionesCorrespondientes: number
  diasDisfrutados: number
  diasPendientes: number
  valorPendiente: number
  primaVacacional: number
  totalEstimado: number
}
