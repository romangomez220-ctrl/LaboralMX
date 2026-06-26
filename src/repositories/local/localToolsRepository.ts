import type { ToolsRepository } from '../toolsRepository'
import { guardarEstadoOperativo, listarEstadosOperativos, obtenerEstadoOperativo } from '../../labs-portal/storage/localStore'

export const localToolsRepository: ToolsRepository = {
  async listarEstados() {
    return listarEstadosOperativos()
  },
  async obtenerEstado(herramientaId) {
    return obtenerEstadoOperativo(herramientaId)
  },
  async guardarEstado(estado) {
    guardarEstadoOperativo(estado)
  },
}
