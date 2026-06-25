/**
 * seedData.ts — datos de arranque del Portal de Validadores
 * -----------------------------------------------------------------------------
 * Se ejecuta una sola vez, la primera vez que alguien visita /labs, si la
 * "tabla" de herramientas está vacía. Crea:
 *   - El registro de las 6 herramientas que YA EXISTEN en Labs (RESICO,
 *     XML CFDI, y las 4 de Contable Suite v5.0) — no se duplica ninguna
 *     ruta, solo se les agrega metadata para el portal.
 *   - Un validador de prueba y un administrador de prueba, para que el
 *     equipo pueda entrar de inmediato. Ver credenciales en RESUMEN-v6.0.md.
 * -----------------------------------------------------------------------------
 */

import type { Herramienta, Validador } from '../types'
import {
  crearAsignacion,
  estaInicializado,
  guardarHerramienta,
  guardarValidador,
  listarValidadores,
} from './localStore'

const HERRAMIENTAS_SEED: Herramienta[] = [
  {
    id: 'tool_resico',
    nombre: 'Diagnóstico RESICO',
    suite: 'contable',
    version: '4.8',
    estado: 'en_validacion',
    categoria: 'diagnostico',
    descripcion: 'Estima si el Régimen Simplificado de Confianza es adecuado para la situación fiscal del usuario.',
    ruta: '/labs/resico',
    perfilRecomendado: 'Contador, fiscalista',
    nivelMinimoRequerido: 'validador_beta',
    visiblePublicamente: false,
    disponibleSoloLabs: true,
  },
  {
    id: 'tool_xml_cfdi',
    nombre: 'Conversor XML CFDI',
    suite: 'contable',
    version: '4.8',
    estado: 'en_validacion',
    categoria: 'conversor',
    descripcion: 'Convierte archivos XML de CFDI (incluye Nómina) a un libro de Excel, en el navegador.',
    ruta: '/labs/xml-cfdi',
    perfilRecomendado: 'Contador, auxiliar contable',
    nivelMinimoRequerido: 'validador_beta',
    visiblePublicamente: false,
    disponibleSoloLabs: true,
  },
  {
    id: 'tool_devolucion_impuestos',
    nombre: 'Calculadora de Devolución de Impuestos',
    suite: 'contable',
    version: '5.0',
    estado: 'en_validacion',
    categoria: 'calculadora',
    descripcion: 'Calcula deducciones personales y base gravable para la declaración anual de asalariados.',
    ruta: '/labs/devolucion-impuestos',
    perfilRecomendado: 'Contador, fiscalista',
    nivelMinimoRequerido: 'validador_beta',
    visiblePublicamente: false,
    disponibleSoloLabs: true,
  },
  {
    id: 'tool_resico_anual',
    nombre: 'Declaración Anual RESICO',
    suite: 'contable',
    version: '5.0',
    estado: 'en_validacion',
    categoria: 'diagnostico',
    descripcion: 'Determina si un contribuyente RESICO está obligado a presentar declaración anual.',
    ruta: '/labs/resico-anual',
    perfilRecomendado: 'Fiscalista, abogado',
    nivelMinimoRequerido: 'validador_especialista',
    visiblePublicamente: false,
    disponibleSoloLabs: true,
  },
  {
    id: 'tool_arrendamiento',
    nombre: 'Comparador de Arrendamiento',
    suite: 'contable',
    version: '5.0',
    estado: 'en_validacion',
    categoria: 'comparador',
    descripcion: 'Compara deducción ciega (35%) vs. gastos reales para arrendadores personas físicas.',
    ruta: '/labs/arrendamiento',
    perfilRecomendado: 'Contador, fiscalista',
    nivelMinimoRequerido: 'validador_beta',
    visiblePublicamente: false,
    disponibleSoloLabs: true,
  },
  {
    id: 'tool_plataformas_digitales',
    nombre: 'Retenciones por Plataformas Digitales 2026',
    suite: 'contable',
    version: '5.0',
    estado: 'pendiente',
    categoria: 'calculadora',
    descripcion: 'Calcula retenciones de ISR/IVA por plataformas digitales — contiene un punto legal disputado, requiere revisión prioritaria.',
    ruta: '/labs/plataformas-digitales',
    perfilRecomendado: 'Abogado, fiscalista, secretario de tribunal',
    nivelMinimoRequerido: 'validador_especialista',
    visiblePublicamente: false,
    disponibleSoloLabs: true,
  },
]

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

  HERRAMIENTAS_SEED.forEach(guardarHerramienta)

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
