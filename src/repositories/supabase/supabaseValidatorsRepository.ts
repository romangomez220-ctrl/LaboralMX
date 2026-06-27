/**
 * repositories/supabase/supabaseValidatorsRepository.ts
 * -----------------------------------------------------------------------------
 * `crear()` es el método delicado: tiene que (1) crear la cuenta de Auth
 * del nuevo validador con un correo y contraseña temporal, y (2) crear su
 * fila de perfil en `validators` — sin tocar la sesión del admin que está
 * haciendo la operación. La creación vive en la Edge Function
 * `crear-validador`, donde se valida la sesión/admin y solo ahí se usa
 * `SUPABASE_SERVICE_ROLE_KEY` para crear el usuario de Auth.
 * -----------------------------------------------------------------------------
 */

import type { ValidatorsRepository } from '../validatorsRepository'
import type { Validador } from '../../labs-portal/types'
import { supabase } from './client'
import { filaASupabaseValidador, validadorAFilaSupabase } from './mappers'

async function obtenerMensajeEdgeFunction(error: unknown): Promise<string> {
  const contexto = (error as { context?: Response }).context
  if (!contexto) return error instanceof Error ? error.message : 'No se pudo crear el validador.'

  try {
    const cuerpo = await contexto.clone().json()
    if (typeof cuerpo?.error === 'string') return cuerpo.error
  } catch {
    // Si la Edge Function no devuelve JSON, usamos el mensaje original.
  }

  return error instanceof Error ? error.message : 'No se pudo crear el validador.'
}

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
    const { data: filaCreada, error } = await supabase.functions.invoke('crear-validador', {
      body: {
        usuario: datos.usuario,
        passwordTemporal: datos.passwordTemporal,
        nombre: datos.nombre,
        profesion: datos.profesion,
        especialidad: datos.especialidad,
        nivel: datos.nivel,
        estado: datos.estado,
        calificacionInterna: datos.calificacionInterna,
        notasAdmin: datos.notasAdmin,
      },
    })

    if (error || !filaCreada) {
      throw new Error(error ? await obtenerMensajeEdgeFunction(error) : 'No se pudo crear el validador.')
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
