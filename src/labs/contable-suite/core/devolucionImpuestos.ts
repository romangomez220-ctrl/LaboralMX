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
 * SIMPLIFICACIÓN DOCUMENTADA (ver notas): el tope de donativos (7%/4%) debería
 * calcularse sobre los ingresos acumulables del EJERCICIO ANTERIOR, no del
 * ejercicio actual. Esta primera versión usa el ingreso del ejercicio actual
 * como aproximación, por no contar todavía con el dato del ejercicio previo
 * en el flujo de captura. Documentado explícitamente como pendiente de ajuste.
 *
 * PUNTO DISPUTADO EN LAS FUENTES (no resuelto unilateralmente, ver notas):
 * si las aportaciones voluntarias de retiro cuentan dentro o fuera del tope
 * global del Art. 151. Esta versión las trata con un límite propio,
 * independiente, pero señala la discrepancia para revisión profesional.
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

export function calcularDevolucionImpuestos(data: DevolucionFormData): DevolucionResultado {
  const conceptos: ConceptoConFundamento[] = []
  const notas: string[] = []

  // --- Tope global (Art. 151, último párrafo): aplica a gastos médicos e
  // intereses hipotecarios reales en esta versión. ---
  const topePor15 = round2(data.ingresoAnual * 0.15)
  const topePor5Uma = round2(5 * UMA_ANUAL_2026)
  const topeGlobalAplicable = Math.min(topePor15, topePor5Uma)
  const topeGlobalCriterio: '15%_ingreso' | '5_uma_anual' = topePor15 <= topePor5Uma ? '15%_ingreso' : '5_uma_anual'

  const sujetosATopeGlobal = round2(data.gastosMedicos + data.interesesRealesHipotecarios)
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
    totalColegiaturas += c.monto
    const tope = TOPE_COLEGIATURAS[c.nivel]
    const aplicado = Math.min(c.monto, tope)
    totalColegiaturasTopeAplicado += aplicado
    if (c.monto > tope) {
      notas.push(
        `Colegiatura de ${ETIQUETA_NIVEL[c.nivel]}: capturaste ${c.monto.toLocaleString('es-MX')}, ` +
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
  const topeDonativosGeneral = round2(data.ingresoAnual * 0.07)
  const topeDonativosGobierno = round2(data.ingresoAnual * 0.04)
  const donativosGobiernoAplicado = Math.min(data.donativosGobierno, topeDonativosGobierno)
  const donativosGeneralAplicado = Math.min(
    data.donativos,
    Math.max(0, topeDonativosGeneral - donativosGobiernoAplicado),
  )
  const donativosTopeAplicado = round2(donativosGobiernoAplicado + donativosGeneralAplicado)
  if (data.donativos + data.donativosGobierno > 0) {
    notas.push(
      'El tope de donativos (7%, o 4% adicional para donativos a la Federación/entidades/municipios) debe calcularse ' +
        'sobre los ingresos acumulables del EJERCICIO ANTERIOR, conforme al Art. 151, fracción III, LISR. Esta ' +
        'herramienta usa el ingreso del ejercicio actual como aproximación; verifica con el ingreso real del año ' +
        'anterior antes de presentar tu declaración.',
    )
    conceptos.push({
      etiqueta: 'Donativos (con tope 7%/4%, aproximado)',
      monto: donativosTopeAplicado,
      formula: 'Donativos a Federación/entidades/municipios (tope 4%) + otros donativos autorizados (tope 7% conjunto)',
      fundamento: 'Art. 151, fracción III, LISR — independiente del tope global del Art. 151, último párrafo.',
    })
  }

  // --- Aportaciones voluntarias de retiro: límite propio (10% o 5 UMA), criterio disputado. ---
  if (data.aportacionesRetiroAfore > 0) {
    const topeAportaciones = Math.min(round2(data.ingresoAnual * 0.1), topePor5Uma)
    const aportacionesAplicado = Math.min(data.aportacionesRetiroAfore, topeAportaciones)
    notas.push(
      'Las fuentes consultadas no son unánimes sobre si las aportaciones voluntarias de retiro cuentan dentro o ' +
        'fuera del tope global del Art. 151 (distinto del Plan Personal de Retiro del Art. 185, que sí tiene un ' +
        'límite independiente confirmado). Esta herramienta las trata con límite propio, sin consumir el tope ' +
        'global — verificar con un fiscalista antes de asumir este tratamiento como definitivo.',
    )
    conceptos.push({
      etiqueta: 'Aportaciones voluntarias de retiro (criterio a confirmar)',
      monto: round2(aportacionesAplicado),
      formula: `Menor entre lo aportado y el 10% del ingreso anual o 5 UMA anuales (${topeAportaciones.toLocaleString('es-MX')})`,
      fundamento: 'Art. 151, fracción V, LISR — tratamiento de tope exacto disputado entre fuentes consultadas, ver nota.',
    })
  }

  if (data.tuvoMasDeUnPatron) {
    notas.push(
      'Tuviste más de un patrón en el ejercicio: debes sumar manualmente los ingresos y el ISR retenido de todas ' +
        'tus constancias antes de capturarlos aquí. Si la suma de tus ingresos por sueldos rebasa el monto que el ' +
        'último patrón consideró, es posible que tengas un cálculo distinto al de cada constancia individual.',
    )
  }

  const aportacionesRetiroAplicado = data.aportacionesRetiroAfore > 0
    ? Math.min(data.aportacionesRetiroAfore, Math.min(round2(data.ingresoAnual * 0.1), topePor5Uma))
    : 0

  const totalDeduccionesPersonales = round2(
    totalDeduccionesDentroDeTope + totalColegiaturasTopeAplicado + donativosTopeAplicado + aportacionesRetiroAplicado,
  )

  // ISR causado real (tarifa progresiva, Art. 152 LISR): NO se calcula en esta
  // versión. Las fuentes consultadas no son unánimes sobre si la tarifa anual
  // 2026 se actualizó por inflación (algunas fuentes citan un factor de
  // actualización de 1.13213 con una tabla de 11 tramos; al menos una fuente
  // sostiene que la tarifa sigue igual que 2024 porque la inflación acumulada
  // no alcanzó el 10% que exige la ley). Ante esta contradicción no resuelta,
  // esta herramienta deja el cálculo de ISR final fuera de su alcance: calcula
  // con rigor la base gravable después de deducciones, y deja la aplicación
  // de la tarifa vigente (Art. 152 LISR, Anexo 8 RMF 2026) para una versión
  // posterior, una vez confirmada la tabla completa contra el DOF, o para que
  // el usuario/contador la aplique directamente sobre esta base.
  notas.push(
    'Esta herramienta calcula tus deducciones personales y tu base gravable después de aplicarlas, con fundamento ' +
      'verificado. NO calcula todavía el ISR final ni el saldo a favor/a cargo: las fuentes consultadas se ' +
      'contradicen sobre si la tarifa anual (Art. 152 LISR) se actualizó por inflación para 2026, y no fue posible ' +
      'confirmar la tabla completa de los 11 tramos contra una fuente primaria en esta ronda. Aplica la tarifa ' +
      'vigente del Art. 152 LISR (Anexo 8 RMF 2026) sobre la base gravable mostrada abajo para obtener tu ISR ' +
      'causado real, o confírmalo con un contador.',
  )

  const baseGravableDespuesDeducciones = Math.max(0, round2(data.ingresoAnual - totalDeduccionesPersonales))

  return {
    topeGlobalAplicable,
    topeGlobalCriterio,
    totalDeduccionesDentroDeTope,
    totalColegiaturas: round2(totalColegiaturas),
    totalColegiaturasTopeAplicado,
    donativosTopeAplicado,
    totalDeduccionesPersonales,
    ingresoAnual: data.ingresoAnual,
    baseGravableDespuesDeducciones,
    isrRetenidoTotal: data.isrRetenido,
    conceptos,
    notas,
  }
}
