/**
 * repositories/toolsView.ts
 * -----------------------------------------------------------------------------
 * Combina la estructura del Registro Central (código, síncrono) con el
 * estado operativo (repositorio, asíncrono). Vive en repositories/ y no en
 * catalog/ porque depende de toolsRepository — el Registro en sí nunca
 * debe depender de un repositorio.
 * -----------------------------------------------------------------------------
 */

import { TOOLS, obtenerToolPorId, obtenerToolPorRuta, type ToolManifest } from '../catalog/registry'
import { toolsRepository } from './index'
import type { EstadoOperativoHerramienta } from '../labs-portal/types'

export interface HerramientaVista extends ToolManifest {
  estadoOperativo: EstadoOperativoHerramienta
}

export async function obtenerHerramientaVista(herramientaId: string): Promise<HerramientaVista | null> {
  const manifest = obtenerToolPorId(herramientaId)
  if (!manifest) return null
  const estadoOperativo = await toolsRepository.obtenerEstado(herramientaId)
  return { ...manifest, estadoOperativo }
}

export async function obtenerHerramientaVistaPorRuta(ruta: string): Promise<HerramientaVista | null> {
  const manifest = obtenerToolPorRuta(ruta)
  if (!manifest) return null
  const estadoOperativo = await toolsRepository.obtenerEstado(manifest.id)
  return { ...manifest, estadoOperativo }
}

export async function listarHerramientasVista(): Promise<HerramientaVista[]> {
  return Promise.all(
    TOOLS.map(async (t) => ({ ...t, estadoOperativo: await toolsRepository.obtenerEstado(t.id) })),
  )
}
