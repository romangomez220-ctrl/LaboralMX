import type {
  AguinaldoFormData,
  ConceptoResultado,
  FiniquitoFormData,
  LiquidacionFormData,
  ResultadoAguinaldoEstimado,
  ResultadoCalculo,
  ResultadoSDI,
  ResultadoVacacionesEstimadas,
  SDIFormData,
  VacacionesFormData,
  ZonaSalarioMinimo,
} from '../types/labor'
import {
  calcularAntiguedad,
  diasTrabajadosAnioCalendario,
  formatAntiguedad,
  obtenerFechaHoyUTC,
  parseDate,
} from './dateUtils'
import { round2 } from './formatCurrency'

const DIAS_AGUINALDO = 15
const DIAS_INDEMNIZACION_CONSTITUCIONAL = 90
const DIAS_PRIMA_ANTIGUEDAD = 12
const DIAS_VEINTE_POR_ANIO = 20
const PORCENTAJE_PRIMA_VACACIONAL = 0.25

/**
 * Salarios mínimos generales vigentes a partir del 1 de enero de 2026,
 * conforme a la Resolución de la CONASAMI publicada en el DOF el 9 de
 * diciembre de 2025.
 *
 * IMPORTANTE: estos montos se fijan una vez al año. Deben actualizarse
 * cada vez que la CONASAMI publique nuevos salarios mínimos (normalmente
 * en diciembre, con vigencia a partir del 1 de enero siguiente).
 */
const SALARIOS_MINIMOS_VIGENTES: Record<ZonaSalarioMinimo, number> = {
  general: 315.04,
  frontera_norte: 440.87,
}

/**
 * Tabla de vacaciones según la reforma vigente de la LFT (art. 76):
 * Año 1: 12, Año 2: 14, Año 3: 16, Año 4: 18, Año 5: 20,
 * y a partir del año 6, +2 días cada bloque de 5 años (22, 24, 26, 28, 30, 32...).
 */
export function diasVacacionesPorAnio(anio: number): number {
  if (anio <= 0) return 0
  if (anio <= 5) return 10 + anio * 2
  const bloque = Math.ceil((anio - 5) / 5)
  return 20 + bloque * 2
}

interface ResultadoPrimaAntiguedad {
  monto: number
  topeAplicado: boolean
}

/**
 * Casos jurídicos reconocidos para la procedencia de la prima de
 * antigüedad (Art. 162 LFT). "otro" cubre supuestos de terminación que no
 * son ni renuncia voluntaria ni un despido (p. ej. mutuo acuerdo,
 * vencimiento de contrato), donde la prima procede igual que en un
 * despido pero conviene que el usuario confirme las circunstancias.
 */
type CasoPrimaAntiguedad =
  | 'renuncia_insuficiente'
  | 'renuncia_suficiente'
  | 'despido_injustificado'
  | 'despido_justificado'
  | 'otro'

interface EvaluacionPrimaAntiguedad {
  aplica: boolean
  nota: string
}

const NOTA_PRIMA_ANTIGUEDAD_RENUNCIA_INSUFICIENTE =
  'No se incluyó la prima de antigüedad: conforme al Art. 162 LFT, la prima de antigüedad por separación voluntaria (renuncia) requiere que el trabajador tenga 15 años o más de antigüedad. Tu antigüedad calculada con las fechas capturadas es menor a 15 años.'

const NOTA_PRIMA_ANTIGUEDAD_RENUNCIA_SUFICIENTE =
  'Se incluye la prima de antigüedad: tu antigüedad calculada es de 15 años o más, por lo que es exigible conforme al Art. 162 LFT incluso en una separación voluntaria (renuncia).'

const NOTA_PRIMA_ANTIGUEDAD_DESPIDO_INJUSTIFICADO =
  'Se incluye la prima de antigüedad: en caso de despido, la ley no exige un mínimo de años de antigüedad para que sea exigible (Art. 162 LFT).'

