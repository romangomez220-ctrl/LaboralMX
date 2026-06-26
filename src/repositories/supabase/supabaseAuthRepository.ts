/**
 * repositories/supabase/supabaseAuthRepository.ts
 * -----------------------------------------------------------------------------
 * Usa Supabase Auth (signInWithPassword) para validadores Y para
 * administradores — ambos son usuarios de Supabase Auth; lo que distingue
 * a un admin es tener una fila correspondiente en la tabla `admins`
 * (ver SQL en RESUMEN-v7.0.md). Esto es más consistente con el principio
 * de Identity de "separar credencial de perfil" que un usuario/contraseña
 * hardcodeado, y reutiliza el mismo mecanismo seguro para ambos casos.
 * -----------------------------------------------------------------------------
 */

import type { AuthRepository, ResultadoLogin, ResultadoLoginAdmin } from '../authRepository'
import type { Validador } from '../../labs-portal/types'
import { supabase } from './client'
import { filaASupabaseValidador } from './mappers'

export const supabaseAuthRepository: AuthRepository = {
  async loginValidador(usuario, password): Promise<ResultadoLogin> {
    const { data, error } = await supabase.auth.signInWithPassword({ email: usuario, password })
    if (error || !data.user) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' }
    }

    const { data: fila, error: errorPerfil } = await supabase
      .from('validators')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (errorPerfil || !fila) {
      await supabase.auth.signOut()
      return { ok: false, error: 'Tu cuenta no tiene un perfil de validador asociado. Contacta al administrador.' }
    }

    if (fila.estado === 'inactivo') {
      await supabase.auth.signOut()
      return { ok: false, error: 'Esta cuenta de validador está desactivada. Contacta al administrador.' }
    }

    await supabase.from('validators').update({ ultimo_acceso: new Date().toISOString() }).eq('id', data.user.id)
    await supabase.from('activity_logs').insert({ validador_id: data.user.id, tipo: 'login', herramienta_id: null, duracion_aprox_segundos: null })

    const validador: Validador = filaASupabaseValidador({ ...fila, ultimo_acceso: new Date().toISOString() })
    return { ok: true, validador }
  },

  async logoutValidador(validadorId) {
    await supabase.from('activity_logs').insert({ validador_id: validadorId, tipo: 'logout', herramienta_id: null, duracion_aprox_segundos: null })
    await supabase.auth.signOut()
  },

  async obtenerSesionValidadorId() {
    const { data } = await supabase.auth.getSession()
    return data.session?.user.id ?? null
  },

  async loginAdmin(usuario, password): Promise<ResultadoLoginAdmin> {
    const { data, error } = await supabase.auth.signInWithPassword({ email: usuario, password })
    if (error || !data.user) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' }
    }

    // Verificación vía RPC, no vía SELECT directo a la tabla `admins`. Una
    // llamada RPC a is_admin() (SECURITY DEFINER) solo necesita permiso de
    // EJECUCIÓN sobre la función, no permiso de SELECT sobre la tabla —
    // evita la dependencia circular de "para leer admins necesito ser
    // admin" que silenciosamente devolvía 0 filas (no un error) cuando RLS
    // denegaba el SELECT directo.
    const { data: esAdmin, error: errorRpc } = await supabase.rpc('is_admin')
    if (errorRpc || !esAdmin) {
      await supabase.auth.signOut()
      return { ok: false, error: 'Esta cuenta no tiene permisos de administrador.' }
    }
    return { ok: true }
  },

  async logoutAdmin() {
    await supabase.auth.signOut()
  },

  async haySesionAdminActiva() {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return false
    const { data: esAdmin, error } = await supabase.rpc('is_admin')
    return !error && !!esAdmin
  },

  async solicitarRestablecerPassword(correo) {
    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/labs/restablecer-password`,
    })
    if (error) {
      return { ok: false, error: error.message }
    }
    return { ok: true }
  },
}
