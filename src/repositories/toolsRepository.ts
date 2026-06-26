import type { EstadoOperativoHerramienta } from '../labs-portal/types'

/**
 * Repositorio del ESTADO OPERATIVO de herramientas (estado de publicación,
 * visibilidad, nivel mínimo). La estructura (nombre, ruta, suite) sigue
 * viniendo siempre de src/catalog/registry.ts — eso es código, no datos, y
 * no tiene repositorio porque no se migra a ningún backend.
 */
export interface ToolsRepository {
  listarEstados(): Promise<EstadoOperativoHerramienta[]>
  obtenerEstado(herramientaId: string): Promise<EstadoOperativoHerramienta>
  guardarEstado(estado: EstadoOperativoHerramienta): Promise<void>
}
