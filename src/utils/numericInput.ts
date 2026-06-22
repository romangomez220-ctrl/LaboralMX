/**
 * Utilidades para inputs numéricos controlados como texto. Permiten que
 * el campo quede vacío temporalmente mientras el usuario escribe, evitan
 * ceros a la izquierda visuales (ej. "0666") y centralizan la conversión
 * a number, que se hace únicamente al calcular — nunca en cada tecleo.
 */

/**
 * Limpia el valor crudo de un input numérico controlado como texto:
 * - Solo permite dígitos y un único punto decimal.
 * - Colapsa puntos decimales adicionales si el usuario los teclea.
 * - Elimina ceros a la izquierda (ej. "06" -> "6"), salvo que formen
 *   parte de un decimal como "0.5".
 */
export function limpiarEntradaNumerica(valorCrudo: string): string {
  let limpio = valorCrudo.replace(/[^\d.]/g, '')

  const partes = limpio.split('.')
  if (partes.length > 2) {
    limpio = `${partes[0]}.${partes.slice(1).join('')}`
  }

  if (/^0+\d/.test(limpio)) {
    limpio = limpio.replace(/^0+/, '')
  }

  if (limpio.startsWith('.')) {
    limpio = `0${limpio}`
  }

  return limpio
}

/**
 * Convierte el texto de un input numérico a number SOLO al momento de
 * calcular (no en cada tecleo). Si el campo quedó vacío o no es un
 * número válido, regresa el valor por defecto.
 */
export function aNumero(valorTexto: string, porDefecto = 0): number {
  if (valorTexto.trim() === '') return porDefecto
  const n = Number(valorTexto)
  return Number.isNaN(n) ? porDefecto : n
}
