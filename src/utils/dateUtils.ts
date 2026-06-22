// Todas las fechas se manejan en UTC para evitar desajustes por zona horaria
// cuando provienen de <input type="date"> (que entrega "YYYY-MM-DD").

export function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1))
}

export function diffInDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date.getTime())
  d.setUTCFullYear(d.getUTCFullYear() + years)
  return d
}

export interface AntiguedadInfo {
  aniosCompletos: number
  diasAnioLaboralEnCurso: number
  antiguedadDecimal: number
  totalDias: number
}

/**
 * Calcula la antigüedad de un trabajador entre dos fechas.
 * - aniosCompletos: número de aniversarios laborales ya cumplidos.
 * - diasAnioLaboralEnCurso: días transcurridos desde el último aniversario
 *   hasta la fecha de salida (la parte proporcional del año en curso).
 * - antiguedadDecimal: antigüedad total en años con decimales, calculada
 *   como aniosCompletos + (diasAnioLaboralEnCurso / 365). Se deriva de los
 *   mismos dos valores anteriores para que la cifra mostrada al usuario y
 *   la usada en prima de antigüedad / 20 días por año sean siempre
 *   consistentes entre sí.
 */
export function calcularAntiguedad(ingreso: Date, salida: Date): AntiguedadInfo {
  if (salida.getTime() <= ingreso.getTime()) {
    return { aniosCompletos: 0, diasAnioLaboralEnCurso: 0, antiguedadDecimal: 0, totalDias: 0 }
  }

  let aniosCompletos = salida.getUTCFullYear() - ingreso.getUTCFullYear()
  const aniversarioEsteAnio = new Date(
    Date.UTC(salida.getUTCFullYear(), ingreso.getUTCMonth(), ingreso.getUTCDate()),
  )
  if (aniversarioEsteAnio.getTime() > salida.getTime()) {
    aniosCompletos -= 1
  }
  if (aniosCompletos < 0) aniosCompletos = 0

  const ultimoAniversario = addYears(ingreso, aniosCompletos)
  const diasAnioLaboralEnCurso = Math.max(0, diffInDays(ultimoAniversario, salida))
  const totalDias = Math.max(0, diffInDays(ingreso, salida))

  // antiguedadDecimal se deriva de los MISMOS componentes que ya usa el
  // resto del motor (aniosCompletos + diasAnioLaboralEnCurso) en vez de un
  // cálculo paralelo sobre totalDias/365.25. Esto evita que la antigüedad
  // mostrada al usuario difiera de la que se usa internamente para prima
  // de antigüedad, 20 días por año, etc.
  const antiguedadDecimal = aniosCompletos + diasAnioLaboralEnCurso / 365

  return { aniosCompletos, diasAnioLaboralEnCurso, antiguedadDecimal, totalDias }
}

/**
 * Días trabajados dentro del año calendario (enero-diciembre) de la fecha
 * de salida. Se usa para el aguinaldo proporcional.
 */
export function diasTrabajadosAnioCalendario(ingreso: Date, salida: Date): number {
  const inicioAnioCalendario = new Date(Date.UTC(salida.getUTCFullYear(), 0, 1))
  const inicio = ingreso.getTime() > inicioAnioCalendario.getTime() ? ingreso : inicioAnioCalendario
  return Math.max(0, diffInDays(inicio, salida) + 1)
}

/**
 * Texto legible de la antigüedad, ej. "3 años, 2 meses, 10 días".
 */
export function formatAntiguedad(ingreso: Date, salida: Date): string {
  if (salida.getTime() <= ingreso.getTime()) return '0 días'

  let years = salida.getUTCFullYear() - ingreso.getUTCFullYear()
  let months = salida.getUTCMonth() - ingreso.getUTCMonth()
  let days = salida.getUTCDate() - ingreso.getUTCDate()

  if (days < 0) {
    months -= 1
    const ultimoDiaMesPrevio = new Date(Date.UTC(salida.getUTCFullYear(), salida.getUTCMonth(), 0))
    days += ultimoDiaMesPrevio.getUTCDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const partes: string[] = []
  if (years > 0) partes.push(`${years} año${years !== 1 ? 's' : ''}`)
  if (months > 0) partes.push(`${months} mes${months !== 1 ? 'es' : ''}`)
  if (days > 0 || partes.length === 0) partes.push(`${days} día${days !== 1 ? 's' : ''}`)
  return partes.join(', ')
}

/**
 * Fecha de hoy en UTC a medianoche, para mantener consistencia con
 * parseDate() al comparar o calcular antigüedad respecto a la fecha actual
 * (usado por las calculadoras de SDI, Aguinaldo y Vacaciones, que no
 * dependen de una fecha de salida capturada por el usuario).
 */
export function obtenerFechaHoyUTC(): Date {
  const ahora = new Date()
  return new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()))
}
