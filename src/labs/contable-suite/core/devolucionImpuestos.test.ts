import { describe, expect, it } from 'vitest'
import { calcularDevolucionImpuestos, calcularIsrAnual2026 } from './devolucionImpuestos'

const base = {
  ingresoAnual: 300_000,
  ingresoAcumulableEjercicioAnterior: 250_000,
  isrRetenido: 50_000,
  tuvoMasDeUnPatron: false,
  gastosMedicos: 0,
  colegiaturas: [],
  donativos: 0,
  donativosGobierno: 0,
  interesesRealesHipotecarios: 0,
  aportacionesRetiroAfore: 0,
}

describe('calcularDevolucionImpuestos', () => {
  it('aplica la tarifa anual 2026 por tramos', () => {
    expect(calcularIsrAnual2026(10_000)).toBe(192)
    expect(calcularIsrAnual2026(100_000)).toBeCloseTo(6572.16, 2)
    expect(calcularIsrAnual2026(0)).toBe(0)
  })

  it('usa el ingreso del ejercicio anterior para topar donativos', () => {
    const resultado = calcularDevolucionImpuestos({ ...base, donativos: 30_000 })
    expect(resultado.donativosTopeAplicado).toBe(17_500)
  })

  it('estima saldo a favor comparando retenciones e ISR causado', () => {
    const resultado = calcularDevolucionImpuestos(base)
    expect(resultado.isrCausadoEstimado).toBeGreaterThan(0)
    expect(resultado.tipoSaldo).toBe('a_favor')
    expect(resultado.saldoEstimado).toBeCloseTo(resultado.isrRetenidoTotal - resultado.isrCausadoEstimado, 2)
  })

  it('no convierte importes negativos o no finitos en deducciones', () => {
    const resultado = calcularDevolucionImpuestos({
      ...base,
      gastosMedicos: -10,
      interesesRealesHipotecarios: Number.NaN,
      colegiaturas: [{ nivel: 'primaria', monto: -100 }],
    })
    expect(resultado.totalDeduccionesPersonales).toBe(0)
  })
})
