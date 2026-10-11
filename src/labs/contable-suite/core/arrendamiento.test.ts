import { describe, expect, it } from 'vitest'
import { compararArrendamiento } from './arrendamiento'

const gastosBase = {
  predial: 12_000,
  mantenimiento: 10_000,
  primasSeguros: 3_000,
  interesesRealesHipotecarios: 5_000,
  salariosComisionesHonorarios: 20_000,
  contribucionesSobreSalarios: 5_000,
  deduccionInversionesConstruccion: 10_000,
}

describe('compararArrendamiento', () => {
  it('incluye todas las deducciones autorizadas capturadas en gastos reales', () => {
    const resultado = compararArrendamiento({
      ingresoAnual: 240_000,
      predialPagado: 12_000,
      esCopropiedad: false,
      porcentajeCopropiedad: 100,
      gastosReales: gastosBase,
    })

    expect(resultado.totalGastosReales).toBe(65_000)
    expect(resultado.baseGravableCiega).toBe(144_000)
    expect(resultado.baseGravableReal).toBe(175_000)
    expect(resultado.recomendacion).toBe('ciega')
  })

  it('no convierte importes negativos o no finitos en deducciones', () => {
    const resultado = compararArrendamiento({
      ingresoAnual: 100_000,
      predialPagado: -1,
      esCopropiedad: false,
      porcentajeCopropiedad: 100,
      gastosReales: {
        ...gastosBase,
        predial: -10,
        mantenimiento: Number.NaN,
      },
    })

    expect(resultado.totalGastosReales).toBe(43_000)
    expect(resultado.baseGravableCiega).toBe(65_000)
  })

  it('aclara que los importes en copropiedad deben ser proporcionales', () => {
    const resultado = compararArrendamiento({
      ingresoAnual: 120_000,
      predialPagado: 6_000,
      esCopropiedad: true,
      porcentajeCopropiedad: 50,
      gastosReales: gastosBase,
    })

    expect(resultado.notas.some((nota) => nota.includes('únicamente los ingresos y gastos que corresponden a tu proporción'))).toBe(true)
  })
})
