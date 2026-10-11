import { describe, expect, it } from 'vitest'
import type { ToolManifest } from '../catalog/types'
import type { EstadoOperativoHerramienta } from '../labs-portal/types'
import { esHerramientaVisiblePublicamente, type HerramientaVista } from './toolsView'

const baseManifest: ToolManifest = {
  id: 'tool_prueba',
  clave: 'prueba',
  nombreVisible: 'Herramienta de prueba',
  suiteId: 'suite_juridica',
  descripcion: 'Prueba',
  categoria: 'calculadora',
  audiencia: 'personal',
  ruta: '/labs/prueba',
  requiereValidador: true,
  nivelMinimoAccesoDefault: 'validador_beta',
  perfilRecomendado: 'Validador',
  versionSoftware: '1.0',
}

const estadoPublicable: EstadoOperativoHerramienta = {
  herramientaId: baseManifest.id,
  estado: 'lista_para_publico',
  visiblePublicamente: true,
  disponibleSoloLabs: false,
  nivelMinimoRequerido: null,
}

function herramienta(
  manifest: Partial<ToolManifest> = {},
  estado: Partial<EstadoOperativoHerramienta> = {},
): HerramientaVista {
  return {
    ...baseManifest,
    ...manifest,
    estadoOperativo: { ...estadoPublicable, ...estado },
  }
}

describe('visibilidad pública de herramientas', () => {
  it('nunca expone una herramienta de Labs sin ruta pública dedicada', () => {
    expect(esHerramientaVisiblePublicamente(herramienta())).toBe(false)
  })

  it('expone una herramienta validada cuando tiene ruta pública y deja de ser exclusiva de Labs', () => {
    expect(esHerramientaVisiblePublicamente(herramienta({ rutaPublica: '/herramientas/prueba' }))).toBe(true)
  })

  it('mantiene oculta una herramienta con estado de validación aunque tenga ruta pública', () => {
    expect(esHerramientaVisiblePublicamente(herramienta(
      { rutaPublica: '/herramientas/prueba' },
      { estado: 'en_validacion' },
    ))).toBe(false)
  })

  it('mantiene siempre visibles las herramientas públicas que no requieren validador', () => {
    expect(esHerramientaVisiblePublicamente(herramienta({ requiereValidador: false }))).toBe(true)
  })
})
