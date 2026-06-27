export type TipoDiasTermino = 'habiles' | 'naturales'
export type AjusteInicioTermino = 'dia_siguiente' | 'misma_fecha'
export type MateriaTermino = 'amparo' | 'civil_familiar' | 'laboral' | 'personalizado'

export interface ReglaTermino {
  id: string
  materia: MateriaTermino
  nombre: string
  dias: number
  tipoDias: TipoDiasTermino
  ajusteInicioDefault: AjusteInicioTermino
  fundamento: string
  baseComputo: string
  advertencias: string[]
}

export interface TerminosProcesalesFormData {
  reglaId: string
  fechaBase: string
  diasPersonalizados?: number
  tipoDiasPersonalizado?: TipoDiasTermino
  ajusteInicio?: AjusteInicioTermino
  diasInhabilesAdicionales?: string[]
  prorrogarSiVenceInhabil?: boolean
}

export interface DiaComputado {
  fecha: string
  cuenta: boolean
  razon: string
  numeroDiaComputable: number | null
}

export interface TerminosProcesalesResultado {
  regla: ReglaTermino
  fechaInicioComputo: string
  fechaVencimiento: string
  fechaVencimientoOriginal: string
  diasComputados: DiaComputado[]
  diasInhabilesAplicados: string[]
  advertencias: string[]
  fundamento: string
  resumen: string
}

const MS_DIA = 24 * 60 * 60 * 1000

export const REGLAS_TERMINOS: ReglaTermino[] = [
  {
    id: 'amparo_regla_general_15',
    materia: 'amparo',
    nombre: 'Amparo: regla general para presentar demanda',
    dias: 15,
    tipoDias: 'habiles',
    ajusteInicioDefault: 'dia_siguiente',
    fundamento: 'Ley de Amparo, artículo 17, regla general de quince días; artículos 18 y 19 para inicio de cómputo y días hábiles.',
    baseComputo: 'Parte de la fecha del acto, notificación o conocimiento y cuenta desde el día siguiente, salvo supuesto especial.',
    advertencias: [
      'Verifica si el caso cae en una excepción del artículo 17 de la Ley de Amparo.',
      'Revisa acuerdos de suspensión de labores del órgano jurisdiccional antes de presentar.',
    ],
  },
  {
    id: 'amparo_norma_autoaplicativa_30',
    materia: 'amparo',
    nombre: 'Amparo: norma general autoaplicativa',
    dias: 30,
    tipoDias: 'habiles',
    ajusteInicioDefault: 'dia_siguiente',
    fundamento: 'Ley de Amparo, artículo 17, fracción I: treinta días cuando se reclama una norma general autoaplicativa.',
    baseComputo: 'Parte del día de entrada en vigor de la norma o del primer acto de aplicación, según estrategia del caso.',
    advertencias: [
      'Confirma si la norma es autoaplicativa o heteroaplicativa; la clasificación cambia la estrategia y el momento de impugnación.',
      'No uses este supuesto para actos de aplicación ordinarios sin revisar el acto reclamado.',
    ],
  },
  {
    id: 'cnpcf_contestacion_demanda_15',
    materia: 'civil_familiar',
    nombre: 'CNPCF: contestación de demanda',
    dias: 15,
    tipoDias: 'habiles',
    ajusteInicioDefault: 'dia_siguiente',
    fundamento: 'Código Nacional de Procedimientos Civiles y Familiares, artículo 239: plazo de quince días para contestar demanda.',
    baseComputo: 'Parte del emplazamiento o de la fecha en que surta efectos la notificación, según el caso concreto.',
    advertencias: [
      'El CNPCF tiene aplicación gradual por entidad y autoridad. Confirma si ya rige para el órgano que conoce del asunto.',
      'Revisa si la notificación surtió efectos el mismo día o al día siguiente conforme a la vía utilizada.',
    ],
  },
  {
    id: 'laboral_conciliacion_prejudicial_45',
    materia: 'laboral',
    nombre: 'Laboral: duración máxima de conciliación prejudicial',
    dias: 45,
    tipoDias: 'naturales',
    ajusteInicioDefault: 'misma_fecha',
    fundamento: 'Ley Federal del Trabajo, artículo 684-D: el procedimiento de conciliación no debe exceder de cuarenta y cinco días naturales.',
    baseComputo: 'Parte de la presentación de la solicitud de conciliación prejudicial.',
    advertencias: [
      'Este cálculo estima duración máxima del procedimiento, no sustituye el análisis de prescripción de acciones laborales.',
      'Verifica citatorios, constancias de no conciliación y suspensión/interrupción aplicable al caso.',
    ],
  },
  {
    id: 'personalizado',
    materia: 'personalizado',
    nombre: 'Plazo personalizado',
    dias: 1,
    tipoDias: 'habiles',
    ajusteInicioDefault: 'dia_siguiente',
    fundamento: 'Captura manual para validación interna. El usuario debe incorporar el fundamento aplicable en su expediente.',
    baseComputo: 'Definido por el usuario.',
    advertencias: [
      'Al usar plazo personalizado, verifica manualmente fundamento, forma de notificación y calendario del órgano.',
    ],
  },
]

