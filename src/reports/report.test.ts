import { describe, expect, it } from 'vitest'
import { calcularLiquidacion } from '../utils/laborCalculations'
import { PAID_REPORTS_CONFIG } from '../config/paidReports'
import { buildPremiumReportPdf, formatSnapshotDate } from '../utils/pdfGenerator'
import { isValidReportFolio } from './folio'
import { buildLiquidacionReportModel } from './model'
import type { LiquidacionSnapshot } from './types'
import { buildPracticalGuide } from './practicalGuide'
import type { TipoSalidaLiquidacion } from '../types/labor'

function fixture(): LiquidacionSnapshot {
  const input = {
    fechaIngreso: '2020-01-15', fechaSalida: '2026-08-31', salarioBase: 18000,
    tipoSalario: 'mensual' as const, diasPendientes: 5, vacacionesDisfrutadas: 2,
    tipoSalida: 'despido_injustificado' as const, incluirPrimaAntiguedad: true,
    incluir20Dias: true, zonaSalarioMinimo: 'general' as const,
  }
  return { calculatorType: 'liquidacion', ...input, resultado: calcularLiquidacion(input) }
}

describe('Reporte premium ROMANUS', () => {
  it('mantiene precio y flag centralizados y apagados por defecto', () => {
    expect(PAID_REPORTS_CONFIG.priceMinor).toBe(3900)
    expect(PAID_REPORTS_CONFIG.currency).toBe('MXN')
    expect(PAID_REPORTS_CONFIG.enabled).toBe(false)
  })

  it('construye el modelo sin alterar ni recalcular el resultado', () => {
    const snapshot = fixture()
    const model = buildLiquidacionReportModel(snapshot, {
      folio: 'RMS-LAB-LIQ-A1B2C3D4', generatedAt: '2026-09-02T12:00:00.000Z',
      reportVersion: '1.0.0', calculatorVersion: 'laboral-2026.1',
    })
    expect(model.resultado).toBe(snapshot.resultado)
    expect(model.resultado.totalEstimado).toBe(snapshot.resultado.totalEstimado)
    expect(model.insights.some((item) => item.id === 'concepto-principal')).toBe(true)
    expect(model.insights.some((item) => item.id === 'salario-mensual')).toBe(true)
    expect(model.checklist.length).toBeGreaterThan(4)
  })

  it('acepta únicamente el formato de folio publicado', () => {
    expect(isValidReportFolio('RMS-LAB-LIQ-A1B2C3D4')).toBe(true)
    expect(isValidReportFolio('RMS-LAB-LIQ-123')).toBe(false)
  })

  it('formatea fechas ISO para lectura mexicana sin modificar el snapshot', () => {
    const snapshot = fixture()
    const original = snapshot.fechaIngreso
    expect(formatSnapshotDate(snapshot.fechaIngreso)).toBe('15/01/2020')
    expect(formatSnapshotDate(snapshot.fechaSalida)).toBe('31/08/2026')
    expect(snapshot.fechaIngreso).toBe(original)
  })

  it('selecciona una guía determinística para cada supuesto existente', () => {
    const tipos: TipoSalidaLiquidacion[] = [
      'despido_injustificado', 'despido_justificado', 'renuncia',
      'mutuo_acuerdo', 'fallecimiento', 'incapacidad_no_profesional',
    ]
    const contextos = tipos.map((tipo) => buildPracticalGuide(tipo).context)
    expect(new Set(contextos).size).toBe(tipos.length)
    expect(buildPracticalGuide('despido_injustificado').context).toContain('despido injustificado')
    expect(buildPracticalGuide('renuncia').context).toContain('renuncia')
    expect(buildPracticalGuide('renuncia').items).not.toContain(
      buildPracticalGuide('despido_injustificado').items[0],
    )
  })

  it('genera un PDF multipágina con el total existente', () => {
    const snapshot = fixture()
    const model = buildLiquidacionReportModel(snapshot, {
      folio: 'RMS-LAB-LIQ-A1B2C3D4', generatedAt: '2026-09-02T12:00:00.000Z',
      reportVersion: '1.0.0', calculatorVersion: 'laboral-2026.1',
    })
    const pdf = buildPremiumReportPdf(model)
    expect(pdf.getNumberOfPages()).toBe(5)
    expect(pdf.output('arraybuffer').byteLength).toBeGreaterThan(10_000)
  })
})
