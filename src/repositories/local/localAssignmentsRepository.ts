import type { AssignmentsRepository } from '../assignmentsRepository'
import {
  actualizarEstadoAsignacion,
  crearAsignacion,
  eliminarAsignacion,
  listarAsignaciones,
  listarAsignacionesPorHerramienta,
  listarAsignacionesPorValidador,
} from '../../labs-portal/storage/localStore'

export const localAssignmentsRepository: AssignmentsRepository = {
  async listar() {
    return listarAsignaciones()
  },
  async listarPorValidador(validadorId) {
    return listarAsignacionesPorValidador(validadorId)
  },
  async listarPorHerramienta(herramientaId) {
    return listarAsignacionesPorHerramienta(herramientaId)
  },
  async crear(validadorId, herramientaId) {
    return crearAsignacion(validadorId, herramientaId)
  },
  async actualizarEstado(id, estado) {
    actualizarEstadoAsignacion(id, estado)
  },
  async eliminar(id) {
    eliminarAsignacion(id)
  },
}
