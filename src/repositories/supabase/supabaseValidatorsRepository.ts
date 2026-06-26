/**
 * repositories/supabase/supabaseValidatorsRepository.ts
 * -----------------------------------------------------------------------------
 * `crear()` es el método delicado: tiene que (1) crear la cuenta de Auth
 * del nuevo validador con un correo y contraseña temporal, y (2) crear su
 * fila de perfil en `validators` — sin tocar la sesión del admin que está
 * haciendo la operación. Por eso el paso (1) usa un cliente DESECHABLE
 * (ver client.ts) y el paso (2) usa el cliente PRINCIPAL (la sesión real
 * del admin, que es la que tiene permiso de RLS para insertar perfiles).
 * -----------------------------------------------------------------------------
 */

import type { ValidatorsRepository } from '../validatorsRepository'
import type { Validador } from '../../labs-portal/types'
import { supabase, crearClienteDesechable } from './client'
import { filaASupabaseValidador, validadorAFilaSupabase } from './mappers'

export const supabaseValidatorsRepository: ValidatorsRepository = {
  async listar() {
    const { data, error } = await supabase.from('validators').select('*').order('fecha_creacion', { ascending: false })
    if (error || !data) return []
    return data.map(filaASupabaseValidador)
  },

  async obtenerPorId(id) {
    const { data, error } = await supabase.from('validators').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return filaASupabaseValidador(data)
  },

  async obtenerPorUsuario(usuario) {
    const { data, error } = await supabase.from('validators').select('*').eq('usuario', usuario).maybeSingle()
    if (error || !data) return null
    return filaASupabaseValidador(data)
  },

  async crear(datos): Promise<Validador> {
    // Paso 1: crear la cuenta de Auth en un cliente desechable, para no
    // pisar la sesión del admin actual.
    const clienteTemporal = crearClienteDesechable()
    const { data: altaAuth, error: errorAuth } = await clienteTemporal.auth.signUp({
      email: datos.usuario,
      password: datos.passwordTemporal,
    })
    if (errorAuth || !altaAuth.user) {
      throw new Error(`No se pudo crear la cuenta de autenticación: ${errorAuth?.message ?? 'error desconocido'}`)
    }

    // Paso 2: crear el perfil, con el cliente principal (sesión del admin).
    const fila = {
      id: altaAuth.user.id,
      usuario: datos.usuario,
      nombre: datos.nombre,
      profesion: datos.profesion,
      especialidad: datos.especialidad,
      nivel: datos.nivel,
      estado: datos.estado,
      calificacion_interna: datos.calificacionInterna,
      notas_admin: datos.notasAdmin,
    }
    const { data: filaCreada, error: errorPerfil } = await supabase.from('validators').insert(fila).select().single()
    if (errorPerfil || !filaCreada) {
      throw new Error(`Se creó la cuenta de acceso, pero no el perfil: ${errorPerfil?.message ?? 'error desconocido'}`)
    }
    return filaASupabaseValidador(filaCreada)
  },

  async guardar(validador) {
    await supabase.from('validators').update(validadorAFilaSupabase(validador)).eq('id', validador.id)
  },

  async eliminar(id) {
    // Borra el perfil. La cuenta de Auth correspondiente NO se borra desde
    // aquí (requeriría la llave de servicio) — queda como limitación
    // documentada en RESUMEN-v7.0.md.
    await supabase.from('validators').delete().eq('id', id)
  },
}
