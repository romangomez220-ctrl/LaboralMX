/**
 * seedData.ts — datos de arranque del Portal de Validadores
 * -----------------------------------------------------------------------------
 * Se ejecuta una sola vez. Crea:
 *   - El ESTADO OPERATIVO inicial de cada herramienta de Labs que ya existe
 *     en el Registro Central (src/catalog/registry.ts) — la estructura
 *     (nombre, ruta, suite) ya no se duplica aquí, viene del registro.
 *   - Un validador de prueba y un administrador de prueba.
 * -----------------------------------------------------------------------------
 */

import type { EstadoHerramienta, Validador } from '../types'
import { listarToolsDeLabs } from '../../catalog/registry'
import {
  crearAsignacion,
  estaInicializado,
  guardarEstadoOperativo,
  guardarValidador,
  listarValidadores,
} from './localStore'

// Estado inicial por herramienta (solo lo que NO es estructura). Las que no
// se listan aquí usan el default ('en_validacion') al consultarse.
const ESTADO_INICIAL_POR_HERRAMIENTA: Record<string, EstadoHerramienta> = {
  tool_plataformas_digitales: 'pendiente',
  tool_terminos_procesales: 'en_validacion',
  tool_familiar_urgente: 'en_validacion',
}

const VALIDADOR_DEMO: Omit<Validador, 'id' | 'fechaCreacion' | 'ultimoAcceso'> = {
  usuario: 'validador.demo',
  passwordTemporal: 'Romanus2026!',
  nombre: 'Validador de Prueba',
  profesion: 'Contador Público',
  especialidad: 'Fiscal — personas físicas',
  nivel: 'validador_beta',
  estado: 'activo',
  calificacionInterna: null,
  notasAdmin: 'Cuenta de prueba creada automáticamente por el sistema (seedData).',
}

const ADMIN_USUARIO_DEMO = 'admin.romanus'
const ADMIN_PASSWORD_DEMO = 'RomanusAdmin2026!'

export function obtenerCredencialesAdminDemo() {
  return { usuario: ADMIN_USUARIO_DEMO, password: ADMIN_PASSWORD_DEMO }
}

export function validarCredencialesAdmin(usuario: string, password: string): boolean {
  return usuario === ADMIN_USUARIO_DEMO && password === ADMIN_PASSWORD_DEMO
}

export function inicializarDatosDePrueba(): void {
  if (estaInicializado()) return

  listarToolsDeLabs().forEach((tool) => {
    guardarEstadoOperativo({
      herramientaId: tool.id,
      estado: ESTADO_INICIAL_POR_HERRAMIENTA[tool.id] ?? 'en_validacion',
      visiblePublicamente: false,
      disponibleSoloLabs: true,
      nivelMinimoRequerido: null,
    })
  })

  if (listarValidadores().length === 0) {
    const validador = {
      ...VALIDADOR_DEMO,
      id: `val_demo_${Date.now()}`,
      fechaCreacion: new Date().toISOString(),
      ultimoAcceso: null,
    }
    guardarValidador(validador)

    // Asigna las 3 herramientas de menor nivel requerido al validador demo,
    // para que el portal no se vea vacío en el primer ingreso.
    crearAsignacion(validador.id, 'tool_resico')
    crearAsignacion(validador.id, 'tool_xml_cfdi')
    crearAsignacion(validador.id, 'tool_devolucion_impuestos')
  }
}
