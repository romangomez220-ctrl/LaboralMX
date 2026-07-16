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
  TipoCapturaSalarial,
  VacacionesFormData,
  ZonaSalarioMinimo,
} from '../types/labor'
import {
  calcularAntiguedad,
  diasTrabajadosAnioCalendario,
  diasDelAnioCalendario,
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
 * Única fuente de verdad para convertir lo que el usuario capturó
 * (salario diario o mensual) a salario diario. Si ya es diario, se usa
 * tal cual; si es mensual, se divide entre 30 — el mismo criterio que
 * ROMANUS ha usado siempre, ahora explícito y reutilizado en un solo
 * lugar en vez de repetido en cada función de cálculo.
 */
function obtenerSalarioDiario(salarioBase: number, tipoSalario: TipoCapturaSalarial): number {
  return tipoSalario === 'diario' ? round2(salarioBase) : round2(salarioBase / 30)
}

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
 * antigüedad (Art. 162 LFT).
 *
 * - "fallecimiento": el Art. 162 LFT la incluye expresamente, sin mínimo
 *   de años, igual que en un despido — es un caso cierto.
 * - "mutuo_acuerdo" e "incapacidad_no_profesional": el tratamiento puede variar según
 *   las circunstancias documentadas del caso (p. ej. el tipo exacto de
 *   incapacidad, o si el mutuo acuerdo se trata como una renuncia
 *   encubierta). No son casos ciertos como despido o fallecimiento, así
 *   que el monto se muestra de forma informativa, separada del total.
 * - "otro" cubre cualquier supuesto de Finiquito que no sea renuncia
 *   (Finiquito no distingue despido/mutuo acuerdo/etc. con su propio
 *   campo todavía) — por la misma razón de incertidumbre, también es
 *   informativo.
 */
type CasoPrimaAntiguedad =
  | 'renuncia_insuficiente'
  | 'renuncia_suficiente'
  | 'despido_injustificado'
  | 'despido_justificado'
  | 'fallecimiento'
  | 'mutuo_acuerdo'
  | 'incapacidad_no_profesional'
  | 'otro'

type ResultadoEvaluacionPrimaAntiguedad = 'incluir' | 'informativo' | 'excluir'

interface EvaluacionPrimaAntiguedad {
  resultado: ResultadoEvaluacionPrimaAntiguedad
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

const NOTA_PRIMA_ANTIGUEDAD_FALLECIMIENTO =
  'Se incluye la prima de antigüedad: el Art. 162 LFT la reconoce expresamente en caso de fallecimiento del trabajador, sin exigir un mínimo de años de antigüedad.'

const NOTA_PRIMA_ANTIGUEDAD_INCAPACIDAD_NO_PROFESIONAL =
  'Se incluyen 12 días por cada año de servicios conforme al Art. 54 LFT para el supuesto específico de incapacidad no profesional.'

const NOTA_PRIMA_ANTIGUEDAD_INFORMATIVA =
  'La prima de antigüedad puede depender del motivo de terminación y de la antigüedad. Este cálculo es orientativo y debe revisarse según el caso concreto.'

/**
 * Determina si la prima de antigüedad es legalmente exigible para el
 * caso indicado, y devuelve SIEMPRE una nota explicando el porqué, para
 * que el usuario nunca asuma automáticamente que le corresponde. Es la
 * ÚNICA fuente de verdad para esta regla; la usan tanto
 * calcularFiniquito como calcularLiquidacion.
 *
 * "incluir": se suma al total principal, porque el supuesto tiene un
 * tratamiento legal cierto (renuncia con 15+ años, despido,
 * fallecimiento). "informativo": se calcula y se muestra, pero NO se
 * suma al total principal, porque el supuesto no tiene un tratamiento
 * automático y cierto. "excluir": no se calcula ni se muestra monto.
 */
function evaluarPrimaAntiguedad(caso: CasoPrimaAntiguedad): EvaluacionPrimaAntiguedad {
  switch (caso) {
    case 'renuncia_insuficiente':
      return { resultado: 'excluir', nota: NOTA_PRIMA_ANTIGUEDAD_RENUNCIA_INSUFICIENTE }
    case 'renuncia_suficiente':
      return { resultado: 'incluir', nota: NOTA_PRIMA_ANTIGUEDAD_RENUNCIA_SUFICIENTE }
    case 'despido_injustificado':
      return { resultado: 'incluir', nota: NOTA_PRIMA_ANTIGUEDAD_DESPIDO_INJUSTIFICADO }
    case 'despido_justificado':
      return { resultado: 'incluir', nota: NOTA_PRIMA_ANTIGUEDAD_DESPIDO_JUSTIFICADO }
    case 'fallecimiento':
      return { resultado: 'incluir', nota: NOTA_PRIMA_ANTIGUEDAD_FALLECIMIENTO }
    case 'incapacidad_no_profesional':
      return { resultado: 'incluir', nota: NOTA_PRIMA_ANTIGUEDAD_INCAPACIDAD_NO_PROFESIONAL }
    case 'mutuo_acuerdo':
    case 'otro':
      return { resultado: 'informativo', nota: NOTA_PRIMA_ANTIGUEDAD_INFORMATIVA }
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
  aniosCompletos: number
  diasPeriodoLaboralEnCurso: number
}

function calcularConceptosBase(
  ingresoStr: string,
  salidaStr: string,
  salarioDiario: number,
  diasPendientes: number,
  vacacionesDisfrutadas: number,
): ConceptosBase {
  const ingreso = parseDate(ingresoStr)
  const salida = parseDate(salidaStr)

  const antiguedad = calcularAntiguedad(ingreso, salida)
  const diasTrabajadosAnioActual = diasTrabajadosAnioCalendario(ingreso, salida)
  const diasAnioCalendario = diasDelAnioCalendario(salida.getUTCFullYear())

  const aguinaldoProporcional = round2(
    (salarioDiario * DIAS_AGUINALDO * diasTrabajadosAnioActual) / diasAnioCalendario,
  )
  const salariosPendientes = round2(salarioDiario * diasPendientes)

  const anioVacacionalEnCurso = antiguedad.aniosCompletos + 1
  const diasVacacionesCorrespondientes = diasVacacionesPorAnio(anioVacacionalEnCurso)
  const diasAnioLaboral = Math.min(antiguedad.diasAnioLaboralEnCurso, antiguedad.diasPeriodoLaboralEnCurso)
  const diasVacacionesDevengadasUltimoAnio = antiguedad.aniosCompletos > 0
    ? diasVacacionesPorAnio(antiguedad.aniosCompletos)
    : 0
  const diasVacacionesProporcionales =
    (diasVacacionesCorrespondientes * diasAnioLaboral) / antiguedad.diasPeriodoLaboralEnCurso
  const vacacionesGeneradasDinero = round2(
    salarioDiario * (diasVacacionesDevengadasUltimoAnio + diasVacacionesProporcionales),
  )
  const valorVacacionesDisfrutadas = round2(vacacionesDisfrutadas * salarioDiario)
  const vacacionesPendientesDinero = Math.max(
    0,
    round2(vacacionesGeneradasDinero - valorVacacionesDisfrutadas),
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
    aniosCompletos: antiguedad.aniosCompletos,
    diasPeriodoLaboralEnCurso: antiguedad.diasPeriodoLaboralEnCurso,
  }
}

export function calcularFiniquito(data: FiniquitoFormData): ResultadoCalculo {
  const salarioDiario = obtenerSalarioDiario(data.salarioBase, data.tipoSalario)
  const base = calcularConceptosBase(
    data.fechaIngreso,
    data.fechaSalida,
    salarioDiario,
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
      formula: '15 días × salario diario × (días trabajados ÷ días reales del año)',
    },
    {
      etiqueta: 'Vacaciones proporcionales',
      monto: base.vacacionesPendientesDinero,
      detalle: `Incluye el derecho devengado del último año completo y la proporción del periodo en curso`,
      formula: '(Vacaciones devengadas + proporcionales) × salario diario, menos vacaciones disfrutadas',
    },
    {
      etiqueta: 'Prima vacacional (25%)',
      monto: base.primaVacacional,
      formula: 'Vacaciones pendientes × 25%',
    },
  ]

  const notas: string[] = []
  let primaAntiguedadInformativa: ConceptoResultado | undefined
  const casoPrimaAntiguedad: CasoPrimaAntiguedad = data.renunciaVoluntaria
    ? base.antiguedadDecimal >= 15
      ? 'renuncia_suficiente'
      : 'renuncia_insuficiente'
    : 'otro'

  if (data.incluirPrimaAntiguedad) {
    const { resultado, nota } = evaluarPrimaAntiguedad(casoPrimaAntiguedad)
    if (resultado !== 'excluir') {
      const { monto, topeAplicado } = calcularPrimaAntiguedad(
        base.salarioDiario,
        base.antiguedadDecimal,
        data.zonaSalarioMinimo,
      )
      const conceptoPrima: ConceptoResultado = {
        etiqueta: 'Prima de antigüedad',
        monto,
        formula: 'Salario diario (con tope Art. 162 LFT) × 12 días × años de antigüedad',
      }
      if (resultado === 'incluir') {
        conceptos.push(conceptoPrima)
      } else {
        primaAntiguedadInformativa = conceptoPrima
      }
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
    salarioBase: data.salarioBase,
    tipoSalario: data.tipoSalario,
    salarioDiario: base.salarioDiario,
    antiguedadAnios: round2(base.antiguedadDecimal),
    antiguedadTexto: base.antiguedadTexto,
    conceptos,
    totalEstimado,
    primaAntiguedadInformativa,
    notas,
  }
}

export function calcularLiquidacion(data: LiquidacionFormData): ResultadoCalculo {
  const salarioDiario = obtenerSalarioDiario(data.salarioBase, data.tipoSalario)
  const base = calcularConceptosBase(
    data.fechaIngreso,
    data.fechaSalida,
    salarioDiario,
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
      formula: '15 días × salario diario × (días trabajados ÷ días reales del año)',
    },
    {
      etiqueta: 'Vacaciones proporcionales',
      monto: base.vacacionesPendientesDinero,
      detalle: `Incluye el derecho devengado del último año completo y la proporción del periodo en curso`,
      formula: '(Vacaciones devengadas + proporcionales) × salario diario, menos vacaciones disfrutadas',
    },
    {
      etiqueta: 'Prima vacacional (25%)',
      monto: base.primaVacacional,
      formula: 'Vacaciones pendientes × 25%',
    },
  ]

  const notas: string[] = []

  const diasVacacionesIntegracion = diasVacacionesPorAnio(Math.max(1, base.aniosCompletos + 1))
  const factorIntegracionMinimo = 1 + DIAS_AGUINALDO / 365 + (diasVacacionesIntegracion * PORCENTAJE_PRIMA_VACACIONAL) / 365
  const salarioDiarioIntegradoEstimado = round2(base.salarioDiario * factorIntegracionMinimo)
  const salarioDiarioIntegrado = data.salarioDiarioIntegrado && data.salarioDiarioIntegrado > 0
    ? round2(data.salarioDiarioIntegrado)
    : salarioDiarioIntegradoEstimado

  if (data.tipoSalida === 'despido_injustificado') {
    const indemnizacion = round2(salarioDiarioIntegrado * DIAS_INDEMNIZACION_CONSTITUCIONAL)
    conceptos.push({
      etiqueta: 'Indemnización constitucional (3 meses / 90 días)',
      monto: indemnizacion,
      formula: 'Salario diario integrado × 90 días (Arts. 48, 84 y 89 LFT)',
    })
    if (!data.salarioDiarioIntegrado) {
      notas.push('El salario diario integrado se estimó con prestaciones mínimas de ley. Si recibías comisiones, bonos, vales u otras prestaciones habituales, captura tu SDI real para evitar una subestimación.')
    }
  }

  if (data.tipoSalida === 'incapacidad_no_profesional') {
    conceptos.push({
      etiqueta: 'Indemnización por incapacidad no profesional (1 mes)',
      monto: round2(base.salarioDiario * 30),
      formula: 'Salario diario × 30 días (Art. 54 LFT)',
    })
    notas.push('Este supuesto solo corresponde a incapacidad física o mental no derivada de un riesgo de trabajo que haga imposible prestar el servicio. Los riesgos de trabajo siguen reglas distintas.')
  }

  let primaAntiguedadInformativa: ConceptoResultado | undefined

  if (data.incluirPrimaAntiguedad || data.tipoSalida === 'incapacidad_no_profesional') {
    const casoPrimaAntiguedad: CasoPrimaAntiguedad =
      data.tipoSalida === 'renuncia'
        ? base.antiguedadDecimal >= 15
          ? 'renuncia_suficiente'
          : 'renuncia_insuficiente'
        : data.tipoSalida === 'despido_injustificado'
          ? 'despido_injustificado'
          : data.tipoSalida === 'despido_justificado'
            ? 'despido_justificado'
            : data.tipoSalida === 'fallecimiento'
              ? 'fallecimiento'
              : data.tipoSalida === 'incapacidad_no_profesional'
                ? 'incapacidad_no_profesional'
                : 'mutuo_acuerdo'

    const { resultado, nota } = evaluarPrimaAntiguedad(casoPrimaAntiguedad)

    if (resultado !== 'excluir') {
      const { monto, topeAplicado } = calcularPrimaAntiguedad(
        base.salarioDiario,
        base.antiguedadDecimal,
        data.zonaSalarioMinimo,
      )
      const conceptoPrima: ConceptoResultado = {
        etiqueta: 'Prima de antigüedad',
        monto,
        formula: 'Salario diario (con tope Art. 162 LFT) × 12 días × años de antigüedad',
      }
      if (resultado === 'incluir') {
        conceptos.push(conceptoPrima)
      } else {
        primaAntiguedadInformativa = conceptoPrima
      }
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
      const monto20 = round2(salarioDiarioIntegrado * DIAS_VEINTE_POR_ANIO * base.antiguedadDecimal)
      veinteDiasInformativo = {
        etiqueta: '20 días por año de servicio (escenario informativo)',
        monto: monto20,
        formula: 'Salario diario integrado × 20 días × años de antigüedad',
      }
      totalConEscenarioInformativo = round2(totalEstimado + monto20)
    } else {
      notas.push(
        'Los 20 días por año solo proceden en supuestos específicos de los Arts. 49 y 50 LFT; no son una prestación automática de toda terminación.',
      )
    }
  }

  return {
    tipo: 'liquidacion',
    salarioBase: data.salarioBase,
    tipoSalario: data.tipoSalario,
    salarioDiario: base.salarioDiario,
    salarioDiarioIntegrado,
    antiguedadAnios: round2(base.antiguedadDecimal),
    antiguedadTexto: base.antiguedadTexto,
    conceptos,
    totalEstimado,
    veinteDiasInformativo,
    totalConEscenarioInformativo,
    primaAntiguedadInformativa,
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
  const salarioDiario = obtenerSalarioDiario(data.salarioBase, data.tipoSalario)
  const sdi = round2(salarioDiario * factorIntegracion)

  return {
    salarioBase: data.salarioBase,
    tipoSalario: data.tipoSalario,
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
  const salarioDiario = obtenerSalarioDiario(data.salarioBase, data.tipoSalario)
  const aguinaldoEstimado = round2(
    (salarioDiario * DIAS_AGUINALDO * diasComputados) /
      diasDelAnioCalendario(finDeAnio.getUTCFullYear()),
  )

  return {
    salarioBase: data.salarioBase,
    tipoSalario: data.tipoSalario,
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
  const salarioDiario = obtenerSalarioDiario(data.salarioBase, data.tipoSalario)
  const valorPendiente = round2(salarioDiario * diasPendientes)
  const primaVacacional = round2(valorPendiente * PORCENTAJE_PRIMA_VACACIONAL)
  const totalEstimado = round2(valorPendiente + primaVacacional)

  return {
    salarioBase: data.salarioBase,
    tipoSalario: data.tipoSalario,
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
