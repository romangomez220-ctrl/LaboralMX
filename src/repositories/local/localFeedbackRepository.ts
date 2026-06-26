import type { FeedbackRepository } from '../feedbackRepository'
import { actualizarEstadoFeedback, crearFeedback, listarFeedback } from '../../labs-portal/storage/localStore'

export const localFeedbackRepository: FeedbackRepository = {
  async listar() {
    return listarFeedback()
  },
  async crear(datos) {
    return crearFeedback(datos)
  },
  async actualizarEstado(id, estado) {
    actualizarEstadoFeedback(id, estado)
  },
}
