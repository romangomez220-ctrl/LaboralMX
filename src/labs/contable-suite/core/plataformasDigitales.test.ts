import { describe, expect, it } from 'vitest'
import { calcularRetencionPlataformas } from './plataformasDigitales'

const base = {
  tipoActividad: 'venta_servicios_general' as const,
  tipoContribuyente: 'persona_fisica' as const,
  tieneRfcRegistrado: true,
  ingresosBrutosMes: 10_000,
  ingresosAcumuladosAnio: 100_000,
  facturaAdicionalFueraDePlataforma: false,
}

describe('calcularRetencionPlataformas', () => {
  it('aplica 2.5% de ISR y 8% de IVA en venta o servicios con RFC', () => {
    const resultado = calcularRetencionPlataformas(base)
    expect(resultado.montoRetencionIsr).toBe(250)
    expect(resultado.montoRetencionIva).toBe(800)
    expect(resultado.netoARecibir).toBe(8_950)
  })

  it('aplica tasas agravadas cuando no se proporciona RFC', () => {
    const resultado = calcularRetencionPlataformas({ ...base, tieneRfcRegistrado: false })
    expect(resultado.tasaIsrAplicada).toBe(0.2)
    expect(resultado.tasaIvaAplicada).toBe(0.16)
  })

  it('normaliza importes inválidos para evitar retenciones negativas', () => {
    const resultado = calcularRetencionPlataformas({ ...base, ingresosBrutosMes: -1 })
    expect(resultado.montoRetencionIsr).toBe(0)
    expect(resultado.netoARecibir).toBe(0)
  })
})
