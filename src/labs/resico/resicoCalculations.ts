import { round2 } from '../../utils/formatCurrency'
import type {
  NivelConfianza,
  ResicoFormData,
  ResultadoResico,
  TramoResico,
} from './resicoTypes'

/**
 * Tarifa oficial de ISR para personas físicas en RESICO,
 * conforme al Art. 113-E LISR y al Anexo 8 de la RMF 2026 (DOF, 9 de
 * diciembre de 2025). Las tasas no han cambiado desde el lanzamiento de
 * RESICO en 2022; se aplican sobre los ingresos efectivamente cobrados
 * en el periodo, SIN deducciones y SIN IVA.
 *
 * Fuente verificada: Art. 113-E LISR, RMF 2026 Anexo 8.
 */
export const TABLA_RESICO_MENSUAL: TramoResico[] = [
  { limiteInferior: 0, limiteSuperior: 25000, tasa: 0.01 },
  { limiteInferior: 25000.01, limiteSuperior: 50000, tasa: 0.011 },
  { limiteInferior: 50000.01, limiteSuperior: 83333.33, tasa: 0.015 },
  { limiteInferior: 83333.34, limiteSuperior: 208333.33, tasa: 0.02 },
  { limiteInferior: 208333.34, limiteSuperior: Infinity, tasa: 0.025 },
]

/**
 * Límite anual de ingresos para permanecer en RESICO personas físicas
 * (Art. 113-E LISR). Si se supera, el contribuyente sale del régimen.
 * Considera TODOS los ingresos del contribuyente (no solo los de RESICO).
 * Esta herramienta solo puede evaluar los ingresos que el usuario
 * capturó, por lo que el resultado es una estimación, no una validación
 * completa de elegibilidad.
 */
export const LIMITE_ANUAL_RESICO = 3_500_000

/**
 * Retención de ISR que aplican las personas morales a contribuyentes de
 * RESICO por servicios/honorarios, conforme a la LISR. Se acredita
 * contra el ISR mensual; desde 2026 el saldo a favor puede solicitarse
 * en devolución mensual (Regla 3.13.34 RMF 2026), no solo en la anual.
 */
export const RETENCION_PERSONAS_MORALES = 0.0125

function obtenerTasaResico(ingresoMensual: number): number {
  const tramo = TABLA_RESICO_MENSUAL.find(
    (t) => ingresoMensual >= t.limiteInferior && ingresoMensual <= t.limiteSuperior,
  )
  return tramo ? tramo.tasa : TABLA_RESICO_MENSUAL[TABLA_RESICO_MENSUAL.length - 1].tasa
}

interface EvaluacionConfianza {
  nivel: NivelConfianza
  factores: string[]
}

/**
 * Evalúa el nivel de confianza del diagnóstico con un sistema de puntos
 * transparente y auditable (no es un modelo de IA / caja negra): cada
 * regla que se activa suma puntos y queda registrada en `factores`, que
 * se muestra íntegro en "Modo contador".
 */
function evaluarConfianza(form: ResicoFormData, ingresoAnual: number): EvaluacionConfianza {
  if (ingresoAnual > LIMITE_ANUAL_RESICO) {
    return {
      nivel: 'bajo',
      factores: [
        'Los ingresos anuales estimados superan el límite legal de $3,500,000 MXN para permanecer en RESICO (Art. 113-E LISR).',
      ],
    }
  }

  const factores: string[] = []
  let puntos = 0

  if (ingresoAnual >= LIMITE_ANUAL_RESICO * 0.9) {
    puntos += 2
    factores.push(
      'Los ingresos anuales estimados están cerca (90% o más) del límite de $3,500,000 MXN permitido en RESICO.',
    )
  }
  if (form.iva === 'no_seguro') {
    puntos += 1
    factores.push('No hay certeza sobre si se cobra IVA, lo cual puede afectar la evaluación fiscal completa.')
  }
  if (form.situacion === 'no_seguro') {
    puntos += 1
    factores.push('No hay certeza sobre la situación fiscal actual ante el SAT.')
  }
  if (form.actividad === 'otra') {
    puntos += 1
    factores.push(
      'La actividad principal capturada no corresponde a una de las categorías típicas de RESICO, lo que dificulta evaluar la elegibilidad con precisión.',
    )
  }
  if (form.empleados === 'con_empleados') {
    puntos += 1
    factores.push(
      'Tener empleados implica obligaciones de nómina y seguridad social que no están incluidas en esta estimación de ISR.',
    )
  }
  if (form.ingresoMensual > 0 && form.gastosMensuales >= form.ingresoMensual * 0.8) {
    puntos += 1
    factores.push(
      'Los gastos aproximados representan una proporción alta de los ingresos, lo que conviene revisar con más detalle.',
    )
  }

  let nivel: NivelConfianza = 'alto'
  if (puntos >= 3) nivel = 'bajo'
  else if (puntos >= 1) nivel = 'medio'

  if (factores.length === 0) {
    factores.push('La información proporcionada es consistente y no se detectaron áreas de incertidumbre relevantes.')
  }

  return { nivel, factores }
}

