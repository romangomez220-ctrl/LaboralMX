import type { Asignacion, EstadoAsignacion } from '../labs-portal/types'

export interface AssignmentsRepository {
  listar(): Promise<Asignacion[]>
  listarPorValidador(validadorId: string): Promise<Asignacion[]>
  listarPorHerramienta(herramientaId: string): Promise<Asignacion[]>
  crear(validadorId: string, herramientaId: string): Promise<Asignacion>
  actualizarEstado(id: string, estado: EstadoAsignacion): Promise<void>
  eliminar(id: string): Promise<void>
}