const NOTA_PRIMA_ANTIGUEDAD_DESPIDO_JUSTIFICADO =
  'Se incluye la prima de antigüedad: aunque en un despido justificado no proceden otras prestaciones por la causa de la terminación, la prima de antigüedad no depende de la causa de separación, solo de la antigüedad acumulada, por lo que sigue siendo exigible conforme al Art. 162 LFT.'

const NOTA_PRIMA_ANTIGUEDAD_OTRO_SUPUESTO =
  'Se incluye la prima de antigüedad: fuera de una renuncia voluntaria, la ley no exige un mínimo de años de antigüedad (Art. 162 LFT). Verifica que la causa real de tu separación corresponda a este supuesto, ya que distintos supuestos de terminación pueden tener tratamiento distinto.'

/**
 * Determina si la prima de antigüedad es legalmente exigible para el
 * caso indicado, y devuelve SIEMPRE una nota explicando el porqué (se
 * incluya o no), para que el usuario nunca asuma automáticamente que le
 * corresponde. Es la ÚNICA fuente de verdad para esta regla; la usan
 * tanto calcularFiniquito como calcularLiquidacion, para evitar que
 * ambas calculadoras lleguen a resultados distintos ante el mismo
 * supuesto jurídico.
 */
function evaluarPrimaAntiguedad(caso: CasoPrimaAntiguedad): EvaluacionPrimaAntiguedad {
  switch (caso) {
    case 'renuncia_insuficiente':
      return { aplica: false, nota: NOTA_PRIMA_ANTIGUEDAD_RENUNCIA_INSUFICIENTE }
    case 'renuncia_suficiente':
      return { aplica: true, nota: NOTA_PRIMA_ANTIGUEDAD_RENUNCIA_SUFICIENTE }
    case 'despido_injustificado':
      return { aplica: true, nota: NOTA_PRIMA_ANTIGUEDAD_DESPIDO_INJUSTIFICADO }
    case 'despido_justificado':
      return { aplica: true, nota: NOTA_PRIMA_ANTIGUEDAD_DESPIDO_JUSTIFICADO }
    case 'otro':
      return { aplica: true, nota: NOTA_PRIMA_ANTIGUEDAD_OTRO_SUPUESTO }
  }
}

/**
 * Prima de antigüedad (Art. 162 LFT): 12 días de salario por cada año de
 * servicios. El propio Art. 162 limita el salario base de este cálculo al
 * doble del salario mínimo general vigente en la zona geográfica
 * correspondiente, cuando el salario real del trabajador lo excede.
 */
function calcularPrimaAntiguedad(
  salarioDiarioReal: number,
  antiguedadDecimal: number,
  zona: ZonaSalarioMinimo,
): ResultadoPrimaAntiguedad {
  const topeSalarioDiario = round2(SALARIOS_MINIMOS_VIGENTES[zona] * 2)
  const topeAplicado = salarioDiarioReal > topeSalarioDiario
  const salarioBase = Math.min(salarioDiarioReal, topeSalarioDiario)
  const monto = round2(salarioBase * DIAS_PRIMA_ANTIGUEDAD * antiguedadDecimal)
  return { monto, topeAplicado }
}

interface ConceptosBase {
  salarioDiario: number
  antiguedadDecimal: number
  antiguedadTexto: string
  aguinaldoProporcional: number
  diasVacacionesCorrespondientes: number
  vacacionesPendientesDinero: number
  primaVacacional: number
  salariosPendientes: number
}

