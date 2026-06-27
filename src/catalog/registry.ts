/**
 * catalog/registry.ts — el Registro Central en sí
 * -----------------------------------------------------------------------------
 * Única fuente de verdad de qué Suites y qué Herramientas existen. Labs,
 * Admin y el Router leen de aquí — ninguno mantiene su propia lista.
 *
 * Alcance de esta fase (justificado explícitamente, ver mensaje de entrega):
 *   - Las herramientas internas de Labs generan sus <Route> desde
 *     este registro (la doble fuente de verdad real antes era:
 *     App.tsx por un lado, seedData.ts por otro).
 *   - Las 5 calculadoras públicas de Laboral Suite quedan registradas aquí
 *     como metadata (para que el catálogo esté completo), pero sus rutas
 *     siguen siendo las mismas líneas de JSX ya existentes en App.tsx,
 *     anidadas bajo su layout propio — refactorizar esa anidación está
 *     fuera del alcance de esta fase y no era parte del problema reportado.
 * -----------------------------------------------------------------------------
 */

import type { SuiteManifest, ToolManifest } from './types'

export type { SuiteManifest, ToolManifest } from './types'

export const SUITES: SuiteManifest[] = [
  {
    id: 'suite_laboral',
    clave: 'laboral',
    nombreVisible: 'Laboral Suite',
    descripcion: 'Calculadoras de finiquito, liquidación, aguinaldo, vacaciones y SDI.',
    areaDePractica: 'Laboral',
  },
  {
    id: 'suite_contable',
    clave: 'contable',
    nombreVisible: 'Contable Suite',
    descripcion: 'Herramientas fiscales y contables para personas físicas y empresas.',
    areaDePractica: 'Fiscal',
  },
  {
    id: 'suite_juridica',
    clave: 'juridica',
    nombreVisible: 'Jurídico Suite',
    descripcion: 'Herramientas de apoyo operativo para abogados litigantes y despachos.',
    areaDePractica: 'Jurídica',
  },
]

