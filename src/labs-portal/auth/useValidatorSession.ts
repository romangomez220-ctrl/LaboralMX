/**
 * useValidatorSession.ts
 * -----------------------------------------------------------------------------
 * Maneja la sesión del validador actual. Hoy compara la contraseña en
 * texto plano contra lo guardado en localStorage (ver advertencia de
 * seguridad en types.ts) — al migrar a Supabase, `iniciarSesion` debe
 * volverse `async` y llamar a `supabase.auth.signInWithPassword(...)` en
 * vez de comparar strings; el resto del hook (la forma en que los
 * componentes lo consumen: `validador`, `estaAutenticado`, `cerrarSesion`)
 * no debería necesitar cambios.
 * -----------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react'
import {
  cerrarSesionValidador,
  guardarValidador,
  iniciarSesionValidador,
  obtenerSesionValidadorId,
  obtenerValidadorPorId,
  obtenerValidadorPorUsuario,
  registrarActividad,
} from '../storage/localStore'
import type { Validador } from '../types'

interface ResultadoLogin {
  ok: boolean
  error?: string
}

export function useValidatorSession() {
  const [validador, setValidador] = useState<Validador | null>(null)
  const [cargando, setCargando] = useState(true)

  const recargar = useCallback(() => {
    const id = obtenerSesionValidadorId()
    setValidador(id ? obtenerValidadorPorId(id) : null)
    setCargando(false)
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  function iniciarSesion(usuario: string, password: string): ResultadoLogin {
    const encontrado = obtenerValidadorPorUsuario(usuario)
    if (!encontrado) {
      return { ok: false, error: 'Usuario no encontrado.' }
    }
    if (encontrado.estado === 'inactivo') {
      return { ok: false, error: 'Esta cuenta de validador está desactivada. Contacta al administrador.' }
    }
    if (encontrado.passwordTemporal !== password) {
      return { ok: false, error: 'Contraseña incorrecta.' }
    }

    const actualizado: Validador = { ...encontrado, ultimoAcceso: new Date().toISOString() }
    guardarValidador(actualizado)
    iniciarSesionValidador(actualizado.id)
    registrarActividad({ validadorId: actualizado.id, tipo: 'login', herramientaId: null, duracionAproxSegundos: null })
    setValidador(actualizado)
    return { ok: true }
  }

  function cerrarSesion() {
    if (validador) {
      registrarActividad({ validadorId: validador.id, tipo: 'logout', herramientaId: null, duracionAproxSegundos: null })
    }
    cerrarSesionValidador()
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
