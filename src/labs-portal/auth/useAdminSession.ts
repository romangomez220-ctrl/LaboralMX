/**
 * useAdminSession.ts
 * -----------------------------------------------------------------------------
 * Consume authRepository (Fase 2) en vez de localStore directamente.
 * -----------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react'
import { authRepository } from '../../repositories'

export function useAdminSession() {
  const [autenticado, setAutenticado] = useState(false)
  const [cargando, setCargando] = useState(true)

  const recargar = useCallback(() => {
    setCargando(true)
    authRepository
      .haySesionAdminActiva()
      .then(setAutenticado)
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  async function iniciarSesion(usuario: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const resultado = await authRepository.loginAdmin(usuario, password)
    if (!resultado.ok) return { ok: false, error: resultado.error }
    setAutenticado(true)
    return { ok: true }
  }

  async function cerrarSesion() {
    await authRepository.logoutAdmin()
    setAutenticado(false)
  }

  return { autenticado, cargando, iniciarSesion, cerrarSesion }
}
