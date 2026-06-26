import type { ToolsRepository } from '../toolsRepository'
import type { EstadoOperativoHerramienta } from '../../labs-portal/types'
import { supabase } from './client'
import { estadoOperativoAFila, filaAEstadoOperativo } from './mappers'

function defaultEstado(herramientaId: string): EstadoOperativoHerramienta {
  return {
    herramientaId,
    estado: 'en_validacion',
    visiblePublicamente: false,
    disponibleSoloLabs: true,
    nivelMinimoRequerido: null,
  }
}

export const supabaseToolsRepository: ToolsRepository = {
  async listarEstados() {
    const { data, error } = await supabase.from('tools_state').select('*')
    if (error || !data) return []
    return data.map(filaAEstadoOperativo)
  },

  async obtenerEstado(herramientaId) {
    const { data, error } = await supabase.from('tools_state').select('*').eq('herramienta_id', herramientaId).maybeSingle()
    if (error || !data) return defaultEstado(herramientaId)
    return filaAEstadoOperativo(data)
  },

  async guardarEstado(estado) {
    await supabase.from('tools_state').upsert(estadoOperativoAFila(estado))
  },
}
