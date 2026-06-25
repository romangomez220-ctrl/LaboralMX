/**
 * plataformasDigitales.ts
 * -----------------------------------------------------------------------------
 * FUENTES VERIFICADAS (ver RESUMEN-v5.0.md):
 *   - LISR Art. 113-A (texto vigente, sin reforma directa para 2026): fija
 *     2.1% (transporte/entrega), 4% (hospedaje), 1% (venta de bienes y
 *     prestación de servicios en general) como tasas de retención a
 *     personas físicas.
 *   - LISR Art. 113-B: retención de 20% cuando no se proporciona RFC.
 *   - LISR Art. 113-C, fracción VI (texto citado y verificado en esta
 *     investigación): retención del 2.5% sin deducción alguna a personas
 *     morales — NUEVO para 2026 —, 20% si no proporcionan RFC.
 *
 * TENSIÓN LEGAL DOCUMENTADA, NO RESUELTA POR ESTA HERRAMIENTA:
 * múltiples fuentes especializadas (posteriores a la entrada en vigor)
 * indican que la tasa para personas físicas en "venta de bienes y
 * prestación de servicios en general" subió de 1% a 2.5% para 2026 — pero
 * ese incremento se instrumentó vía la Ley de Ingresos de la Federación
 * 2026, no mediante una reforma directa al texto del Art. 113-A LISR. Al
 * menos una fuente especializada (IDC) señala esto como una "tensión
 * normativa" por modificar un elemento sustantivo del impuesto a través de
 * una ley de vigencia anual. Esta herramienta usa 2.5% como tasa por
 * defecto para personas físicas en esta categoría (es la cifra que reportan
 * con mayor consistencia las fuentes posteriores a enero de 2026), pero
 * señala esta tensión explícitamente y no la presenta como pacífica.
 *
 * NO CUBIERTO CON CERTEZA (documentado, no resuelto): el umbral y mecánica
 * exactos para que la retención se considere PAGO DEFINITIVO. El texto
 * verificado del Art. 113-B LISR describe un supuesto específico (ingresos
 * recibidos en parte directamente de usuarios, no solo vía plataforma, con
 * tope de $300,000 anuales) que es más estrecho que la regla general de
 * "pago definitivo si no superas $300,000" que repiten varias fuentes
 * secundarias. Esta herramienta presenta el umbral de $300,000 como
 * referencia, marcado explícitamente como pendiente de verificar contra el
 * texto exacto aplicable al caso del usuario.
 * -----------------------------------------------------------------------------
 */

import type { ConceptoConFundamento, PlataformasFormData, PlataformasResultado, TipoActividadPlataforma } from './types'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

const TASA_ISR_PF: Record<TipoActividadPlataforma, number> = {
  transporte_entrega: 0.021,
  hospedaje: 0.04,
  venta_servicios_general: 0.025, // Ver tensión legal documentada arriba.
}

const FUNDAMENTO_TASA_PF: Record<TipoActividadPlataforma, string> = {
  transporte_entrega: 'Art. 113-A, fracción I, LISR.',
  hospedaje: 'Art. 113-A, fracción II, LISR.',
  venta_servicios_general:
    'Art. 113-A, fracción III, LISR (texto vigente: 1%); tasa efectiva 2026 de 2.5% reportada por fuentes ' +
    'posteriores vía Ley de Ingresos de la Federación 2026 — ver tensión legal documentada en el código y en el resumen de entrega.',
}

const ETIQUETA_ACTIVIDAD: Record<TipoActividadPlataforma, string> = {
  transporte_entrega: 'Transporte terrestre de pasajeros y entrega de bienes',
  hospedaje: 'Hospedaje',
  venta_servicios_general: 'Venta de bienes y prestación de servicios en general',
}

const UMBRAL_PAGO_DEFINITIVO_REFERENCIA = 300000