export const TOOLS: ToolManifest[] = [
  // --- Laboral Suite (pública, sin validador) ---
  {
    id: 'tool_finiquito',
    clave: 'finiquito',
    nombreVisible: 'Finiquito',
    suiteId: 'suite_laboral',
    descripcion: 'Calculadora de finiquito laboral.',
    categoria: 'calculadora',
    audiencia: 'personal',
    ruta: '/productos/laboralmx/finiquito',
    requiereValidador: false,
    nivelMinimoAccesoDefault: 'publico',
    perfilRecomendado: 'Trabajador, RH',
    versionSoftware: '4.9.2',
  },
  {
    id: 'tool_liquidacion',
    clave: 'liquidacion',
    nombreVisible: 'Liquidación',
    suiteId: 'suite_laboral',
    descripcion: 'Calculadora de liquidación laboral.',
    categoria: 'calculadora',
    audiencia: 'personal',
    ruta: '/productos/laboralmx/liquidacion',
    requiereValidador: false,
    nivelMinimoAccesoDefault: 'publico',
    perfilRecomendado: 'Trabajador, RH',
    versionSoftware: '4.9.2',
  },
  {
    id: 'tool_aguinaldo',
    clave: 'aguinaldo',
    nombreVisible: 'Aguinaldo',
    suiteId: 'suite_laboral',
    descripcion: 'Calculadora de aguinaldo proporcional.',
    categoria: 'calculadora',
    audiencia: 'personal',
    ruta: '/productos/laboralmx/aguinaldo',
    requiereValidador: false,
    nivelMinimoAccesoDefault: 'publico',
    perfilRecomendado: 'Trabajador, RH',
    versionSoftware: '4.9.2',
  },
  {
    id: 'tool_vacaciones',
    clave: 'vacaciones',
    nombreVisible: 'Vacaciones y prima vacacional',
    suiteId: 'suite_laboral',
    descripcion: 'Calculadora de vacaciones y prima vacacional.',
    categoria: 'calculadora',
    audiencia: 'personal',
    ruta: '/productos/laboralmx/vacaciones',
    requiereValidador: false,
    nivelMinimoAccesoDefault: 'publico',
    perfilRecomendado: 'Trabajador, RH',
    versionSoftware: '4.9.2',
  },
  {
    id: 'tool_sdi',
    clave: 'sdi',
    nombreVisible: 'Salario Diario Integrado (SDI)',
    suiteId: 'suite_laboral',
    descripcion: 'Calculadora de SDI con prestaciones mínimas de ley.',
    categoria: 'calculadora',
    audiencia: 'personal',
    ruta: '/productos/laboralmx/sdi',
    requiereValidador: false,
    nivelMinimoAccesoDefault: 'publico',
    perfilRecomendado: 'Trabajador, RH',
    versionSoftware: '4.9.2',
  },

  // --- Contable Suite (Labs, requiere validador) ---
  {
    id: 'tool_resico',
    clave: 'resico',
    nombreVisible: 'Diagnóstico RESICO',
    suiteId: 'suite_contable',
    descripcion: 'Estima si el Régimen Simplificado de Confianza es adecuado para la situación fiscal del usuario.',
    categoria: 'diagnostico',
    audiencia: 'personal',
    ruta: '/labs/resico',
    requiereValidador: true,
    nivelMinimoAccesoDefault: 'validador_beta',
    perfilRecomendado: 'Contador, fiscalista',
    versionSoftware: '4.8',
  },
  {
    id: 'tool_xml_cfdi',
    clave: 'xml-cfdi',
    nombreVisible: 'Conversor XML CFDI',
    suiteId: 'suite_contable',
    descripcion: 'Convierte archivos XML de CFDI (incluye Nómina) a un libro de Excel, en el navegador.',
    categoria: 'conversor',
    audiencia: 'ambas',
    ruta: '/labs/xml-cfdi',
    requiereValidador: true,
    nivelMinimoAccesoDefault: 'validador_beta',
    perfilRecomendado: 'Contador, auxiliar contable',
    versionSoftware: '4.8',
  },
  {
    id: 'tool_devolucion_impuestos',
    clave: 'devolucion-impuestos',
    nombreVisible: 'Calculadora de Devolución de Impuestos',
    suiteId: 'suite_contable',
    descripcion: 'Calcula deducciones personales y base gravable para la declaración anual de asalariados.',
    categoria: 'calculadora',
    audiencia: 'personal',
    ruta: '/labs/devolucion-impuestos',
    requiereValidador: true,
    nivelMinimoAccesoDefault: 'validador_beta',
    perfilRecomendado: 'Contador, fiscalista',
    versionSoftware: '5.0',
  },
  {
    id: 'tool_resico_anual',
    clave: 'resico-anual',
    nombreVisible: 'Declaración Anual RESICO',
    suiteId: 'suite_contable',
    descripcion: 'Determina si un contribuyente RESICO está obligado a presentar declaración anual.',
    categoria: 'diagnostico',
    audiencia: 'personal',
    ruta: '/labs/resico-anual',
    requiereValidador: true,
    nivelMinimoAccesoDefault: 'validador_especialista',
    perfilRecomendado: 'Fiscalista, abogado',
    versionSoftware: '5.0',
  },
  {
    id: 'tool_arrendamiento',
    clave: 'arrendamiento',
    nombreVisible: 'Comparador de Arrendamiento',
    suiteId: 'suite_contable',
    descripcion: 'Compara deducción ciega (35%) vs. gastos reales para arrendadores personas físicas.',
    categoria: 'comparador',
    audiencia: 'personal',
    ruta: '/labs/arrendamiento',
    requiereValidador: true,
    nivelMinimoAccesoDefault: 'validador_beta',
    perfilRecomendado: 'Contador, fiscalista',
    versionSoftware: '5.0',
  },
  {
    id: 'tool_plataformas_digitales',
    clave: 'plataformas-digitales',
    nombreVisible: 'Retenciones por Plataformas Digitales 2026',
    suiteId: 'suite_contable',
    descripcion: 'Calcula retenciones de ISR/IVA por plataformas digitales — contiene un punto legal disputado, requiere revisión prioritaria.',
    categoria: 'calculadora',
    audiencia: 'personal',
    ruta: '/labs/plataformas-digitales',
    requiereValidador: true,
    nivelMinimoAccesoDefault: 'validador_especialista',
    perfilRecomendado: 'Abogado, fiscalista, secretario de tribunal',
    versionSoftware: '5.0',
  },

  // --- Jurídico Suite (Labs, requiere validador) ---
  {
    id: 'tool_terminos_procesales',
    clave: 'terminos-procesales',
    nombreVisible: 'ROMANUS Términos',
    suiteId: 'suite_juridica',
    descripcion: 'Calcula vencimientos procesales base y documenta las hipótesis que el abogado debe validar.',
    categoria: 'calculadora',
    audiencia: 'ambas',
    ruta: '/labs/terminos-procesales',
    rutaPublica: '/herramientas/terminos-procesales',
    requiereValidador: true,
    nivelMinimoAccesoDefault: 'validador_beta',
    perfilRecomendado: 'Abogado litigante, pasante jurídico, coordinador de despacho',
    versionSoftware: '0.1',
  },
  {
    id: 'tool_familiar_urgente',
    clave: 'familiar-urgente',
    nombreVisible: 'Asistente Familiar Urgente',
    suiteId: 'suite_juridica',
    descripcion: 'Ordena hechos, pruebas y medidas provisionales en asuntos familiares sensibles.',
    categoria: 'asistente',
    audiencia: 'personal',
    ruta: '/labs/familiar-urgente',
    rutaPublica: '/herramientas/familiar-urgente',
    requiereValidador: true,
    nivelMinimoAccesoDefault: 'validador_especialista',
    perfilRecomendado: 'Abogado familiar, litigante civil, defensoría',
    versionSoftware: '0.1',
  },
]

export function obtenerSuitePorId(id: string): SuiteManifest | undefined {
  return SUITES.find((s) => s.id === id)
}

export function obtenerToolPorId(id: string): ToolManifest | undefined {
  return TOOLS.find((t) => t.id === id)
}

export function obtenerToolPorRuta(ruta: string): ToolManifest | undefined {
  return TOOLS.find((t) => t.ruta === ruta || t.rutaPublica === ruta)
}

export function obtenerToolPorClave(clave: string): ToolManifest | undefined {
  return TOOLS.find((t) => t.clave === clave)
}

export function listarToolsDeLabs(): ToolManifest[] {
  return TOOLS.filter((t) => t.requiereValidador)
}

export function listarToolsPorSuite(suiteId: string): ToolManifest[] {
  return TOOLS.filter((t) => t.suiteId === suiteId)
}
