import type {
  ConceptoResultado,
  FiniquitoFormData,
  LiquidacionFormData,
  ResultadoCalculo,
  ZonaSalarioMinimo,
} from '../types/labor'
import {
  calcularAntiguedad,
  diasTrabajadosAnioCalendario,
  formatAntiguedad,
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
    { etiqueta: 'Salarios pendientes de pago', monto: base.salariosPendientes },
    { etiqueta: 'Aguinaldo proporcional', monto: base.aguinaldoProporcional },
    {
      etiqueta: 'Vacaciones proporcionales',
      monto: base.vacacionesPendientesDinero,
      detalle: `${base.diasVacacionesCorrespondientes} días correspondientes al año en curso`,
    },
    { etiqueta: 'Prima vacacional (25%)', monto: base.primaVacacional },
  ]

  const notas: string[] = []
  const primaAplicaLegal = data.renunciaVoluntaria ? data.tiene15Anios : true

  if (data.incluirPrimaAntiguedad) {
    if (primaAplicaLegal) {
      const { monto, topeAplicado } = calcularPrimaAntiguedad(
        base.salarioDiario,
        base.antiguedadDecimal,
        data.zonaSalarioMinimo,
      )
      conceptos.push({ etiqueta: 'Prima de antigüedad', monto })
      if (topeAplicado) {
        notas.push(
          'La prima de antigüedad se calculó con el salario tope que marca el Art. 162 LFT (el doble del salario mínimo general de la zona seleccionada), ya que tu salario diario lo excede.',
        )
      }
    } else {
      notas.push(
        'No se incluyó la prima de antigüedad: en una renuncia voluntaria, la ley exige 15 años o más de antigüedad para que sea exigible.',
      )
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
    { etiqueta: 'Salarios pendientes de pago', monto: base.salariosPendientes },
    { etiqueta: 'Aguinaldo proporcional', monto: base.aguinaldoProporcional },
    {
      etiqueta: 'Vacaciones proporcionales',
      monto: base.vacacionesPendientesDinero,
      detalle: `${base.diasVacacionesCorrespondientes} días correspondientes al año en curso`,
    },
    { etiqueta: 'Prima vacacional (25%)', monto: base.primaVacacional },
  ]

  const notas: string[] = []

  if (data.tipoSalida === 'despido_injustificado') {
    const indemnizacion = round2(base.salarioDiario * DIAS_INDEMNIZACION_CONSTITUCIONAL)
    conceptos.push({
      etiqueta: 'Indemnización constitucional (90 días)',
      monto: indemnizacion,
    })
  }

  if (data.incluirPrimaAntiguedad) {
    const { monto, topeAplicado } = calcularPrimaAntiguedad(
      base.salarioDiario,
      base.antiguedadDecimal,
      data.zonaSalarioMinimo,
    )
    conceptos.push({ etiqueta: 'Prima de antigüedad', monto })
    if (topeAplicado) {
      notas.push(
        'La prima de antigüedad se calculó con el salario tope que marca el Art. 162 LFT (el doble del salario mínimo general de la zona seleccionada), ya que tu salario diario lo excede.',
      )
    }
    if (data.tipoSalida === 'renuncia') {
      notas.push(
        'En caso de renuncia, la prima de antigüedad solo es exigible si el trabajador tiene 15 años o más de antigüedad. Verifica este requisito en tu caso.',
      )
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
