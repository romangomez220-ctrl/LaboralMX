export type ActividadPrincipal =
  | 'servicios_profesionales'
  | 'actividad_empresarial'
  | 'comercio'
  | 'arrendamiento'
  | 'freelance'
  | 'otra'

export type TipoFacturacion = 'personas_fisicas' | 'personas_morales' | 'ambas'

export type SituacionEmpleados = 'sin_empleados' | 'con_empleados'

export type SituacionIVA = 'cobra' | 'no_cobra' | 'no_seguro'

export type SituacionActual = 'dado_de_alta' | 'quiere_alta' | 'no_seguro'

export type NivelConfianza = 'alto' | 'medio' | 'bajo'

export interface ResicoFormData {
  ingresoMensual: number
  actividad: ActividadPrincipal
  facturacion: TipoFacturacion
  gastosMensuales: number
  empleados: SituacionEmpleados
  iva: SituacionIVA
  situacion: SituacionActual
}

export interface TramoResico {
  limiteInferior: number
  limiteSuperior: number
  tasa: number
}

export interface ResultadoResico {
  ingresoMensual: number
  ingresoAnual: number
  tasa: number
  isrMensual: number
  isrAnual: number
  ingresoNetoMensual: number
  elegible: boolean
  diagnostico: string
  confianza: NivelConfianza
  factoresConfianza: string[]
  recomendaciones: string[]
  remanenteDespuesDeGastos: number
}
