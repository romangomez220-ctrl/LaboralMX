/**
 * resicoAnual.ts
 * -----------------------------------------------------------------------------
 * FUENTES VERIFICADAS (ver RESUMEN-v5.0.md):
 *   - LISR Art. 113-E (último párrafo): los contribuyentes RESICO PF quedan
 *     relevados de presentar declaración anual. Para el ejercicio 2026, esta
 *     liberación quedó incorporada directamente al texto de la ley (Paquete
 *     Económico 2026), no solo a una regla administrativa.
 *   - RMF 2026, Regla 3.13.7 — condiciones operativas de la liberación.
 *   - RMF 2026, Reglas 3.13.20 y 3.13.21 — presentación voluntaria para
 *     aplicar deducciones personales del Art. 151 LISR.
 *
 * ZONA GRIS DOCUMENTADA EXPLÍCITAMENTE (no resuelta unilateralmente): al
 * menos una fuente especializada (independiente de este proyecto) describe
 * la existencia de "una zona gris jurídica que hoy no está claramente
 * resuelta por la ley ni por reglas administrativas del SAT" para ciertos
 * supuestos mixtos. Esta herramienta usa la etiqueta "zona_gris" exactamente
 * para esos supuestos, en vez de forzar una respuesta binaria sin
 * fundamento cierto.
 * -----------------------------------------------------------------------------
 */

import type { ResicoAnualFormData, ResicoAnualResultado, ResultadoObligacionResico } from './types'

