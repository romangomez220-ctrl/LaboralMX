import type { ActivityRepository } from '../activityRepository'
import { listarActividad, listarActividadPorValidador, registrarActividad } from '../../labs-portal/storage/localStore'

export const localActivityRepository: ActivityRepository = {
  async listar() {
    return listarActividad()
  },
  async listarPorValidador(validadorId) {
    return listarActividadPorValidador(validadorId)
  },
  async registrar(datos) {
    registrarActividad(datos)
  },
}
