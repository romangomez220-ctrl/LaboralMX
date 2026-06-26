import type { RegistroActividad } from '../labs-portal/types'

export interface ActivityRepository {
  listar(): Promise<RegistroActividad[]>
  listarPorValidador(validadorId: string): Promise<RegistroActividad[]>
  registrar(datos: Omit<RegistroActividad, 'id' | 'fecha'>): Promise<void>
}
