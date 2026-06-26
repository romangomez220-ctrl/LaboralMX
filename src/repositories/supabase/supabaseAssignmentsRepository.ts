import type { AssignmentsRepository } from '../assignmentsRepository'
import { supabase } from './client'
import { filaAAsignacion } from './mappers'

export const supabaseAssignmentsRepository: AssignmentsRepository = {
  async listar() {
    const { data, error } = await supabase.from('validator_tool_assignments').select('*')
    if (error || !data) return []
    return data.map(filaAAsignacion)
  },

  async listarPorValidador(validadorId) {
    const { data, error } = await supabase.from('validator_tool_assignments').select('*').eq('validador_id', validadorId)
    if (error || !data) return []
    return data.map(filaAAsignacion)
  },

  async listarPorHerramienta(herramientaId) {
    const { data, error } = await supabase.from('validator_tool_assignments').select('*').eq('herramienta_id', herramientaId)
    if (error || !data) return []
    return data.map(filaAAsignacion)
  },

  async crear(validadorId, herramientaId) {
    const { data, error } = await supabase
      .from('validator_tool_assignments')
      .upsert({ validador_id: validadorId, herramienta_id: herramientaId, estado: 'pendiente' }, { onConflict: 'validador_id,herramienta_id' })
      .select()
      .single()
    if (error || !data) {
      throw new Error(`No se pudo crear la asignación: ${error?.message ?? 'error desconocido'}`)
    }
    return filaAAsignacion(data)
  },

  async actualizarEstado(id, estado) {
    await supabase
      .from('validator_tool_assignments')
      .update({ estado, fecha_actualizacion: new Date().toISOString() })
      .eq('id', id)
  },

  async eliminar(id) {
    await supabase.from('validator_tool_assignments').delete().eq('id', id)
  },
}
