/**
 * arrendamiento.ts
 * -----------------------------------------------------------------------------
 * FUENTES VERIFICADAS (ver RESUMEN-v5.0.md):
 *   - LISR Art. 115, segundo párrafo: deducción ciega del 35% + predial.
 *   - Reglamento LISR Art. 196: la elección se hace en el primer pago
 *     provisional del año, aplica a TODOS los inmuebles incluyendo los de
 *     copropiedad, y no puede variarse en los pagos provisionales del año —
 *     pero SÍ puede cambiarse al presentar la declaración anual.
 *   - Reglamento LISR Art. 197: depreciación de inversiones al 5% anual
 *     sobre el valor de construcción (no aplica a terreno).
 *
 * NO CUBIERTO EN ESTA VERSIÓN (documentado explícitamente, no simulado):
 *   - Comparación contra RESICO como tercera opción (el arrendador puede
 *     optar por RESICO con tasas 1%-2.5%, pero entonces no puede usar NI la
 *     deducción ciega NI gastos reales — es un régimen distinto, no una
 *     deducción). Esta herramienta solo compara ciega vs. real DENTRO del
 *     régimen de arrendamiento tradicional.
 *   - El umbral exacto para pagos provisionales trimestrales (en vez de
 *     mensuales) está fijado en la ley en "salarios mínimos", no en UMA —
 *     una particularidad real del Art. 116 LISR que no se actualizó en la
 *     desindexación de 2016. No se fija aquí un monto exacto sin verificar
 *     el salario mínimo vigente del ejercicio.
 * -----------------------------------------------------------------------------
 */

import type { ArrendamientoFormData, ArrendamientoResultado, ConceptoConFundamento, GastosRealesArrendamiento } from './types'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function sumarGastosReales(g: GastosRealesArrendamiento): number {
  return round2(
    g.predial + g.mantenimiento + g.segurosYComisiones + g.interesesRealesHipotecarios + g.depreciacionConstruccion,
  )
}

export function compararArrendamiento(data: ArrendamientoFormData): ArrendamientoResultado {
  const notas: string[] = []
  const conceptos: ConceptoConFundamento[] = []

  const deduccionCiega = round2(data.ingresoAnual * 0.35)
  const baseGravableCiega = round2(data.ingresoAnual - deduccionCiega - data.predialPagado)

  conceptos.push({
    etiqueta: 'Opción A — Deducción ciega (35% + predial)',
    monto: round2(deduccionCiega + data.predialPagado),
    formula: '35% del ingreso anual + predial efectivamente pagado',
    fundamento: 'Art. 115, segundo párrafo, LISR.',
  })

  const totalGastosReales = sumarGastosReales(data.gastosReales)
  const baseGravableReal = round2(data.ingresoAnual - totalGastosReales)

  conceptos.push({
    etiqueta: 'Opción B — Gastos reales',
    monto: totalGastosReales,
    formula: 'Predial + mantenimiento + seguros/comisiones + intereses reales hipotecarios + depreciación (5% anual sobre construcción)',
    fundamento: 'Art. 115, primer párrafo, LISR, y Arts. 196-197 del Reglamento de la LISR.',
  })

  if (data.esCopropiedad) {
    notas.push(
      `Indicaste copropiedad (tu parte: ${data.porcentajeCopropiedad}%). La elección entre deducción ciega y ` +
        'gastos reales debe aplicarse de forma consistente a TODOS los inmuebles que arriendas, incluso los de ' +
        'copropiedad (Art. 196 del Reglamento de la LISR) — no puedes elegir ciega para un inmueble y real para ' +
        'otro en el mismo ejercicio. Cada copropietario declara su proporción correspondiente.',
    )
  }

  if (data.gastosReales.depreciacionConstruccion === 0) {
    notas.push(
      'No capturaste depreciación. Si elegiste o estás considerando gastos reales, la depreciación del 5% anual ' +
        'sobre el valor de construcción (Art. 197 del Reglamento de la LISR) suele ser la deducción más grande y ' +
        'no requiere desembolso — muchos arrendadores la omiten por desconocimiento.',
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
      'depreciación e intereses hipotecarios) — es una comparación distinta que esta herramienta no resuelve.',
  )
  notas.push(
    'El umbral para decidir entre pagos provisionales mensuales o trimestrales (Art. 116 LISR) sigue fijado por ' +
      'ley en salarios mínimos, no en UMA — una particularidad que no se actualizó en la reforma de 2016. Esta ' +
      'herramienta no fija ese umbral en pesos para evitar un error por el valor del salario mínimo vigente; ' +
      'verifica el salario mínimo general del ejercicio antes de decidir la periodicidad.',
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
