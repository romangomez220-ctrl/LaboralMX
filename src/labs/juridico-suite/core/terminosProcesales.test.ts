import { describe, expect, it } from 'vitest'
import { calcularTerminoProcesal, esFechaISOValida, MAX_DIAS_PERSONALIZADOS } from './terminosProcesales'

describe('calcularTerminoProcesal', () => {
  it('omite fines de semana e inhábiles manuales en días hábiles', () => {
    const resultado = calcularTerminoProcesal({
      reglaId: 'personalizado',
      fechaBase: '2026-01-09',
      diasPersonalizados: 2,
      tipoDiasPersonalizado: 'habiles',
      diasInhabilesAdicionales: ['2026-01-13'],
    })
    expect(resultado.fechaVencimiento).toBe('2026-01-14')
    expect(resultado.diasComputados.some((dia) => dia.fecha === '2026-01-13' && !dia.cuenta)).toBe(true)
  })

  it('rechaza fechas inexistentes y filtra inhábiles inválidos', () => {
    expect(esFechaISOValida('2026-02-29')).toBe(false)
    expect(() => calcularTerminoProcesal({ reglaId: 'personalizado', fechaBase: '2026-02-29' })).toThrow()
  })

  it('limita plazos personalizados excesivos', () => {
    const resultado = calcularTerminoProcesal({
      reglaId: 'personalizado',
      fechaBase: '2026-01-01',
      diasPersonalizados: MAX_DIAS_PERSONALIZADOS + 1,
      tipoDiasPersonalizado: 'naturales',
      prorrogarSiVenceInhabil: false,
    })
    expect(resultado.regla.dias).toBe(MAX_DIAS_PERSONALIZADOS)
  })
})
