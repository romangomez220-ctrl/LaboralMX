import type { Feedback, EstadoFeedback } from '../labs-portal/types'

export interface FeedbackRepository {
  listar(): Promise<Feedback[]>
  crear(datos: Omit<Feedback, 'id' | 'fecha' | 'estado'>): Promise<Feedback>
  actualizarEstado(id: string, estado: EstadoFeedback): Promise<void>
}
