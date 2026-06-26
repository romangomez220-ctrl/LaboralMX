/**
 * types.ts — ROMANUS Labs: Portal de Validadores + Admin
 * -----------------------------------------------------------------------------
 * Estos tipos están diseñados para mapear 1:1 a futuras tablas de Supabase
 * (validators, tools, assignments, feedback, activity_log). Hoy se
 * persisten en localStorage (ver storage/localStore.ts); el día que se
 * migre a Supabase, estos tipos casi no deberían cambiar — solo cambia
 * DÓNDE se guardan y CÓMO se autentica, no la forma de los datos.
 *
 * ADVERTENCIA DE SEGURIDAD (no quitar este comentario al migrar):
 * Mientras este sistema use únicamente localStorage, NO ofrece seguridad
 * real. Cualquier persona con acceso al navegador (DevTools → Application →
 * Local Storage) puede leer usuarios, "contraseñas" y la sesión activa de
 * cualquier validador o del administrador, y puede modificarlos
 * directamente sin pasar por ningún login. Esto es aceptable únicamente
 * para una fase interna de validadores de confianza, nunca para datos
 * reales de clientes ni para producción pública.
 * -----------------------------------------------------------------------------
 */

// ---------- Niveles (solo metadata, sin lógica de permisos todavía) ----------

export type NivelValidador =
  | 'validador_beta'
  | 'validador_especialista'
  | 'validador_senior'
  | 'miembro_fundador'
  | 'consejo_tecnico'

export const NIVELES_VALIDADOR: { value: NivelValidador; label: string; orden: number }[] = [
  { value: 'validador_beta', label: 'Validador Beta', orden: 1 },
  { value: 'validador_especialista', label: 'Validador Especialista', orden: 2 },
  { value: 'validador_senior', label: 'Validador Senior', orden: 3 },
  { value: 'miembro_fundador', label: 'Miembro Fundador', orden: 4 },
  { value: 'consejo_tecnico', label: 'Consejo Técnico ROMANUS', orden: 5 },
]

// ---------- Validador ----------

export type EstadoValidador = 'activo' | 'inactivo'

export interface Validador {
  id: string
  usuario: string
  /**
   * Contraseña temporal en TEXTO PLANO. Ver advertencia de seguridad en el
   * encabezado del archivo — esto NUNCA debe sobrevivir a la migración a
   * Supabase Auth, donde las contraseñas las gestiona el proveedor de
   * autenticación, nunca la aplicación.
   */
  passwordTemporal: string
  nombre: string
  profesion: string
  especialidad: string
  nivel: NivelValidador
  estado: EstadoValidador
  fechaCreacion: string
  ultimoAcceso: string | null
  calificacionInterna: number | null // 1-5, asignada por el admin
  notasAdmin: string
}

// ---------- Estado operativo de Herramienta ----------
// La ESTRUCTURA de una herramienta (nombre, suite, ruta, categoría...) ahora
// vive en el Registro Central (src/catalog/registry.ts), que es código, no
// datos editables. Lo que el admin SÍ puede editar en vivo —estado de
// publicación, visibilidad, nivel mínimo— vive aquí, referenciando al
// registro por su id estable. Esto es la separación "el registro declara
// qué existe; el estado operativo declara su situación actual" de la
// Constitución Técnica v1.0 (documento 3 de la serie de arquitectura).

export type EstadoHerramienta = 'pendiente' | 'en_validacion' | 'lista_para_publico' | 'publicada'

export interface EstadoOperativoHerramienta {
  /** Referencia al id estable de ToolManifest en src/catalog/registry.ts */
  herramientaId: string
  estado: EstadoHerramienta
  visiblePublicamente: boolean
  disponibleSoloLabs: boolean
  /** Override del nivelMinimoAccesoDefault del registro; null = usar el default. */
  nivelMinimoRequerido: NivelValidador | null
}

// ---------- Asignación (validador ↔ herramienta) ----------

export type EstadoAsignacion = 'pendiente' | 'en_revision' | 'completada'

export interface Asignacion {
  id: string
  validadorId: string
  herramientaId: string
  estado: EstadoAsignacion
  fechaAsignacion: string
  fechaActualizacion: string | null
}

// ---------- Feedback ----------

export type EstadoFeedback = 'pendiente' | 'en_revision' | 'resuelto'
export type TipoFeedback = 'error' | 'idea' | 'comentario_general'

export interface Feedback {
  id: string
  herramientaId: string
  validadorId: string
  fecha: string
  calificacion: number // 1-5
  tipo: TipoFeedback
  comentario: string
  estado: EstadoFeedback
}

// ---------- Actividad ----------

export type TipoActividad = 'login' | 'logout' | 'herramienta_abierta' | 'feedback_enviado'

export interface RegistroActividad {
  id: string
  validadorId: string
  tipo: TipoActividad
  fecha: string
  herramientaId: string | null
  duracionAproxSegundos: number | null
}
