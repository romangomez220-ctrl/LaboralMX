/**
 * useAdminSession.ts
 * -----------------------------------------------------------------------------
 * Sesión del administrador, completamente separada de la sesión de
 * validador (distinta llave de localStorage, distinto formulario de
 * login). Al migrar a Supabase, esto se reemplaza por un rol/claim de
 * Supabase Auth (ej. una columna `es_admin` o una tabla de roles), no por
 * una contraseña compartida como ahora.
 * -----------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react'
import { cerrarSesionAdmin, haySesionAdminActiva, iniciarSesionAdmin } from '../storage/localStore'
import { validarCredencialesAdmin } from '../storage/seedData'

export function useAdminSession() {
  const [autenticado, setAutenticado] = useState(false)
  const [cargando, setCargando] = useState(true)

  const recargar = useCallback(() => {
    setAutenticado(haySesionAdminActiva())
    setCargando(false)
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  function iniciarSesion(usuario: string, password: string): { ok: boolean; error?: string } {
    if (!validarCredencialesAdmin(usuario, password)) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' }
    }
    iniciarSesionAdmin()
    setAutenticado(true)
    return { ok: true }
  }

  function cerrarSesion() {
    cerrarSesionAdmin()
    setAutenticado(false)
  }

  return { autenticado, cargando, iniciarSesion, cerrarSesion }
}
