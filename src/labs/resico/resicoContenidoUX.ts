import type { NivelConfianza, ResicoFormData, ResultadoResico } from './resicoTypes'
import { LIMITE_ANUAL_RESICO } from './resicoCalculations'
import type { ValidateItem } from '../components/ValidateWithExpertCard'

/**
 * Este archivo SOLO genera contenido de presentación (texto, listas) a
 * partir del resultado que ya calculó resicoCalculations.ts. No agrega
 * ni cambia ninguna regla fiscal, tasa, ni el cálculo del nivel de
 * confianza — únicamente consume sus resultados para enriquecer cómo se
 * explican al usuario.
 */

/**
 * Posibles beneficios, en lenguaje condicional ("podría", "potencial-
 * mente"), nunca como hechos. Si el escenario no es elegible para
 * RESICO, no tiene sentido listar beneficios de un régimen que no
 * aplicaría, así que regresa una lista vacía (la tarjeta no se muestra).
 */
export function generarBeneficios(form: ResicoFormData, resultado: ResultadoResico): string[] {
  if (!resultado.elegible) return []

  const beneficios = [
    'El ISR podría representar una carga menor en comparación con otros regímenes, dependiendo de la situación particular.',
    'Las declaraciones mensuales podrían resultar más simples, al no requerir el cálculo de deducciones.',
    'La carga administrativa podría reducirse en comparación con el régimen general.',
    'El cálculo del impuesto podría ser más claro, al aplicarse una tasa fija sobre el ingreso cobrado.',
  ]

  if (form.facturacion !== 'personas_fisicas') {
    beneficios.push(
      'El flujo de efectivo podría ser potencialmente más eficiente, ya que las retenciones de personas morales podrían generar saldo a favor recuperable mensualmente.',
    )
  }

  return beneficios
}

/**
 * Riesgos o puntos de atención relevantes para el caso concreto. Solo
 * incluye los que aplican según las respuestas capturadas (no muestra
 * una lista genérica fija).
 */
export function generarRiesgos(form: ResicoFormData, resultado: ResultadoResico): string[] {
  const riesgos: string[] = ['Cumplimiento de los requisitos de permanencia en RESICO.']

  if (resultado.ingresoAnual >= LIMITE_ANUAL_RESICO * 0.9) {
    riesgos.push('Ingresos cercanos al límite permitido para mantenerse en RESICO.')
  }
  if (form.actividad === 'otra') {
    riesgos.push(
      'Posibles actividades incompatibles con RESICO, dado que la actividad capturada no corresponde a una categoría típica del régimen.',
    )
  }
  if (form.iva !== 'no_cobra') {
    riesgos.push('Obligaciones relacionadas con IVA, que son independientes del ISR que calcula RESICO.')
  }
  if (form.facturacion !== 'personas_fisicas') {
    riesgos.push('Retenciones aplicables por parte de clientes personas morales.')
  }
  if (form.situacion !== 'dado_de_alta') {
    riesgos.push('Riesgos de una migración incorrecta de régimen al darse de alta o cambiar de régimen fiscal.')
  }
  riesgos.push('Cambios futuros en los ingresos que puedan modificar el tramo aplicable o la elegibilidad.')

  return riesgos
}

/**
 * Checklist estándar para validar con un contador. Siempre se muestran
 * los 8 puntos (es la lista de verificación completa), pero se marcan
 * como "relevantes para tu caso" los que tienen más peso según las
 * respuestas capturadas, sin ocultar los demás.
 */
export function generarChecklistValidacion(form: ResicoFormData, resultado: ResultadoResico): ValidateItem[] {
  return [
    { text: 'Régimen fiscal actual', highlighted: form.situacion !== 'dado_de_alta' },
    { text: 'Obligaciones vigentes' },
    { text: 'Manejo de IVA', highlighted: form.iva !== 'no_cobra' },
    { text: 'Facturación', highlighted: form.facturacion !== 'personas_fisicas' },
    { text: 'Retenciones', highlighted: form.facturacion !== 'personas_fisicas' },
    { text: 'Actividades económicas registradas', highlighted: form.actividad === 'otra' },
    { text: 'Proyección de ingresos', highlighted: resultado.ingresoAnual >= LIMITE_ANUAL_RESICO * 0.9 },
    { text: 'Compatibilidad con RESICO', highlighted: !resultado.elegible },
  ]
}

/**
 * Explicación visual del nivel de confianza ya determinado por
 * evaluarConfianza() en resicoCalculations.ts. No reevalúa nada, solo
 * traduce el nivel a una frase clara para quien no es contador.
 */
export function generarExplicacionConfianza(nivel: NivelConfianza): string {
  switch (nivel) {
    case 'alto':
      return 'La información proporcionada es consistente y cumple con la mayoría de los criterios identificados para RESICO.'
    case 'medio':
      return 'La información proporcionada es mayormente consistente, aunque existen algunos puntos que conviene confirmar antes de tomar una decisión.'
    case 'bajo':
    default:
      return 'La información proporcionada presenta variables relevantes de incertidumbre; se recomienda una revisión profesional antes de continuar.'
  }
}

/**
 * Categorías generales que el diagnóstico considera siempre (no son los
 * "factores de alerta" específicos de evaluarConfianza, sino las áreas
 * generales evaluadas, para transparencia con quien no es contador).
 */
export function generarFactoresEvaluados(): string[] {
  return ['Nivel de ingresos', 'Actividad económica', 'Consistencia de datos', 'Compatibilidad preliminar']
}

export const TEXTO_IMPORTANTE_RESICO =
  'Este resultado es una orientación informativa basada en los datos capturados y no constituye asesoría fiscal, contable ni legal. Antes de realizar cualquier cambio de régimen fiscal se recomienda consultar con un profesionista calificado.'
