/**
 * devolucionImpuestos.ts
 * -----------------------------------------------------------------------------
 * FUENTES VERIFICADAS (ver RESUMEN-v5.0.md para el detalle completo):
 *   - LISR Art. 151 (catálogo de deducciones personales y tope global).
 *   - UMA 2026: $117.31 diaria / $3,566.22 mensual / $42,794.64 anual.
 *     Fuente: INEGI, comunicado de prensa 1/26, y Diario Oficial de la
 *     Federación (publicación 9 de enero de 2026). Verificado contra DOS
 *     fuentes oficiales independientes y coincidentes.
 *   - Decreto DOF 26 de diciembre de 2013 (modificado 2017) — estímulo de
 *     colegiaturas, independiente del Art. 151.
 *
 *   - Anexo 8 de la RMF 2026: tarifa anual de los artículos 97 y 152 LISR,
 *     publicada en el DOF el 28 de diciembre de 2025.
 * -----------------------------------------------------------------------------
 */

import type {
  ConceptoConFundamento,
  DevolucionFormData,
  DevolucionResultado,
  NivelEducativo,
} from './types'

export const UMA_DIARIA_2026 = 117.31
export const UMA_ANUAL_2026 = 42794.64

interface TramoTarifaAnual {
  limiteInferior: number
  limiteSuperior: number
  cuotaFija: number
  tasa: number
}

export const TARIFA_ANUAL_ISR_2026: TramoTarifaAnual[] = [
  { limiteInferior: 0.01, limiteSuperior: 10135.11, cuotaFija: 0, tasa: 0.0192 },
  { limiteInferior: 10135.12, limiteSuperior: 86022.11, cuotaFija: 194.59, tasa: 0.064 },
  { limiteInferior: 86022.12, limiteSuperior: 151176.19, cuotaFija: 5051.37, tasa: 0.1088 },
  { limiteInferior: 151176.2, limiteSuperior: 175735.66, cuotaFija: 12140.13, tasa: 0.16 },
  { limiteInferior: 175735.67, limiteSuperior: 210403.69, cuotaFija: 16069.64, tasa: 0.1792 },
  { limiteInferior: 210403.7, limiteSuperior: 424353.97, cuotaFija: 22282.14, tasa: 0.2136 },
  { limiteInferior: 424353.98, limiteSuperior: 668840.14, cuotaFija: 67981.92, tasa: 0.2352 },
  { limiteInferior: 668840.15, limiteSuperior: 1276925.98, cuotaFija: 125485.07, tasa: 0.3 },
  { limiteInferior: 1276925.99, limiteSuperior: 1702567.97, cuotaFija: 307910.81, tasa: 0.32 },
  { limiteInferior: 1702567.98, limiteSuperior: 5107703.92, cuotaFija: 444116.23, tasa: 0.34 },
  { limiteInferior: 5107703.93, limiteSuperior: Number.POSITIVE_INFINITY, cuotaFija: 1601862.46, tasa: 0.35 },
]

const TOPE_COLEGIATURAS: Record<NivelEducativo, number> = {
  preescolar: 14200,
  primaria: 12900,
  secundaria: 19900,
  profesional_tecnico: 17100,
  bachillerato: 24500,
}

