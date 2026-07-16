import { describe, expect, it } from 'vitest'
import { calcularFiniquito, calcularLiquidacion, diasVacacionesPorAnio } from './laborCalculations'
import type { FiniquitoFormData, LiquidacionFormData } from '../types/labor'

const finiquitoBase: FiniquitoFormData = {
  fechaIngreso: '2025-01-01',
  fechaSalida: '2026-01-01',
  salarioBase: 500,
  tipoSalario: 'diario',
  diasPendientes: 0,
  vacacionesDisfrutadas: 0,
  renunciaVoluntaria: true,
  incluirPrimaAntiguedad: true,
  zonaSalarioMinimo: 'general',
}

const liquidacionBase: LiquidacionFormData = {
  fechaIngreso: '2025-01-01',
  fechaSalida: '2026-01-01',
  salarioBase: 500,
  tipoSalario: 'diario',
  diasPendientes: 0,
  vacacionesDisfrutadas: 0,
  tipoSalida: 'despido_injustificado',
  incluirPrimaAntiguedad: true,
  incluir20Dias: false,
  zonaSalarioMinimo: 'general',
}

function concepto(resultado: ReturnType<typeof calcularFiniquito>, etiqueta: string) {
  return resultado.conceptos.find((item) => item.etiqueta === etiqueta)
}

describe('tabla de vacaciones', () => {
  it.each([
    [1, 12], [2, 14], [5, 20], [6, 22], [10, 22], [11, 24], [16, 26],
  ])('año %i corresponde a %i días', (anio, dias) => {
    expect(diasVacacionesPorAnio(anio)).toBe(dias)
  })
})

describe('finiquito', () => {
  it('convierte salario mensual a diario y calcula salarios pendientes', () => {
    const resultado = calcularFiniquito({
      ...finiquitoBase,
      salarioBase: 15000,
      tipoSalario: 'mensual',
      diasPendientes: 2,
      incluirPrimaAntiguedad: false,
    })

    expect(resultado.salarioDiario).toBe(500)
    expect(concepto(resultado, 'Salarios pendientes de pago')?.monto).toBe(1000)
  })

  it('excluye prima de antigüedad en renuncia menor a 15 años', () => {
    const resultado = calcularFiniquito(finiquitoBase)

    expect(concepto(resultado, 'Prima de antigüedad')).toBeUndefined()
    expect(resultado.primaAntiguedadInformativa).toBeUndefined()
    expect(resultado.notas.join(' ')).toContain('requiere que el trabajador tenga 15 años')
  })

  it('incluye prima de antigüedad al cumplir 15 años', () => {
    const resultado = calcularFiniquito({
      ...finiquitoBase,
      fechaIngreso: '2011-01-01',
      fechaSalida: '2026-01-01',
    })

    expect(concepto(resultado, 'Prima de antigüedad')?.monto).toBe(90000)
  })

  it('aplica el tope de dos salarios mínimos a la prima', () => {
    const resultado = calcularFiniquito({
      ...finiquitoBase,
      fechaIngreso: '2010-01-01',
      fechaSalida: '2026-01-01',
      salarioBase: 1000,
    })

    expect(concepto(resultado, 'Prima de antigüedad')?.monto).toBe(120975.36)
    expect(resultado.notas.join(' ')).toContain('doble del salario mínimo')
  })

  it('nunca produce vacaciones pendientes negativas', () => {
    const resultado = calcularFiniquito({ ...finiquitoBase, vacacionesDisfrutadas: 100 })
    expect(concepto(resultado, 'Vacaciones proporcionales')?.monto).toBe(0)
    expect(concepto(resultado, 'Prima vacacional (25%)')?.monto).toBe(0)
  })

  it('reconoce las vacaciones devengadas al llegar al aniversario laboral', () => {
    const resultado = calcularFiniquito({ ...finiquitoBase, incluirPrimaAntiguedad: false })
    expect(concepto(resultado, 'Vacaciones proporcionales')?.monto).toBe(6000)
    expect(concepto(resultado, 'Prima vacacional (25%)')?.monto).toBe(1500)
  })
})

describe('liquidación', () => {
  it('calcula los 90 días con una integración mínima cuando no se captura SDI', () => {
    const resultado = calcularLiquidacion(liquidacionBase)
    expect(resultado.salarioDiarioIntegrado).toBe(525.34)
    expect(concepto(resultado, 'Indemnización constitucional (3 meses / 90 días)')?.monto).toBe(47280.6)
    expect(resultado.notas.join(' ')).toContain('prestaciones mínimas')
  })

  it('respeta el SDI capturado para indemnizaciones y 20 días', () => {
    const resultado = calcularLiquidacion({ ...liquidacionBase, salarioDiarioIntegrado: 600, incluir20Dias: true })
    expect(concepto(resultado, 'Indemnización constitucional (3 meses / 90 días)')?.monto).toBe(54000)
    expect(resultado.veinteDiasInformativo?.monto).toBe(12000)
    expect(resultado.notas.join(' ')).not.toContain('prestaciones mínimas')
  })

  it('no incluye indemnización constitucional en despido justificado', () => {
    const resultado = calcularLiquidacion({ ...liquidacionBase, tipoSalida: 'despido_justificado' })
    expect(concepto(resultado, 'Indemnización constitucional (3 meses / 90 días)')).toBeUndefined()
    expect(concepto(resultado, 'Prima de antigüedad')).toBeDefined()
  })

  it('separa la prima como informativa en mutuo acuerdo', () => {
    const resultado = calcularLiquidacion({ ...liquidacionBase, tipoSalida: 'mutuo_acuerdo' })
    expect(concepto(resultado, 'Prima de antigüedad')).toBeUndefined()
    expect(resultado.primaAntiguedadInformativa?.monto).toBeGreaterThan(0)
  })

  it('mantiene los 20 días por año fuera del total principal', () => {
    const resultado = calcularLiquidacion({ ...liquidacionBase, incluir20Dias: true })
    expect(resultado.veinteDiasInformativo?.monto).toBe(10506.8)
    expect(resultado.totalConEscenarioInformativo).toBe(
      resultado.totalEstimado + (resultado.veinteDiasInformativo?.monto ?? 0),
    )
  })

  it('incluye un mes y prima de antigüedad en incapacidad no profesional', () => {
    const resultado = calcularLiquidacion({ ...liquidacionBase, tipoSalida: 'incapacidad_no_profesional', incluirPrimaAntiguedad: false })
    expect(concepto(resultado, 'Indemnización por incapacidad no profesional (1 mes)')?.monto).toBe(15000)
    expect(concepto(resultado, 'Prima de antigüedad')).toBeDefined()
    expect(resultado.notas.join(' ')).toContain('riesgo de trabajo')
  })

  it('usa 366 días para el aguinaldo proporcional de un año bisiesto', () => {
    const resultado = calcularLiquidacion({ ...liquidacionBase, fechaIngreso: '2024-01-01', fechaSalida: '2024-12-31', tipoSalida: 'renuncia' })
    expect(concepto(resultado, 'Aguinaldo proporcional')?.monto).toBe(7500)
  })
})
