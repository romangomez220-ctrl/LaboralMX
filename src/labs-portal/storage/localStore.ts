/**
 * localStore.ts — capa de persistencia para el Portal de Validadores
 * -----------------------------------------------------------------------------
 * ÚNICO ARCHIVO QUE DEBE CAMBIAR AL MIGRAR A SUPABASE. El resto de la
 * aplicación (componentes, hooks, páginas) llama a las funciones de este
 * archivo (listarValidadores, guardarValidador, etc.), nunca a
 * localStorage directamente. El día de la migración, estas mismas
 * funciones se reescriben para hacer `await supabase.from('validadores')...`
 * en vez de leer/escribir localStorage, y ningún otro archivo del proyecto
 * debería necesitar cambios de lógica — solo volverse async si no lo eran
 * (ver nota de firma de funciones abajo).
 *
 * Estructura de "tablas" en localStorage (un key por tabla, cada uno un
 * array JSON — el equivalente más simple a filas de una tabla SQL):
 *   romanus_labs_validadores
 *   romanus_labs_herramientas
 *   romanus_labs_asignaciones
 *   romanus_labs_feedback
 *   romanus_labs_actividad
 *   romanus_labs_sesion_validador   (no es una tabla, es la sesión activa)
 *   romanus_labs_sesion_admin       (no es una tabla, es la sesión activa)
 *
 * ADVERTENCIA DE SEGURIDAD: localStorage no está cifrado ni protegido.
 * Todo lo que se guarda aquí es legible y modificable por cualquiera con
 * acceso al navegador. No guardar aquí nada que no pueda quedar expuesto.
 * -----------------------------------------------------------------------------
 */

import type { Asignacion, Feedback, Herramienta, RegistroActividad, Validador } from '../types'

const KEYS = {
  validadores: 'romanus_labs_validadores',
  herramientas: 'romanus_labs_herramientas',
  asignaciones: 'romanus_labs_asignaciones',
  feedback: 'romanus_labs_feedback',
  actividad: 'romanus_labs_actividad',
  sesionValidador: 'romanus_labs_sesion_validador',
  sesionAdmin: 'romanus_labs_sesion_admin',
} as const

function leer<T>(key: string, porDefecto: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return porDefecto
    return JSON.parse(raw) as T
  } catch {
    return porDefecto
  }
}

function escribir<T>(key: string, valor: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(valor))
  } catch {
    // localStorage puede fallar (modo incógnito estricto, cuota llena).
    // Se ignora silenciosamente; el Portal de Validadores es una capa
    // interna no crítica para el funcionamiento público de ROMANUS.
  }
}

