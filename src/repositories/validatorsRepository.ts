import type { Validador } from '../labs-portal/types'

export interface ValidatorsRepository {
  listar(): Promise<Validador[]>
  obtenerPorId(id: string): Promise<Validador | null>
  obtenerPorUsuario(usuario: string): Promise<Validador | null>
  crear(datos: Omit<Validador, 'id' | 'fechaCreacion' | 'ultimoAcceso'>): Promise<Validador>
  guardar(validador: Validador): Promise<void>
  eliminar(id: string): Promise<void>
}