function calcularConceptosBase(
  ingresoStr: string,
  salidaStr: string,
  salarioMensual: number,
  diasPendientes: number,
  vacacionesDisfrutadas: number,
): ConceptosBase {
  const ingreso = parseDate(ingresoStr)
  const salida = parseDate(salidaStr)

  const salarioDiario = round2(salarioMensual / 30)
  const antiguedad = calcularAntiguedad(ingreso, salida)
  const diasTrabajadosAnioActual = diasTrabajadosAnioCalendario(ingreso, salida)

  const aguinaldoProporcional = round2(
    (salarioDiario * DIAS_AGUINALDO * diasTrabajadosAnioActual) / 365,
  )
  const salariosPendientes = round2(salarioDiario * diasPendientes)

  const anioVacacionalEnCurso = antiguedad.aniosCompletos + 1
  const diasVacacionesCorrespondientes = diasVacacionesPorAnio(anioVacacionalEnCurso)
  const diasAnioLaboral = Math.min(antiguedad.diasAnioLaboralEnCurso, 365)

  const vacacionesProporcionalesDinero = round2(
    (salarioDiario * diasVacacionesCorrespondientes * diasAnioLaboral) / 365,
  )
  const valorVacacionesDisfrutadas = round2(vacacionesDisfrutadas * salarioDiario)
  const vacacionesPendientesDinero = Math.max(
    0,
    round2(vacacionesProporcionalesDinero - valorVacacionesDisfrutadas),
  )
  const primaVacacional = round2(vacacionesPendientesDinero * PORCENTAJE_PRIMA_VACACIONAL)

  return {
    salarioDiario,
    antiguedadDecimal: antiguedad.antiguedadDecimal,
    antiguedadTexto: formatAntiguedad(ingreso, salida),
    aguinaldoProporcional,
    diasVacacionesCorrespondientes,
    vacacionesPendientesDinero,
    primaVacacional,
    salariosPendientes,
  }
}

export function calcularFiniquito(data: FiniquitoFormData): ResultadoCalculo {
  const base = calcularConceptosBase(
    data.fechaIngreso,
    data.fechaSalida,
    data.salarioMensual,
    data.diasPendientes,
    data.vacacionesDisfrutadas,
  )

  const conceptos: ConceptoResultado[] = [
    {
      etiqueta: 'Salarios pendientes de pago',
      monto: base.salariosPendientes,
      formula: 'Salario diario × días pendientes de pago',
    },
    {
      etiqueta: 'Aguinaldo proporcional',
      monto: base.aguinaldoProporcional,
      formula: '15 días × salario diario × (días trabajados del año ÷ 365)',
    },
    {
      etiqueta: 'Vacaciones proporcionales',
      monto: base.vacacionesPendientesDinero,
      detalle: `${base.diasVacacionesCorrespondientes} días correspondientes al año en curso`,
      formula: 'Días de vacaciones correspondientes × salario diario × (días del año laboral ÷ 365), menos vacaciones disfrutadas',
    },
    {
      etiqueta: 'Prima vacacional (25%)',
      monto: base.primaVacacional,
      formula: 'Vacaciones pendientes × 25%',
    },
  ]

  const notas: string[] = []
  const casoPrimaAntiguedad: CasoPrimaAntiguedad = data.renunciaVoluntaria
    ? base.antiguedadDecimal >= 15
      ? 'renuncia_suficiente'
      : 'renuncia_insuficiente'
    : 'otro'

  if (data.incluirPrimaAntiguedad) {
    const { aplica, nota } = evaluarPrimaAntiguedad(casoPrimaAntiguedad)
    if (aplica) {
      const { monto, topeAplicado } = calcularPrimaAntiguedad(
        base.salarioDiario,
        base.antiguedadDecimal,
        data.zonaSalarioMinimo,
      )
      conceptos.push({
        etiqueta: 'Prima de antigüedad',
        monto,
        formula: 'Salario diario (con tope Art. 162 LFT) × 12 días × años de antigüedad',
      })
      notas.push(nota)
      if (topeAplicado) {
        notas.push(
          'La prima de antigüedad se calculó con el salario tope que marca el Art. 162 LFT (el doble del salario mínimo general de la zona seleccionada), ya que tu salario diario lo excede.',
        )
      }
    } else {
      notas.push(nota)
    }
  }

  const totalEstimado = round2(conceptos.reduce((suma, c) => suma + c.monto, 0))

  return {
    tipo: 'finiquito',
    salarioDiario: base.salarioDiario,
    antiguedadAnios: round2(base.antiguedadDecimal),
    antiguedadTexto: base.antiguedadTexto,
    conceptos,
    totalEstimado,
    notas,
  }
}