function generarId(prefijo: string): string {
  return `${prefijo}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ---------- Validadores ----------
// NOTA DE FIRMA: estas funciones son síncronas hoy porque localStorage es
// síncrono. Al migrar a Supabase, todas deben volverse `async` y usar
// `await`; los componentes que las llamen deberán actualizarse para usar
// `await` o `.then()`, pero la FORMA de los datos que reciben no cambia.

export function listarValidadores(): Validador[] {
  return leer<Validador[]>(KEYS.validadores, [])
}

export function obtenerValidadorPorId(id: string): Validador | null {
  return listarValidadores().find((v) => v.id === id) ?? null
}

export function obtenerValidadorPorUsuario(usuario: string): Validador | null {
  return listarValidadores().find((v) => v.usuario.toLowerCase() === usuario.toLowerCase()) ?? null
}

export function guardarValidador(validador: Validador): void {
  const lista = listarValidadores()
  const idx = lista.findIndex((v) => v.id === validador.id)
  if (idx >= 0) {
    lista[idx] = validador
  } else {
    lista.push(validador)
  }
  escribir(KEYS.validadores, lista)
}

export function eliminarValidador(id: string): void {
  escribir(KEYS.validadores, listarValidadores().filter((v) => v.id !== id))
}

export function crearValidador(datos: Omit<Validador, 'id' | 'fechaCreacion' | 'ultimoAcceso'>): Validador {
  const nuevo: Validador = {
    ...datos,
    id: generarId('val'),
    fechaCreacion: new Date().toISOString(),
    ultimoAcceso: null,
  }
  guardarValidador(nuevo)
  return nuevo
}

// ---------- Herramientas ----------

export function listarHerramientas(): Herramienta[] {
  return leer<Herramienta[]>(KEYS.herramientas, [])
}

export function obtenerHerramientaPorId(id: string): Herramienta | null {
  return listarHerramientas().find((h) => h.id === id) ?? null
}

export function obtenerHerramientaPorRuta(ruta: string): Herramienta | null {
  return listarHerramientas().find((h) => h.ruta === ruta) ?? null
}

export function guardarHerramienta(herramienta: Herramienta): void {
  const lista = listarHerramientas()
  const idx = lista.findIndex((h) => h.id === herramienta.id)
  if (idx >= 0) {
    lista[idx] = herramienta
  } else {
    lista.push(herramienta)
  }
  escribir(KEYS.herramientas, lista)
}

// ---------- Asignaciones ----------

export function listarAsignaciones(): Asignacion[] {
  return leer<Asignacion[]>(KEYS.asignaciones, [])
}

export function listarAsignacionesPorValidador(validadorId: string): Asignacion[] {
  return listarAsignaciones().filter((a) => a.validadorId === validadorId)
}

export function listarAsignacionesPorHerramienta(herramientaId: string): Asignacion[] {
  return listarAsignaciones().filter((a) => a.herramientaId === herramientaId)
}

export function crearAsignacion(validadorId: string, herramientaId: string): Asignacion {
  const existente = listarAsignaciones().find(
    (a) => a.validadorId === validadorId && a.herramientaId === herramientaId,
  )
  if (existente) return existente

  const nueva: Asignacion = {
    id: generarId('asig'),
    validadorId,
    herramientaId,
    estado: 'pendiente',
    fechaAsignacion: new Date().toISOString(),
    fechaActualizacion: null,
  }
  escribir(KEYS.asignaciones, [...listarAsignaciones(), nueva])
  return nueva
}

export function actualizarEstadoAsignacion(id: string, estado: Asignacion['estado']): void {
  const lista = listarAsignaciones().map((a) =>
    a.id === id ? { ...a, estado, fechaActualizacion: new Date().toISOString() } : a,
  )
  escribir(KEYS.asignaciones, lista)
}

export function eliminarAsignacion(id: string): void {
  escribir(KEYS.asignaciones, listarAsignaciones().filter((a) => a.id !== id))
}

// ---------- Feedback ----------

export function listarFeedback(): Feedback[] {
  return leer<Feedback[]>(KEYS.feedback, [])
}

export function crearFeedback(datos: Omit<Feedback, 'id' | 'fecha' | 'estado'>): Feedback {
  const nuevo: Feedback = {
    ...datos,
    id: generarId('fb'),
    fecha: new Date().toISOString(),
    estado: 'pendiente',
  }
  escribir(KEYS.feedback, [...listarFeedback(), nuevo])
  return nuevo
}

export function actualizarEstadoFeedback(id: string, estado: Feedback['estado']): void {
  const lista = listarFeedback().map((f) => (f.id === id ? { ...f, estado } : f))
  escribir(KEYS.feedback, lista)
}

// ---------- Actividad ----------

export function listarActividad(): RegistroActividad[] {
  return leer<RegistroActividad[]>(KEYS.actividad, [])
}

export function listarActividadPorValidador(validadorId: string): RegistroActividad[] {
  return listarActividad()
    .filter((a) => a.validadorId === validadorId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

export function registrarActividad(datos: Omit<RegistroActividad, 'id' | 'fecha'>): void {
  const nuevo: RegistroActividad = {
    ...datos,
    id: generarId('act'),
    fecha: new Date().toISOString(),
  }
  // Límite de 500 registros para no crecer indefinidamente en localStorage.
  const lista = [...listarActividad(), nuevo].slice(-500)
  escribir(KEYS.actividad, lista)
}

// ---------- Sesión de validador ----------
// Guarda solo el ID del validador, nunca su contraseña — incluso en este
// esquema sin seguridad real, evitamos repetir la contraseña en más de un
// lugar de localStorage.

export function obtenerSesionValidadorId(): string | null {
  return leer<string | null>(KEYS.sesionValidador, null)
}

export function iniciarSesionValidador(validadorId: string): void {
  escribir(KEYS.sesionValidador, validadorId)
}

export function cerrarSesionValidador(): void {
  localStorage.removeItem(KEYS.sesionValidador)
}

// ---------- Sesión de administrador ----------

export function haySesionAdminActiva(): boolean {
  return leer<boolean>(KEYS.sesionAdmin, false)
}

export function iniciarSesionAdmin(): void {
  escribir(KEYS.sesionAdmin, true)
}

export function cerrarSesionAdmin(): void {
  localStorage.removeItem(KEYS.sesionAdmin)
}

// ---------- Inicialización con datos de prueba ----------
// Se ejecuta una sola vez (si la "tabla" de validadores está vacía) para
// que el portal nunca arranque completamente vacío. Ver seedData.ts.

export function estaInicializado(): boolean {
  return listarHerramientas().length > 0
}