const ETIQUETA_NIVEL: Record<NivelEducativo, string> = {
  preescolar: 'Preescolar',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  profesional_tecnico: 'Profesional técnico',
  bachillerato: 'Bachillerato',
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function montoSeguro(n: number): number {
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

export function calcularIsrAnual2026(baseGravable: number): number {
  const base = montoSeguro(baseGravable)
  if (base === 0) return 0
  const tramo = TARIFA_ANUAL_ISR_2026.find((fila) => base <= fila.limiteSuperior)
    ?? TARIFA_ANUAL_ISR_2026[TARIFA_ANUAL_ISR_2026.length - 1]
  return round2(tramo.cuotaFija + (base - tramo.limiteInferior) * tramo.tasa)
}

export function calcularDevolucionImpuestos(data: DevolucionFormData): DevolucionResultado {
  const ingresoAnual = montoSeguro(data.ingresoAnual)
  const ingresoAnterior = montoSeguro(data.ingresoAcumulableEjercicioAnterior)
  const isrRetenido = montoSeguro(data.isrRetenido)
  const gastosMedicos = montoSeguro(data.gastosMedicos)
  const interesesRealesHipotecarios = montoSeguro(data.interesesRealesHipotecarios)
  const donativos = montoSeguro(data.donativos)
  const donativosGobierno = montoSeguro(data.donativosGobierno)
  const aportacionesRetiroAfore = montoSeguro(data.aportacionesRetiroAfore)
  const conceptos: ConceptoConFundamento[] = []
  const notas: string[] = []

  // --- Tope global (Art. 151, último párrafo): aplica a gastos médicos e
  // intereses hipotecarios reales en esta versión. ---
  const topePor15 = round2(ingresoAnual * 0.15)
  const topePor5Uma = round2(5 * UMA_ANUAL_2026)
  const topeGlobalAplicable = Math.min(topePor15, topePor5Uma)
  const topeGlobalCriterio: '15%_ingreso' | '5_uma_anual' = topePor15 <= topePor5Uma ? '15%_ingreso' : '5_uma_anual'

  const sujetosATopeGlobal = round2(gastosMedicos + interesesRealesHipotecarios)
  const totalDeduccionesDentroDeTope = Math.min(sujetosATopeGlobal, topeGlobalAplicable)

  if (sujetosATopeGlobal > topeGlobalAplicable) {
    notas.push(
      `Tus gastos médicos e intereses hipotecarios reales suman ${sujetosATopeGlobal.toLocaleString('es-MX')}, ` +
        `por encima del tope global de ${topeGlobalAplicable.toLocaleString('es-MX')} (Art. 151 LISR, último párrafo). ` +
        'El excedente no es deducible en este ejercicio y no se acumula para el siguiente.',
    )
  }

  conceptos.push({
    etiqueta: 'Gastos médicos e intereses hipotecarios (dentro del tope global)',
    monto: totalDeduccionesDentroDeTope,
    formula: `Menor entre ${sujetosATopeGlobal.toLocaleString('es-MX')} capturado y el tope de ${topeGlobalAplicable.toLocaleString('es-MX')}`,
    fundamento: 'Art. 151, fracciones I y IV, y último párrafo, LISR. Tope: el menor entre 15% del ingreso anual o 5 UMA anuales.',
  })

  // --- Colegiaturas: tope propio por nivel, fuera del tope global. ---
  let totalColegiaturas = 0
  let totalColegiaturasTopeAplicado = 0
  for (const c of data.colegiaturas) {
    const montoColegiatura = montoSeguro(c.monto)
    totalColegiaturas += montoColegiatura
    const tope = TOPE_COLEGIATURAS[c.nivel]
    const aplicado = Math.min(montoColegiatura, tope)
    totalColegiaturasTopeAplicado += aplicado
    if (montoColegiatura > tope) {
      notas.push(
        `Colegiatura de ${ETIQUETA_NIVEL[c.nivel]}: capturaste ${montoColegiatura.toLocaleString('es-MX')}, ` +
          `pero el tope anual de este nivel es ${tope.toLocaleString('es-MX')}. El excedente no es deducible.`,
      )
    }
  }
  totalColegiaturasTopeAplicado = round2(totalColegiaturasTopeAplicado)
  if (totalColegiaturas > 0) {
    conceptos.push({
      etiqueta: 'Colegiaturas (con tope por nivel educativo)',
      monto: totalColegiaturasTopeAplicado,
      formula: 'Suma de colegiaturas, topada individualmente por nivel educativo',
      fundamento:
        'Decreto DOF 26/12/2013 (estímulo fiscal de colegiaturas, modificado 2017) — independiente del tope global del Art. 151. ' +
        'Cubre de preescolar a bachillerato; no incluye educación superior (licenciatura, posgrado).',
    })
  }

  // --- Donativos: tope 7% (4% si es a Federación/entidades/municipios). ---
  const topeDonativosGeneral = round2(ingresoAnterior * 0.07)
  const topeDonativosGobierno = round2(ingresoAnterior * 0.04)
  const donativosGobiernoAplicado = Math.min(donativosGobierno, topeDonativosGobierno)
  const donativosGeneralAplicado = Math.min(
    donativos,
    Math.max(0, topeDonativosGeneral - donativosGobiernoAplicado),
  )
  const donativosTopeAplicado = round2(donativosGobiernoAplicado + donativosGeneralAplicado)
  if (donativos + donativosGobierno > 0) {
    conceptos.push({
      etiqueta: 'Donativos (con tope 7%/4%)',
      monto: donativosTopeAplicado,
      formula: 'Donativos a Federación/entidades/municipios (tope 4%) + otros donativos autorizados (tope 7% conjunto)',
      fundamento: 'Art. 151, fracción III, LISR — independiente del tope global del Art. 151, último párrafo.',
    })
  }

  // --- Aportaciones voluntarias de retiro: límite propio (10% o 5 UMA). ---
  if (aportacionesRetiroAfore > 0) {
    const topeAportaciones = Math.min(round2(ingresoAnual * 0.1), topePor5Uma)
    const aportacionesAplicado = Math.min(aportacionesRetiroAfore, topeAportaciones)
    conceptos.push({
      etiqueta: 'Aportaciones voluntarias de retiro',
      monto: round2(aportacionesAplicado),
      formula: `Menor entre lo aportado y el 10% del ingreso anual o 5 UMA anuales (${topeAportaciones.toLocaleString('es-MX')})`,
      fundamento: 'Art. 151, fracción V, y último párrafo, LISR — límite propio, fuera del tope global.',
    })
  }

  if (data.tuvoMasDeUnPatron) {
    notas.push(
      'Tuviste más de un patrón en el ejercicio: debes sumar manualmente los ingresos y el ISR retenido de todas ' +
        'tus constancias antes de capturarlos aquí. Si la suma de tus ingresos por sueldos rebasa el monto que el ' +
        'último patrón consideró, es posible que tengas un cálculo distinto al de cada constancia individual.',
    )
  }

  const aportacionesRetiroAplicado = aportacionesRetiroAfore > 0
    ? Math.min(aportacionesRetiroAfore, Math.min(round2(ingresoAnual * 0.1), topePor5Uma))
    : 0

  const totalDeduccionesPersonales = round2(
    totalDeduccionesDentroDeTope + totalColegiaturasTopeAplicado + donativosTopeAplicado + aportacionesRetiroAplicado,
  )

  notas.push(
    'El saldo es una estimación informativa con la tarifa anual 2026 del Anexo 8 de la RMF. La declaración del SAT ' +
      'puede variar por subsidio al empleo, otros ingresos, pérdidas, estímulos, acreditamientos, datos precargados ' +
      'o deducciones que esta herramienta no captura.',
  )

  const baseGravableDespuesDeducciones = Math.max(0, round2(ingresoAnual - totalDeduccionesPersonales))
  const isrCausadoEstimado = calcularIsrAnual2026(baseGravableDespuesDeducciones)
  const saldoEstimado = round2(isrRetenido - isrCausadoEstimado)
  const tipoSaldo = saldoEstimado > 0 ? 'a_favor' : saldoEstimado < 0 ? 'a_cargo' : 'cero'

  return {
    topeGlobalAplicable,
    topeGlobalCriterio,
    totalDeduccionesDentroDeTope,
    totalColegiaturas: round2(totalColegiaturas),
    totalColegiaturasTopeAplicado,
    donativosTopeAplicado,
    totalDeduccionesPersonales,
    ingresoAnual,
    baseGravableDespuesDeducciones,
    isrRetenidoTotal: isrRetenido,
    isrCausadoEstimado,
    saldoEstimado,
    tipoSaldo,
    conceptos,
    notas,
  }
}
