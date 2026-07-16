import { beforeEach, describe, expect, it, vi } from 'vitest'
import { borrarBorrador, cargarBorrador, guardarBorrador } from './calculatorDraft'

const storage = new Map<string, string>()

beforeEach(() => {
  storage.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  })
})

describe('borrador local de calculadora', () => {
  it('recupera solo las claves conocidas', () => {
    guardarBorrador('test', { salario: '500', fecha: '2026-01-01', desconocido: 'x' })
    const restored = cargarBorrador('test', { salario: '', fecha: '' })
    expect(restored).toEqual({ value: { salario: '500', fecha: '2026-01-01' }, recovered: true })
  })

  it('descarta borradores vencidos', () => {
    storage.set('test', JSON.stringify({ expiresAt: Date.now() - 1, value: { salario: '500' } }))
    expect(cargarBorrador('test', { salario: '' })).toEqual({ value: { salario: '' }, recovered: false })
  })

  it('permite borrar el avance manualmente', () => {
    guardarBorrador('test', { salario: '500' })
    borrarBorrador('test')
    expect(cargarBorrador('test', { salario: '' }).recovered).toBe(false)
  })
})