function generarDiagnostico(ingresoAnual: number, nivel: NivelConfianza, tasa: number): string {
  if (ingresoAnual > LIMITE_ANUAL_RESICO) {
    return 'RESICO no sería aplicable en este momento: los ingresos anuales estimados superan el límite legal de $3,500,000 MXN para personas físicas (Art. 113-E LISR). Se recomienda revisar la situación con un contador para identificar el régimen fiscal que corresponda.'
  }
  if (nivel === 'bajo') {
    return 'La información proporcionada presenta variables que requieren revisión profesional antes de determinar si RESICO es la mejor alternativa para esta situación.'
  }
  if (nivel === 'alto' && tasa <= 0.015) {
    return 'Con base en la información proporcionada, RESICO podría representar una alternativa fiscal atractiva debido a la baja carga estimada de ISR.'
  }
  return 'Con base en la información proporcionada, RESICO parece una opción viable, aunque conviene confirmar algunos detalles con un profesional antes de tomar una decisión.'
}

function generarRecomendaciones(form: ResicoFormData, ingresoAnual: number): string[] {
  const recos: string[] = []

  if (form.iva !== 'no_cobra') {
    recos.push(
      'Revisar las obligaciones relacionadas con IVA: es un impuesto independiente del ISR que calcula RESICO.',
    )
  }
  if (form.situacion === 'dado_de_alta') {
    recos.push('Validar ante el SAT que el régimen fiscal actual corresponda efectivamente a RESICO.')
  }
  if (form.situacion === 'quiere_alta') {
    recos.push('Verificar el procedimiento de inscripción o cambio de régimen ante el SAT antes de comenzar a facturar bajo RESICO.')
  }
  if (form.situacion === 'no_seguro') {
    recos.push('Solicitar la Constancia de Situación Fiscal para confirmar el régimen actual.')
  }
  if (form.empleados === 'con_empleados') {
    recos.push('Considerar las obligaciones de nómina y seguridad social (IMSS), independientes de este diagnóstico de ISR.')
  }
  if (form.facturacion !== 'personas_fisicas') {
    recos.push(
      `Tomar en cuenta que los clientes personas morales retienen ${(RETENCION_PERSONAS_MORALES * 100).toFixed(2)}% de ISR; ese monto se acredita contra el ISR mensual y, desde 2026, el saldo a favor puede solicitarse en devolución mensual (Regla 3.13.34 RMF 2026).`,
    )
  }
  if (ingresoAnual >= LIMITE_ANUAL_RESICO * 0.9) {
    recos.push('Dar seguimiento mensual al ingreso acumulado: está cerca del límite de $3,500,000 anuales para permanecer en RESICO.')
  }

  recos.push('Validar el cumplimiento de los demás requisitos de permanencia en RESICO, más allá del límite de ingresos.')
  recos.push('Consultar con un contador antes de realizar cambios de régimen fiscal.')

  return recos
}

/**
 * Calcula el diagnóstico completo de RESICO. Simplificación deliberada:
 * usa el ingreso mensual capturado como referencia constante para
 * ubicar el tramo de la tarifa, en vez de simular el ingreso acumulado
 * real mes a mes durante el ejercicio (que es como funciona RESICO en la
 * práctica). Esta simplificación se explica en "Modo contador" y en la
 * leyenda legal, conforme al principio de ser una herramienta
 * conservadora y no inventar precisión que no se tiene.
 */
export function calcularDiagnosticoResico(form: ResicoFormData): ResultadoResico {
  const ingresoMensual = form.ingresoMensual
  const ingresoAnual = round2(ingresoMensual * 12)
  const elegible = ingresoAnual <= LIMITE_ANUAL_RESICO

  const tasa = obtenerTasaResico(ingresoMensual)
  const isrMensual = round2(ingresoMensual * tasa)
  const isrAnual = round2(isrMensual * 12)
  const ingresoNetoMensual = round2(ingresoMensual - isrMensual)
  const remanenteDespuesDeGastos = round2(ingresoNetoMensual - form.gastosMensuales)

  const { nivel, factores } = evaluarConfianza(form, ingresoAnual)
  const diagnostico = generarDiagnostico(ingresoAnual, nivel, tasa)
  const recomendaciones = generarRecomendaciones(form, ingresoAnual)

  return {
    ingresoMensual,
    ingresoAnual,
    tasa,
    isrMensual,
    isrAnual,
    ingresoNetoMensual,
    elegible,
    diagnostico,
    confianza: nivel,
    factoresConfianza: factores,
    recomendaciones,
    remanenteDespuesDeGastos,
  }
}
