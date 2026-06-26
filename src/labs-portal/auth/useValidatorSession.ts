/**
 * useValidatorSession.ts
 * -----------------------------------------------------------------------------
 * Ahora consume authRepository/validatorsRepository (Fase 2) en vez de
 * localStore directamente. Esto es lo que hace que, al activar Supabase
 * en repositories/index.ts (Fase 3), este hook no necesite ningún cambio.
 * -----------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react'
import { authRepository, validatorsRepository } from '../../repositories'
import type { Validador } from '../types'

interface ResultadoLogin {
  ok: boolean
  error?: string
}

export function useValidatorSession() {
  const [validador, setValidador] = useState<Validador | null>(null)
  const [cargando, setCargando] = useState(true)

  const recargar = useCallback(() => {
    setCargando(true)
    authRepository
      .obtenerSesionValidadorId()
      .then((id) => (id ? validatorsRepository.obtenerPorId(id) : Promise.resolve(null)))
      .then((v) => setValidador(v))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  async function iniciarSesion(usuario: string, password: string): Promise<ResultadoLogin> {
    const resultado = await authRepository.loginValidador(usuario, password)
    if (!resultado.ok) {
      return { ok: false, error: resultado.error }
    }
    setValidador(resultado.validador)
    return { ok: true }
  }

  async function cerrarSesion() {
    if (validador) {
      await authRepository.logoutValidador(validador.id)
    }
    setValidador(null)
  }

  return {
    validador,
    estaAutenticado: validador !== null,
    cargando,
    iniciarSesion,
    cerrarSesion,
    recargar,
  }
}