export function calcularLiquidacion(data: LiquidacionFormData): ResultadoCalculo {
  const base = calcularConceptosBase(
    data.fechaIngreso,
    data.fechaSalida,
    data.salarioMensual,
    data.diasPendientes,
    data.vacacionesDisfrutadas,
  )

  const conceptos: ConceptoResultado[] = [
    {
      etiqueta: 'Salarios pendientes de pago',
      monto: base.salariosPendientes,
      formula: 'Salario diario × días pendientes de pago',
    },
    {
      etiqueta: 'Aguinaldo proporcional',
      monto: base.aguinaldoProporcional,
      formula: '15 días × salario diario × (días trabajados del año ÷ 365)',
    },
    {
      etiqueta: 'Vacaciones proporcionales',
      monto: base.vacacionesPendientesDinero,
      detalle: `${base.diasVacacionesCorrespondientes} días correspondientes al año en curso`,
      formula: 'Días de vacaciones correspondientes × salario diario × (días del año laboral ÷ 365), menos vacaciones disfrutadas',
    },
    {
      etiqueta: 'Prima vacacional (25%)',
      monto: base.primaVacacional,
      formula: 'Vacaciones pendientes × 25%',
    },
  ]

  const notas: string[] = []

  if (data.tipoSalida === 'despido_injustificado') {
    const indemnizacion = round2(base.salarioDiario * DIAS_INDEMNIZACION_CONSTITUCIONAL)
    conceptos.push({
      etiqueta: 'Indemnización constitucional (3 meses / 90 días)',
      monto: indemnizacion,
      formula: 'Salario diario × 90 días (3 meses de salario, Art. 48 LFT)',
    })
  }

  if (data.incluirPrimaAntiguedad) {
    const casoPrimaAntiguedad: CasoPrimaAntiguedad =
      data.tipoSalida === 'renuncia'
        ? base.antiguedadDecimal >= 15
          ? 'renuncia_suficiente'
          : 'renuncia_insuficiente'
        : data.tipoSalida === 'despido_injustificado'
          ? 'despido_injustificado'
          : 'despido_justificado'

    const { aplica, nota } = evaluarPrimaAntiguedad(casoPrimaAntiguedad)

    if (aplica) {
      const { monto, topeAplicado } = calcularPrimaAntiguedad(
        base.salarioDiario,
        base.antiguedadDecimal,
        data.zonaSalarioMinimo,
      )
      conceptos.push({
        etiqueta: 'Prima de antigüedad',
        monto,
        formula: 'Salario diario (con tope Art. 162 LFT) × 12 días × años de antigüedad',
      })
      notas.push(nota)
      if (topeAplicado) {
        notas.push(
          'La prima de antigüedad se calculó con el salario tope que marca el Art. 162 LFT (el doble del salario mínimo general de la zona seleccionada), ya que tu salario diario lo excede.',
        )
      }
    } else {
      notas.push(nota)
    }
  }

  const totalEstimado = round2(conceptos.reduce((suma, c) => suma + c.monto, 0))

  let veinteDiasInformativo: ConceptoResultado | undefined
  let totalConEscenarioInformativo: number | undefined

  if (data.incluir20Dias) {
    if (data.tipoSalida === 'despido_injustificado') {
      const monto20 = round2(base.salarioDiario * DIAS_VEINTE_POR_ANIO * base.antiguedadDecimal)
      veinteDiasInformativo = {
        etiqueta: '20 días por año de servicio (escenario informativo)',
        monto: monto20,
        formula: 'Salario diario × 20 días × años de antigüedad',
      }
      totalConEscenarioInformativo = round2(totalEstimado + monto20)
    } else {
      notas.push(
        'El escenario de 20 días por año normalmente solo se utiliza como referencia de negociación en despidos injustificados, por lo que no se incluyó en este cálculo.',
      )
    }
  }

  return {
    tipo: 'liquidacion',
    salarioDiario: base.salarioDiario,
    antiguedadAnios: round2(base.antiguedadDecimal),
    antiguedadTexto: base.antiguedadTexto,
    conceptos,
    totalEstimado,
    veinteDiasInformativo,
    totalConEscenarioInformativo,
    notas,
  }
}

