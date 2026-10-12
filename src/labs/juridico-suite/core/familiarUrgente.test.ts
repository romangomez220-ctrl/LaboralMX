import { describe, expect, it } from 'vitest'
import { evaluarFamiliarUrgente } from './familiarUrgente'

const base = {
  tipoCaso: 'alimentos' as const,
  hayMenores: true,
  numeroMenores: 1,
  hayRiesgoViolencia: false,
  hayAmenazasRecientes: false,
  hayIncumplimientoAlimentos: false,
  deudorTieneEmpleoIdentificado: false,
  hayCambioDomicilioORetencion: false,
  existeConvenioOSentencia: false,
  requiereConvivenciaSupervisada: false,
  tieneDocumentosBasicos: false,
  tieneComprobantesGastos: false,
  tienePruebasComunicaciones: false,
}

describe('evaluarFamiliarUrgente', () => {
  it('clasifica violencia o amenazas como urgente y muestra ruta inmediata', () => {
    const resultado = evaluarFamiliarUrgente({ ...base, hayAmenazasRecientes: true })
    expect(resultado.urgencia).toBe('urgente')
    expect(resultado.advertencias.some((texto) => texto.includes('911'))).toBe(true)
  })

  it('detecta evidencia faltante en asuntos de alimentos', () => {
    const resultado = evaluarFamiliarUrgente(base)
    expect(resultado.omisionesCriticas.some((texto) => texto.includes('comprobantes de gastos'))).toBe(true)
  })

  it('normaliza un número inválido de menores', () => {
    const resultado = evaluarFamiliarUrgente({ ...base, numeroMenores: -2 })
    expect(resultado.omisionesCriticas.some((texto) => texto.includes('no se capturó cuántos'))).toBe(true)
  })
})
