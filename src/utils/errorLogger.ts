import { trackEvent } from './analytics'

export interface RegistroError {
  mensaje: string
  stack?: string
  ruta: string
  navegador: string
  fechaHora: string
  componente: string
}

const CLAVE_STORAGE = 'romanus_error_log'
const MAX_REGISTROS = 20

/**
 * Registra un error de forma centralizada: consola (siempre), GA4 (vía
 * trackEvent, reutilizando la integración ya existente) y sessionStorage
 * (para poder inspeccionar errores recientes sin depender solo de la
 * consola, útil en producción). Nunca lanza — si sessionStorage falla
 * (modo privado, cuota llena), el error ya quedó en consola y en GA4.
 */
export function registrarError(
  error: Error,
  componente: string,
  componentStack?: string,
): RegistroError {
  const registro: RegistroError = {
    mensaje: error.message,
    stack: componentStack ?? error.stack,
    ruta: typeof window !== 'undefined' ? window.location.pathname : '(desconocida)',
    navegador: typeof navigator !== 'undefined' ? navigator.userAgent : '(desconocido)',
    fechaHora: new Date().toISOString(),
    componente,
  }

  console.error(`[ROMANUS] Error en "${componente}" (${registro.ruta}):`, error)

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const previos = obtenerErroresRegistrados()
      const actualizados = [registro, ...previos].slice(0, MAX_REGISTROS)
      window.sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(actualizados))
    }
  } catch {
    // No crítico: el registro ya está en consola.
  }

  trackEvent('app_error', {
    componente,
    ruta: registro.ruta,
    mensaje: registro.mensaje,
  })

  return registro
}

/** Lee el historial de errores de esta sesión (más reciente primero). */
export function obtenerErroresRegistrados(): RegistroError[] {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return []
    const crudo = window.sessionStorage.getItem(CLAVE_STORAGE)
    return crudo ? (JSON.parse(crudo) as RegistroError[]) : []
  } catch {
    return []
  }
}
