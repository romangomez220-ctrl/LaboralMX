import { describe, expect, it } from 'vitest'
import { calcularAntiguedad, diasTrabajadosAnioCalendario, diffInDays, formatAntiguedad, parseDate } from './dateUtils'

describe('fechas laborales en UTC', () => {
  it('cuenta correctamente el día bisiesto', () => {
    expect(diffInDays(parseDate('2024-02-28'), parseDate('2024-03-01'))).toBe(2)
  })

  it('calcula aniversarios completos sin desfase horario', () => {
    const antiguedad = calcularAntiguedad(parseDate('2020-07-15'), parseDate('2026-07-15'))
    expect(antiguedad.aniosCompletos).toBe(6)
    expect(antiguedad.diasAnioLaboralEnCurso).toBe(0)
    expect(formatAntiguedad(parseDate('2020-07-15'), parseDate('2026-07-15'))).toBe('6 años')
  })

  it('limita el aguinaldo al año calendario de salida', () => {
    expect(diasTrabajadosAnioCalendario(parseDate('2020-01-01'), parseDate('2026-01-10'))).toBe(10)
  })

  it('devuelve antigüedad cero cuando la salida no es posterior', () => {
    expect(calcularAntiguedad(parseDate('2026-01-01'), parseDate('2026-01-01')).totalDias).toBe(0)
  })
})