// =============================================================
// Módulos independientes: SDI, Aguinaldo estimado y Vacaciones
// estimadas. No modifican ni dependen de calcularFiniquito ni de
// calcularLiquidacion; reutilizan las mismas utilidades de fecha y
// la misma tabla de vacaciones ya existentes en este archivo.
// =============================================================

/**
 * Salario Diario Integrado (Art. 84 LSS), versión simplificada con
 * prestaciones mínimas de ley (aguinaldo 15 días + prima vacacional 25%
 * sobre los días de vacaciones que correspondan por antigüedad ya
 * cumplida). No aplica el tope de 25 UMA ni incluye bonos, comisiones u
 * otras percepciones variables.
 */
export function calcularSDI(data: SDIFormData): ResultadoSDI {
  const ingreso = parseDate(data.fechaIngreso)
  const hoy = obtenerFechaHoyUTC()
  const antiguedad = calcularAntiguedad(ingreso, hoy)
  const diasVacacionesAplicados = diasVacacionesPorAnio(antiguedad.aniosCompletos)
  const factorIntegracion = 1 + DIAS_AGUINALDO / 365 + (diasVacacionesAplicados * PORCENTAJE_PRIMA_VACACIONAL) / 365
  const salarioDiario = round2(data.salarioMensual / 30)
  const sdi = round2(salarioDiario * factorIntegracion)

  return {
    salarioDiario,
    diasVacacionesAplicados,
    factorIntegracion,
    sdi,
    antiguedadTexto: formatAntiguedad(ingreso, hoy),
  }
}

/**
 * Aguinaldo proporcional ESTIMADO: proyecta el cálculo al 31 de
 * diciembre del año en curso, asumiendo que la persona continúa
 * laborando hasta esa fecha. Es una proyección, no el aguinaldo ya
 * generado a la fecha de hoy.
 */
export function calcularAguinaldoEstimado(data: AguinaldoFormData): ResultadoAguinaldoEstimado {
  const ingreso = parseDate(data.fechaIngreso)
  const hoy = obtenerFechaHoyUTC()
  const finDeAnio = new Date(Date.UTC(hoy.getUTCFullYear(), 11, 31))
  const diasComputados = diasTrabajadosAnioCalendario(ingreso, finDeAnio)
  const salarioDiario = round2(data.salarioMensual / 30)
  const aguinaldoEstimado = round2((salarioDiario * DIAS_AGUINALDO * diasComputados) / 365)

  return {
    salarioDiario,
    diasComputados,
    aguinaldoEstimado,
    fechaCorte: finDeAnio.toISOString().slice(0, 10),
  }
}

/**
 * Vacaciones y prima vacacional ESTIMADAS para un trabajador activo,
 * con base en el año laboral en curso según su antigüedad (no el año
 * calendario): se toman los días completos que le corresponden por el
 * año de antigüedad que está cursando (sin prorratear, porque a
 * diferencia del finiquito no hay una fecha de salida) y se restan los
 * días que ya disfrutó para mostrar el pendiente.
 */
export function calcularVacacionesEstimadas(data: VacacionesFormData): ResultadoVacacionesEstimadas {
  const ingreso = parseDate(data.fechaIngreso)
  const hoy = obtenerFechaHoyUTC()
  const antiguedad = calcularAntiguedad(ingreso, hoy)
  const anioLaboralEnCurso = antiguedad.aniosCompletos + 1
  const diasVacacionesCorrespondientes = diasVacacionesPorAnio(anioLaboralEnCurso)
  const diasPendientes = Math.max(0, diasVacacionesCorrespondientes - data.diasDisfrutados)
  const salarioDiario = round2(data.salarioMensual / 30)
  const valorPendiente = round2(salarioDiario * diasPendientes)
  const primaVacacional = round2(valorPendiente * PORCENTAJE_PRIMA_VACACIONAL)
  const totalEstimado = round2(valorPendiente + primaVacacional)

  return {
    salarioDiario,
    antiguedadTexto: formatAntiguedad(ingreso, hoy),
    diasVacacionesCorrespondientes,
    diasDisfrutados: data.diasDisfrutados,
    diasPendientes,
    valorPendiente,
    primaVacacional,
    totalEstimado,
  }
}
