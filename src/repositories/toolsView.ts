/**
 * repositories/toolsView.ts
 * -----------------------------------------------------------------------------
 * Combina la estructura del Registro Central (código, síncrono) con el
 * estado operativo (repositorio, asíncrono). Vive en repositories/ y no en
 * catalog/ porque depende de toolsRepository — el Registro en sí nunca
 * debe depender de un repositorio.
 * -----------------------------------------------------------------------------
 */

import { TOOLS, obtenerToolPorClave, obtenerToolPorId, obtenerToolPorRuta, type ToolManifest } from '../catalog/registry'
import { toolsRepository } from './index'
import type { EstadoOperativoHerramienta } from '../labs-portal/types'

export interface HerramientaVista extends ToolManifest {
  estadoOperativo: EstadoOperativoHerramienta
}

const ESTADOS_PUBLICABLES = new Set(['lista_para_publico', 'publicada'])

function estadoSeguroSinBackend(herramientaId: string): EstadoOperativoHerramienta {
  return {
    herramientaId,
    estado: 'en_validacion',
    visiblePublicamente: false,
    disponibleSoloLabs: true,
    nivelMinimoRequerido: null,
  }
}

export function obtenerRutaPublicaHerramienta(herramienta: ToolManifest): string {
  return herramienta.rutaPublica ?? herramienta.ruta
}

export function esHerramientaVisiblePublicamente(herramienta: HerramientaVista): boolean {
  if (!herramienta.requiereValidador) return true
  if (!herramienta.rutaPublica) return false
  return (
    herramienta.estadoOperativo.visiblePublicamente &&
    !herramienta.estadoOperativo.disponibleSoloLabs &&
    ESTADOS_PUBLICABLES.has(herramienta.estadoOperativo.estado)
  )
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

export async function obtenerHerramientaVistaPorClave(clave: string): Promise<HerramientaVista | null> {
  const manifest = obtenerToolPorClave(clave)
  if (!manifest) return null
  let estadoOperativo: EstadoOperativoHerramienta
  try {
    estadoOperativo = await toolsRepository.obtenerEstado(manifest.id)
  } catch (error) {
    // Las herramientas nacidas públicas no deben desaparecer por una caída
    // de Labs. Las herramientas sujetas a validación sí fallan cerradas.
    if (manifest.requiereValidador) throw error
    estadoOperativo = estadoSeguroSinBackend(manifest.id)
  }
  return { ...manifest, estadoOperativo }
}

export async function listarHerramientasVista(): Promise<HerramientaVista[]> {
  return Promise.all(
    TOOLS.map(async (t) => ({ ...t, estadoOperativo: await toolsRepository.obtenerEstado(t.id) })),
  )
}

export async function listarHerramientasPublicasVista(): Promise<HerramientaVista[]> {
  const resultados = await Promise.allSettled(
    TOOLS.map(async (manifest) => ({
      ...manifest,
      estadoOperativo: await toolsRepository.obtenerEstado(manifest.id),
    })),
  )

  return resultados.flatMap((resultado, indice) => {
    if (resultado.status === 'fulfilled') {
      return esHerramientaVisiblePublicamente(resultado.value) ? [resultado.value] : []
    }
    const manifest = TOOLS[indice]
    if (manifest.requiereValidador) return []
    return [{ ...manifest, estadoOperativo: estadoSeguroSinBackend(manifest.id) }]
  })
}
