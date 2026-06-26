import type { ActivityRepository } from '../activityRepository'
import { supabase } from './client'
import { filaAActividad } from './mappers'

export const supabaseActivityRepository: ActivityRepository = {
  async listar() {
    const { data, error } = await supabase.from('activity_logs').select('*').order('fecha', { ascending: false }).limit(500)
    if (error || !data) return []
    return data.map(filaAActividad)
  },

  async listarPorValidador(validadorId) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('validador_id', validadorId)
      .order('fecha', { ascending: false })
    if (error || !data) return []
    return data.map(filaAActividad)
  },

  async registrar(datos) {
    await supabase.from('activity_logs').insert({
      validador_id: datos.validadorId,
      tipo: datos.tipo,
      herramienta_id: datos.herramientaId,
      duracion_aprox_segundos: datos.duracionAproxSegundos,
    })
  },
}
