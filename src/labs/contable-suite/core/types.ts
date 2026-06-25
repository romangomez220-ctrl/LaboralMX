/**
 * types.ts — Contable Suite (Labs)
 * -----------------------------------------------------------------------------
 * Tipos compartidos por las 4 herramientas de esta ronda. Cada resultado incluye
 * un campo de fundamento legal explícito (artículo, regla RMF, decreto), no solo
 * la fórmula aritmética — requisito explícito de esta ronda, dado que el
 * resultado será revisado por contadores, fiscalistas, abogados y un
 * secretario de tribunal colegiado.
 * -----------------------------------------------------------------------------
 */

export interface ConceptoConFundamento {
  etiqueta: string
  monto: number
  formula: string
  fundamento: string
}

// ---------- 1. Calculadora de Devolución de Impuestos (asalariados) ----------

export type NivelEducativo = 'preescolar' | 'primaria' | 'secundaria' | 'profesional_tecnico' | 'bachillerato'

export interface ColegiaturaCaptura {
  nivel: NivelEducativo
  monto: number
}

export interface DevolucionFormData {
  ingresoAnual: number
  isrRetenido: number
  tuvoMasDeUnPatron: boolean
  gastosMedicos: number
  colegiaturas: ColegiaturaCaptura[]
  donativos: number
  donativosGobierno: number
  interesesRealesHipotecarios: number
  aportacionesRetiroAfore: number
}

export interface DevolucionResultado {
  topeGlobalAplicable: number
  topeGlobalCriterio: '15%_ingreso' | '5_uma_anual'
  totalDeduccionesDentroDeTope: number
  totalColegiaturas: number
  totalColegiaturasTopeAplicado: number
  donativosTopeAplicado: number
  totalDeduccionesPersonales: number
  ingresoAnual: number
  baseGravableDespuesDeducciones: number
  isrRetenidoTotal: number
  conceptos: ConceptoConFundamento[]
  notas: string[]
}

// ---------- 2. Calculadora de Declaración Anual RESICO (¿aplica o no?) ----------

export type ResultadoObligacionResico = 'no_obligado' | 'obligado' | 'zona_gris'

export interface ResicoAnualFormData {
  pagosMensualesCompletos: boolean
  permanecioTodoElAnoEnResico: boolean
  noExcedioTopeAnual: boolean
  sinIngresosFueraDeResico: boolean
  tieneIngresosEnCopropiedad: boolean
  esAgapes: boolean
  tuvoSuspensionActividades: boolean
  fueExcluidoAMitadDeAno: boolean
}

export interface ResicoAnualResultado {
  resultado: ResultadoObligacionResico
  fundamento: string
  explicacion: string
  notas: string[]
}

// ---------- 3. Comparador de Arrendamiento: Deducción Ciega vs. Real ----------

export interface GastosRealesArrendamiento {
  predial: number
  mantenimiento: number
  segurosYComisiones: number
  interesesRealesHipotecarios: number
  depreciacionConstruccion: number
}

export interface ArrendamientoFormData {
  ingresoAnual: number
  esCopropiedad: boolean
  porcentajeCopropiedad: number
  predialPagado: number
  gastosReales: GastosRealesArrendamiento
}

export interface ArrendamientoResultado {
  baseGravableCiega: number
  baseGravableReal: number
  totalGastosReales: number
  diferencia: number
  recomendacion: 'ciega' | 'real' | 'equivalente'
  conceptos: ConceptoConFundamento[]
  notas: string[]
}

// ---------- 4. Calculadora de Retenciones por Plataformas Digitales 2026 ----------

export type TipoActividadPlataforma = 'transporte_entrega' | 'hospedaje' | 'venta_servicios_general'
export type TipoContribuyentePlataforma = 'persona_fisica' | 'persona_moral'

export interface PlataformasFormData {
  tipoActividad: TipoActividadPlataforma
  tipoContribuyente: TipoContribuyentePlataforma
  tieneRfcRegistrado: boolean
  ingresosBrutosMes: number
  ingresosAcumuladosAnio: number
  facturaAdicionalFueraDePlataforma: boolean
}

export interface PlataformasResultado {
  tasaIsrAplicada: number
  tasaIvaAplicada: number
  montoRetencionIsr: number
  montoRetencionIva: number
  netoARecibir: number
  posibleConsiderarPagoDefinitivo: boolean
  conceptos: ConceptoConFundamento[]
  notas: string[]
}