export function evaluarObligacionResicoAnual(data: ResicoAnualFormData): ResicoAnualResultado {
  const notas: string[] = []

  // Caso cierto: AGAPES tiene un tratamiento especial (exención hasta
  // $900,000) que esta herramienta no modela en detalle. Se marca como
  // zona gris para que el caso se revise aparte, no por descuido sino por
  // alcance explícitamente limitado de esta primera versión.
  if (data.esAgapes) {
    return {
      resultado: 'zona_gris',
      fundamento: 'Régimen de AGAPES dentro de RESICO — tratamiento especial no cubierto en esta versión.',
      explicacion:
        'Los contribuyentes del sector primario (agrícola, ganadero, pesquero, silvícola) dentro de RESICO tienen ' +
        'reglas propias, incluyendo una exención de ISR hasta $900,000 anuales. Esta herramienta no modela ese ' +
        'tratamiento en esta versión — revisa tu caso específico con un contador familiarizado con AGAPES.',
      notas,
    }
  }

  // Caso cierto: copropiedad genera obligación de declaración anual según
  // múltiples fuentes consultadas, de forma consistente.
  if (data.tieneIngresosEnCopropiedad) {
    notas.push(
      'Tener ingresos en copropiedad con otra persona genera obligación de presentar declaración anual, conforme ' +
        'a las reglas específicas de la RMF 2026 para este supuesto (ficha de trámite 83/ISR) — independientemente ' +
        'de que hayas cumplido tus pagos mensuales.',
    )
    return {
      resultado: 'obligado',
      fundamento: 'RMF 2026, disposiciones específicas para ingresos en copropiedad (ficha de trámite 83/ISR).',
      explicacion: 'Tus ingresos en copropiedad generan obligación de presentar declaración anual.',
      notas,
    }
  }

  // Caso cierto: ingresos fuera de RESICO (salarios, intereses, etc.)
  // generan obligación de declarar esos OTROS ingresos — el ingreso RESICO
  // se reporta de forma informativa dentro de la misma declaración.
  if (!data.sinIngresosFueraDeResico) {
    notas.push(
      'Tus ingresos de RESICO se reportan de forma informativa dentro de la misma declaración; no se determina ' +
        'ISR adicional sobre ellos, ya que tus pagos mensuales fueron definitivos. Pero tus otros ingresos sí se ' +
        'acumulan y pueden generar ISR adicional a cargo.',
    )
    return {
      resultado: 'obligado',
      fundamento: 'Art. 150 LISR (obligación general de declarar) — aplica a los ingresos obtenidos fuera de RESICO.',
      explicacion: 'Tienes ingresos fuera de RESICO (salarios, intereses u otros) que generan obligación de declarar.',
      notas,
    }
  }

  // Caso a revisar: exclusión a mitad de año por exceder el tope, o
  // suspensión de actividades durante el ejercicio. Las fuentes consultadas
  // no detallan con precisión suficiente el tratamiento de estos supuestos
  // mixtos — se marca como zona gris en vez de asumir una respuesta.
  if (data.fueExcluidoAMitadDeAno || data.tuvoSuspensionActividades) {
    notas.push(
      'Saliste de RESICO a mitad de año o tuviste un periodo de suspensión de actividades. Las fuentes consultadas ' +
        'en esta investigación no detallan con precisión el tratamiento de declaración anual para este supuesto ' +
        'mixto (parte del año en RESICO, parte en otro régimen o sin actividad). No se resuelve aquí como un ' +
        'criterio cierto — revisa este caso específico con un contador.',
    )
    return {
      resultado: 'zona_gris',
      fundamento: 'Sin fundamento cierto identificado en esta investigación para el supuesto mixto — requiere revisión profesional.',
      explicacion: 'Tu caso combina periodos distintos dentro del ejercicio y no tiene una respuesta binaria clara con las fuentes consultadas.',
      notas,
    }
  }

  // Caso cierto: cumplió todas las condiciones de permanencia exclusiva en
  // RESICO durante todo el ejercicio.
  if (data.pagosMensualesCompletos && data.permanecioTodoElAnoEnResico && data.noExcedioTopeAnual) {
    notas.push(
      'Puedes presentar la declaración anual de forma VOLUNTARIA si tuviste deducciones personales relevantes ' +
        '(gastos médicos, colegiaturas, intereses hipotecarios, aportaciones de retiro) — esto puede generarte un ' +
        'saldo a favor, conforme a las Reglas 3.13.20 y 3.13.21 de la RMF 2026. No es obligatorio, es una opción ' +
        'que puede convenirte.',
    )
    return {
      resultado: 'no_obligado',
      fundamento: 'Art. 113-E, último párrafo, LISR, y Regla 3.13.7 de la RMF 2026.',
      explicacion:
        'No estás obligado a presentar declaración anual: cumpliste tus pagos mensuales, permaneciste todo el ' +
        'ejercicio en RESICO de forma exclusiva, y no excediste el tope anual de $3,500,000.',
      notas,
    }
  }

  // Caso cierto: no cumplió los pagos mensuales completos.
  if (!data.pagosMensualesCompletos) {
    notas.push(
      'No presentar puntualmente tus pagos mensuales (incluso en ceros, cuando no hubo ingresos en el mes) puede ' +
        'generar un requerimiento del SAT. Si tienes pagos pendientes, regulariza antes de decidir si declaras.',
    )
    return {
      resultado: 'obligado',
      fundamento: 'Regla 3.13.7 de la RMF 2026 (la liberación de declarar exige haber cumplido los pagos mensuales).',
      explicacion: 'No cumpliste todos tus pagos mensuales del ejercicio, por lo que no aplica la liberación de declarar.',
      notas,
    }
  }

  if (!data.noExcedioTopeAnual) {
    notas.push(
      'Rebasar el tope anual de $3,500,000 te saca de RESICO al cierre del ejercicio (el cambio de régimen no es ' +
        'retroactivo al mes en que se rebasó el tope), y genera la obligación de presentar declaración anual.',
    )
    return {
      resultado: 'obligado',
      fundamento: 'Art. 113-E LISR (tope anual) y Regla 3.13.7 RMF 2026.',
      explicacion: 'Excediste el tope anual de ingresos de RESICO, por lo que no aplica la liberación de declarar.',
      notas,
    }
  }

  // Fallback: no permaneció todo el año en el régimen, sin encajar en los
  // casos anteriores — zona gris por defecto, no asumir.
  notas.push(
    'No permaneciste todo el ejercicio en RESICO de forma exclusiva, y tu caso no encaja exactamente en los ' +
      'supuestos verificados en esta investigación. No se asume una respuesta — revisa con un contador.',
  )
  return {
    resultado: 'zona_gris',
    fundamento: 'Sin fundamento cierto identificado en esta investigación para tu combinación exacta de respuestas.',
    explicacion: 'Tu caso requiere revisión profesional directa.',
    notas,
  }
}