export function obtenerReglaTermino(id: string): ReglaTermino {
  return REGLAS_TERMINOS.find((regla) => regla.id === id) ?? REGLAS_TERMINOS[0]
}

function parseFecha(fecha: string): Date {
  const [ano, mes, dia] = fecha.split('-').map(Number)
  return new Date(Date.UTC(ano, mes - 1, dia))
}

function formatFecha(fecha: Date): string {
  return fecha.toISOString().slice(0, 10)
}

function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getTime() + dias * MS_DIA)
}

function esFinDeSemana(fecha: Date): boolean {
  const dia = fecha.getUTCDay()
  return dia === 0 || dia === 6
}

function esInhabilManual(fecha: Date, inhabiles: Set<string>): boolean {
  return inhabiles.has(formatFecha(fecha))
}

function esDiaComputable(fecha: Date, tipoDias: TipoDiasTermino, inhabiles: Set<string>): { cuenta: boolean; razon: string } {
  if (tipoDias === 'naturales') return { cuenta: true, razon: 'Día natural' }
  if (esFinDeSemana(fecha)) return { cuenta: false, razon: 'Fin de semana' }
  if (esInhabilManual(fecha, inhabiles)) return { cuenta: false, razon: 'Inhábil capturado manualmente' }
  return { cuenta: true, razon: 'Día hábil' }
}

function avanzarAVencimientoHabil(fecha: Date, tipoDias: TipoDiasTermino, inhabiles: Set<string>): Date {
  if (tipoDias === 'naturales') {
    let cursor = fecha
    while (esFinDeSemana(cursor) || esInhabilManual(cursor, inhabiles)) {
      cursor = sumarDias(cursor, 1)
    }
    return cursor
  }

  let cursor = fecha
  while (!esDiaComputable(cursor, tipoDias, inhabiles).cuenta) {
    cursor = sumarDias(cursor, 1)
  }
  return cursor
}

export function calcularTerminoProcesal(datos: TerminosProcesalesFormData): TerminosProcesalesResultado {
  const reglaBase = obtenerReglaTermino(datos.reglaId)
  const dias = reglaBase.id === 'personalizado'
    ? Math.max(1, Math.floor(datos.diasPersonalizados ?? 1))
    : reglaBase.dias
  const tipoDias = reglaBase.id === 'personalizado'
    ? datos.tipoDiasPersonalizado ?? reglaBase.tipoDias
    : reglaBase.tipoDias
  const regla: ReglaTermino = { ...reglaBase, dias, tipoDias }
  const ajusteInicio = datos.ajusteInicio ?? regla.ajusteInicioDefault
  const prorrogar = datos.prorrogarSiVenceInhabil ?? true
  const inhabiles = new Set((datos.diasInhabilesAdicionales ?? []).filter(Boolean))

  const fechaBase = parseFecha(datos.fechaBase)
  const fechaInicio = ajusteInicio === 'dia_siguiente' ? sumarDias(fechaBase, 1) : fechaBase
  const diasComputados: DiaComputado[] = []
  let cursor = fechaInicio
  let contador = 0

  while (contador < dias) {
    const evaluacion = esDiaComputable(cursor, tipoDias, inhabiles)
    if (evaluacion.cuenta) contador += 1
    diasComputados.push({
      fecha: formatFecha(cursor),
      cuenta: evaluacion.cuenta,
      razon: evaluacion.razon,
      numeroDiaComputable: evaluacion.cuenta ? contador : null,
    })
    if (contador < dias) cursor = sumarDias(cursor, 1)
  }

  const vencimientoOriginal = cursor
  const vencimientoFinal = prorrogar ? avanzarAVencimientoHabil(vencimientoOriginal, tipoDias, inhabiles) : vencimientoOriginal
  const fechaVencimiento = formatFecha(vencimientoFinal)
  const fechaVencimientoOriginal = formatFecha(vencimientoOriginal)
  const advertencias = [
    ...regla.advertencias,
    'Confirma calendario oficial, acuerdos generales, suspensión de labores y reglas locales del órgano competente.',
    'La herramienta asume que la fecha capturada es jurídicamente correcta como punto de partida del cómputo.',
  ]

  if (fechaVencimiento !== fechaVencimientoOriginal) {
    advertencias.push('El vencimiento original cayó en día inhábil y fue recorrido al siguiente día hábil disponible.')
  }

  return {
    regla,
    fechaInicioComputo: formatFecha(fechaInicio),
    fechaVencimiento,
    fechaVencimientoOriginal,
    diasComputados,
    diasInhabilesAplicados: [...inhabiles],
    advertencias,
    fundamento: regla.fundamento,
    resumen: `${regla.nombre}: ${dias} días ${tipoDias === 'habiles' ? 'hábiles' : 'naturales'} con vencimiento estimado el ${fechaVencimiento}.`,
  }
}
