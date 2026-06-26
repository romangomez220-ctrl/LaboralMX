/**
 * catalog/types.ts — Registro Central de Suites y Herramientas
 * -----------------------------------------------------------------------------
 * Implementa la Fase 1 de la Constitución Técnica v1.0 / documento 3 de la
 * serie de arquitectura ("Registro Central de Suites y Herramientas").
 *
 * Este registro es CÓDIGO, no datos editables en runtime — es la estructura
 * que existe porque alguien escribió y desplegó una ruta/componente real.
 * Por diseño, NO contiene:
 *   - estado operativo mutable (eso vive en EstadoHerramienta, hoy en
 *     localStorage, migrará a la tabla `tools` de Supabase en la Fase 3/4);
 *   - validadores, asignaciones ni feedback (eso vive en Validation Program);
 *   - lógica de quién puede acceder (eso es de Identity/permisos, que
 *     CONSULTA `nivelMinimoAcceso` como dato, no lo decide aquí).
 *
 * Principio de identidad estable (Constitución, documento 3, principio 2):
 * `id` y `clave` no cambian nunca. `nombreVisible` puede cambiar siempre sin
 * romper ninguna referencia, porque nada referencia el nombre.
 * -----------------------------------------------------------------------------
 */

export type ClaveSuite = 'laboral' | 'contable'

export type CategoriaHerramienta = 'calculadora' | 'diagnostico' | 'conversor' | 'comparador'
export type AudienciaHerramienta = 'personal' | 'empresa' | 'ambas'

export interface SuiteManifest {
  id: string
  clave: ClaveSuite
  nombreVisible: string
  descripcion: string
  areaDePractica: string
}

export interface ToolManifest {
  id: string
  clave: string
  nombreVisible: string
  suiteId: string
  descripcion: string
  categoria: CategoriaHerramienta
  audiencia: AudienciaHerramienta
  /** Ruta pública/de Labs donde vive — el Router genera <Route> a partir de esto. */
  ruta: string
  /**
   * Si es false, la herramienta no pasa por el guard de validador (caso de
   * las 5 calculadoras públicas de Laboral Suite). Si es true, su ruta debe
   * registrarse dentro del árbol protegido de Labs.
   */
  requiereValidador: boolean
  nivelMinimoAccesoDefault: string
  perfilRecomendado: string
  versionSoftware: string
}
