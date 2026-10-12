import { describe, expect, it } from 'vitest'
import { calcularDiagnosticoResico } from './resicoCalculations'

const base = {
  ingresoMensual: 25_000,
  actividad: 'servicios_profesionales' as const,
  facturacion: 'personas_fisicas' as const,
  gastosMensuales: 5_000,
  empleados: 'sin_empleados' as const,
  iva: 'cobra' as const,
  situacion: 'dado_de_alta' as const,
}

describe('calcularDiagnosticoResico', () => {
  it('aplica el tramo mensual y proyecta doce meses', () => {
    const resultado = calcularDiagnosticoResico(base)
    expect(resultado.tasa).toBe(0.01)
    expect(resultado.isrMensual).toBe(250)
    expect(resultado.ingresoAnual).toBe(300_000)
  })

  it('marca como no elegible una proyección superior a 3.5 millones', () => {
    expect(calcularDiagnosticoResico({ ...base, ingresoMensual: 300_000 }).elegible).toBe(false)
  })

  it('normaliza importes negativos', () => {
    const resultado = calcularDiagnosticoResico({ ...base, ingresoMensual: -10, gastosMensuales: -20 })
    expect(resultado.ingresoMensual).toBe(0)
    expect(resultado.remanenteDespuesDeGastos).toBe(0)
  })
})
