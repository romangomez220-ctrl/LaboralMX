/**
 * arrendamiento.ts
 * -----------------------------------------------------------------------------
 * FUENTES VERIFICADAS (ver RESUMEN-v5.0.md):
 *   - LISR Art. 115, segundo párrafo: deducción ciega del 35% + predial.
 *   - Reglamento LISR Art. 196: la elección se hace en el primer pago
 *     provisional del año, aplica a TODOS los inmuebles incluyendo los de
 *     copropiedad, y no puede variarse en los pagos provisionales del año —
 *     pero SÍ puede cambiarse al presentar la declaración anual.
 *   - LISR Arts. 31 y 149: deducción anual de inversiones; 5% para
 *     construcciones (no aplica al valor del terreno).
 *
 * NO CUBIERTO EN ESTA VERSIÓN (documentado explícitamente, no simulado):
 *   - Comparación contra RESICO como tercera opción (el arrendador puede
 *     optar por RESICO con tasas 1%-2.5%, pero entonces no puede usar NI la
 *     deducción ciega NI gastos reales — es un régimen distinto, no una
 *     deducción). Esta herramienta solo compara ciega vs. real DENTRO del
 *     régimen de arrendamiento tradicional.
 *   - El Art. 116 conserva una referencia nominal a salarios mínimos para
 *     pagos trimestrales. El Decreto de desindexación de 2016 ordena entender
 *     en UMA las referencias usadas como unidad de cuenta ajena al salario.
 * -----------------------------------------------------------------------------
 */

import type { ArrendamientoFormData, ArrendamientoResultado, ConceptoConFundamento, GastosRealesArrendamiento } from './types'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function montoNoNegativo(n: number): number {
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

function sumarGastosReales(g: GastosRealesArrendamiento): number {
  return round2(
    montoNoNegativo(g.predial) +
      montoNoNegativo(g.mantenimiento) +
      montoNoNegativo(g.primasSeguros) +
      montoNoNegativo(g.interesesRealesHipotecarios) +
      montoNoNegativo(g.salariosComisionesHonorarios) +
      montoNoNegativo(g.contribucionesSobreSalarios) +
      montoNoNegativo(g.deduccionInversionesConstruccion),
  )
}

export function compararArrendamiento(data: ArrendamientoFormData): ArrendamientoResultado {
  const notas: string[] = []
  const conceptos: ConceptoConFundamento[] = []

  const ingresoAnual = montoNoNegativo(data.ingresoAnual)
  const predialPagado = montoNoNegativo(data.predialPagado)
  const deduccionCiega = round2(ingresoAnual * 0.35)
  const baseGravableCiega = round2(ingresoAnual - deduccionCiega - predialPagado)

  conceptos.push({
    etiqueta: 'Opción A — Deducción ciega (35% + predial)',
    monto: round2(deduccionCiega + predialPagado),
    formula: '35% del ingreso anual + predial efectivamente pagado',
    fundamento: 'Art. 115, segundo párrafo, LISR.',
  })

  const totalGastosReales = sumarGastosReales(data.gastosReales)
  const baseGravableReal = round2(ingresoAnual - totalGastosReales)

  conceptos.push({
    etiqueta: 'Opción B — Gastos reales',
    monto: totalGastosReales,
    formula: 'Predial + mantenimiento/agua + intereses reales + salarios/comisiones/honorarios + contribuciones sobre salarios + primas de seguros + deducción de inversiones en construcción',
    fundamento: 'Art. 115, fracciones I a VI, LISR; Arts. 31 y 149 LISR para la deducción de inversiones; y Arts. 196-197 del Reglamento de la LISR.',
  })

  if (data.esCopropiedad) {
    notas.push(
      `Indicaste copropiedad (tu parte: ${Math.min(100, Math.max(0, data.porcentajeCopropiedad))}%). El comparador ` +
        'supone que capturaste únicamente los ingresos y gastos que corresponden a tu proporción. La elección entre deducción ciega y ' +
        'gastos reales debe aplicarse de forma consistente a TODOS los inmuebles que arriendas, incluso los de ' +
        'copropiedad (Art. 196 del Reglamento de la LISR) — no puedes elegir ciega para un inmueble y real para ' +
        'otro en el mismo ejercicio. Cada copropietario declara su proporción correspondiente.',
    )
  }

  if (data.gastosReales.deduccionInversionesConstruccion === 0) {
    notas.push(
      'No capturaste deducción de inversiones en construcción. La LISR permite una deducción anual de hasta 5% ' +
        'sobre el monto fiscal de la construcción, sin incluir el terreno (Arts. 31 y 149 LISR). Confirma el monto ' +
        'original de la inversión y su actualización antes de utilizar esta deducción.',
    )
  }

  const diferencia = round2(baseGravableReal - baseGravableCiega)
  let recomendacion: 'ciega' | 'real' | 'equivalente'
  if (Math.abs(diferencia) < 1) {
    recomendacion = 'equivalente'
  } else if (diferencia > 0) {
    // Base gravable real es MAYOR que la de ciega → ciega conviene más (menor base = menos impuesto).
    recomendacion = 'ciega'
  } else {
    recomendacion = 'real'
  }

  notas.push(
    'La opción elegida se fija en tu primer pago provisional del ejercicio y no puede cambiarse en los pagos ' +
      'provisionales posteriores del mismo año — pero sí puedes cambiarla al presentar tu declaración anual ' +
      '(Art. 196 del Reglamento de la LISR).',
  )
  notas.push(
    'Esta comparación es solo entre deducción ciega y gastos reales, dentro del régimen de arrendamiento ' +
      'tradicional. No incluye RESICO como tercera opción: en RESICO el arrendador paga una tasa fija de 1% a ' +
      '2.5% sobre el ingreso bruto, pero pierde tanto la deducción ciega como los gastos reales (incluida la ' +
      'deducción de inversiones e intereses hipotecarios) — es una comparación distinta que esta herramienta no resuelve.',
  )
  notas.push(
    'El Art. 116 LISR conserva una referencia nominal a salarios mínimos para la opción de pagos trimestrales. ' +
      'Por el Decreto de desindexación publicado el 27 de enero de 2016, las referencias usadas como unidad de ' +
      'cuenta ajena al salario se entienden referidas a UMA. Confirma además los requisitos y facilidades de la ' +
      'RMF vigente antes de elegir periodicidad.',
  )
  notas.push(
    'Este comparador analiza únicamente la base para ISR. El IVA se determina por separado: el arrendamiento de ' +
      'casa habitación sin muebles generalmente está exento, mientras que otros usos pueden estar gravados. La ' +
      'deducción elegida para ISR no sustituye la revisión de requisitos para acreditamiento de IVA.',
  )

  return {
    baseGravableCiega,
    baseGravableReal,
    totalGastosReales,
    diferencia: Math.abs(diferencia),
    recomendacion,
    conceptos,
    notas,
  }
}