export function calcularRetencionPlataformas(data: PlataformasFormData): PlataformasResultado {
  const notas: string[] = []
  const conceptos: ConceptoConFundamento[] = []

  let tasaIsr: number
  let fundamentoIsr: string
  let tasaIva: number
  let fundamentoIva: string

  if (data.tipoContribuyente === 'persona_moral') {
    if (data.tieneRfcRegistrado) {
      tasaIsr = 0.025
      fundamentoIsr = 'Art. 113-C, fracción VI, LISR — retención a personas morales, sin deducción alguna (nuevo para 2026).'
      tasaIva = 0.08
      fundamentoIva = 'Art. 18-J LIVA — retención a personas morales con RFC proporcionado.'
    } else {
      tasaIsr = 0.2
      fundamentoIsr = 'Art. 113-C, fracción VI, LISR — tasa agravada por no proporcionar RFC a la plataforma.'
      tasaIva = 0.16
      fundamentoIva = 'Art. 18-J LIVA — retención agravada del 100% del IVA por no proporcionar RFC.'
      notas.push(
        'No proporcionar tu RFC a la plataforma eleva la retención de ISR de 2.5% a 20%, y la de IVA de 8% a 16% ' +
          '(100% del IVA trasladado). Proporcionar tu RFC reduce significativamente la retención.',
      )
    }
    notas.push(
      'La inclusión de personas morales en este esquema de retención es nueva para 2026 — antes de 2026 las ' +
        'personas morales no estaban sujetas a retención automática por parte de las plataformas digitales.',
    )
  } else {
    if (data.tieneRfcRegistrado) {
      tasaIsr = TASA_ISR_PF[data.tipoActividad]
      fundamentoIsr = FUNDAMENTO_TASA_PF[data.tipoActividad]
      tasaIva = 0.08
      fundamentoIva = 'Retención de IVA equivalente al 50% del IVA trasladado (8% efectivo) — Art. 18-J LIVA y disposiciones relacionadas, cuando se proporciona RFC.'
    } else {
      tasaIsr = 0.2
      fundamentoIsr = 'Art. 113-B LISR — tasa agravada del 20% por no proporcionar RFC a la plataforma.'
      tasaIva = 0.16
      fundamentoIva = 'Retención del 100% del IVA trasladado cuando no se proporciona RFC.'
      notas.push(
        'No proporcionar tu RFC a la plataforma eleva la retención de ISR a 20% (en vez de la tasa de tu ' +
          `actividad: ${(TASA_ISR_PF[data.tipoActividad] * 100).toFixed(1)}%), y la de IVA a 16% (100% del IVA).`,
      )
    }
  }

  if (data.tipoActividad === 'venta_servicios_general' && data.tipoContribuyente === 'persona_fisica') {
    notas.push(
      'IMPORTANTE — tensión legal documentada: el texto vigente del Art. 113-A, fracción III, LISR señala una ' +
        'tasa de 1% para esta categoría. Esta herramienta usa 2.5%, la cifra que reportan de forma consistente las ' +
        'fuentes especializadas posteriores a enero de 2026, atribuida a la Ley de Ingresos de la Federación 2026. ' +
        'Al menos una fuente especializada señala esto como jurídicamente cuestionable, por modificar un elemento ' +
        'sustantivo del impuesto sin reformar directamente la LISR. Verifica el texto exacto de la LIF 2026 (DOF) ' +
        'antes de tratar esta tasa como definitiva — es el punto de mayor riesgo de toda esta herramienta.',
    )
  }

  const montoRetencionIsr = round2(data.ingresosBrutosMes * tasaIsr)
  const montoRetencionIva = round2(data.ingresosBrutosMes * tasaIva)
  const netoARecibir = round2(data.ingresosBrutosMes - montoRetencionIsr - montoRetencionIva)

  conceptos.push({
    etiqueta: `Retención de ISR (${ETIQUETA_ACTIVIDAD[data.tipoActividad]})`,
    monto: montoRetencionIsr,
    formula: `${(tasaIsr * 100).toFixed(2)}% × ingresos brutos del mes`,
    fundamento: fundamentoIsr,
  })
  conceptos.push({
    etiqueta: 'Retención de IVA',
    monto: montoRetencionIva,
    formula: `${(tasaIva * 100).toFixed(2)}% × ingresos brutos del mes`,
    fundamento: fundamentoIva,
  })

  const posibleConsiderarPagoDefinitivo =
    data.tipoContribuyente === 'persona_fisica' && data.ingresosAcumuladosAnio <= UMBRAL_PAGO_DEFINITIVO_REFERENCIA

  notas.push(
    `Umbral de referencia: $${UMBRAL_PAGO_DEFINITIVO_REFERENCIA.toLocaleString('es-MX')} anuales. El texto ` +
      'verificado del Art. 113-B LISR describe con precisión un supuesto específico (ingresos recibidos en parte ' +
      'directamente de los usuarios, no solo vía la plataforma) con este mismo tope. Si tu caso es distinto a ese ' +
      'supuesto exacto, no asumas que este umbral aplica igual — verifica con un fiscalista antes de decidir si ' +
      'la retención cubre tu obligación completa o si te falta presentar una declaración adicional.',
  )

  if (data.tipoContribuyente === 'persona_moral') {
    notas.push(
      'Para personas morales, esta retención NO es definitiva: es acreditable contra los pagos provisionales de ' +
        'ISR de la empresa y contra el ISR de la declaración anual del ejercicio (Art. 113-C LISR).',
    )
  }

  if (data.facturaAdicionalFueraDePlataforma) {
    notas.push(
      'Indicaste que también facturas fuera de la plataforma. Esos ingresos no están cubiertos por esta ' +
        'retención y deben declararse por la vía que corresponda a tu régimen — revisa si te conviene mantenerte ' +
        'en el supuesto de "ingresos mixtos" del Art. 113-B LISR o declarar por separado.',
    )
  }

  if (data.tipoContribuyente === 'persona_fisica') {
    notas.push(
      'No se retiene ISR ni IVA por plataformas cuando el pago proviene de otra persona física fuera del esquema ' +
        'de intermediación digital — esta herramienta asume que el ingreso capturado proviene efectivamente de la ' +
        'plataforma.',
    )
  }

  return {
    tasaIsrAplicada: tasaIsr,
    tasaIvaAplicada: tasaIva,
    montoRetencionIsr,
    montoRetencionIva,
    netoARecibir,
    posibleConsiderarPagoDefinitivo,
    conceptos,
    notas,
  }
}
