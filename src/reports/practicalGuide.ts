import type { TipoSalidaLiquidacion } from '../types/labor'

export interface PracticalGuide {
  heading: string
  context: string
  items: string[]
}

const GUIDES: Record<TipoSalidaLiquidacion, PracticalGuide> = {
  despido_injustificado: {
    heading: 'Guía práctica según tu situación',
    context: 'Seleccionaste despido injustificado. Usa el reporte como referencia para ordenar y contrastar la información disponible.',
    items: [
      'Conserva recibos de nómina, contrato, mensajes, correos y comunicaciones sobre la terminación.',
      'Guarda evidencia de cualquier cantidad o documento que te haya presentado el empleador.',
      'Compara salario, antigüedad, fechas y conceptos con la información que conservas.',
      'Antes de firmar documentos relacionados con la terminación, procura comprender su contenido y alcance.',
      'Si existe controversia sobre hechos, documentos o cantidades, considera orientación profesional oportunamente; en materia laboral existen plazos relevantes.',
    ],
  },
  despido_justificado: {
    heading: 'Guía práctica según tu situación',
    context: 'Seleccionaste despido justificado. El motivo y los documentos de la terminación pueden ser relevantes para una revisión individual.',
    items: [
      'Conserva el aviso, comunicaciones y documentos que expliquen el motivo de la terminación.',
      'Verifica salario, antigüedad, fechas y prestaciones pendientes reflejadas en el reporte.',
      'Conserva copia de cualquier documento entregado o firmado.',
      'Si no coincides con los hechos o documentos, considera orientación profesional oportunamente; pueden existir plazos legales relevantes.',
    ],
  },
  renuncia: {
    heading: 'Guía práctica según tu situación',
    context: 'Seleccionaste renuncia. Una renuncia y un despido tienen consecuencias distintas, por lo que conviene verificar que el supuesto describa lo ocurrido.',
    items: [
      'Conserva comprobantes de salario, antigüedad y prestaciones.',
      'Revisa qué conceptos pendientes aparecen en la estimación.',
      'Guarda copia de documentos entregados o firmados al terminar la relación.',
      'Si existe controversia sobre la forma de terminación, considera orientación profesional oportunamente.',
    ],
  },
  mutuo_acuerdo: {
    heading: 'Guía práctica según tu situación',
    context: 'Seleccionaste mutuo acuerdo. El contenido del convenio y las circunstancias documentadas determinan qué conviene revisar.',
    items: [
      'Conserva la propuesta, convenio, recibos y comunicaciones relacionadas.',
      'Compara los datos y conceptos del reporte con el documento propuesto.',
      'Antes de firmar, procura comprender el alcance de las cantidades y manifestaciones incluidas.',
      'Considera orientación profesional si hay diferencias o cláusulas que no resulten claras.',
    ],
  },
  fallecimiento: {
    heading: 'Guía práctica según tu situación',
    context: 'Seleccionaste fallecimiento del trabajador. El reporte es una referencia económica y no determina quién puede realizar trámites o recibir cantidades.',
    items: [
      'Conserva recibos, contrato y documentos relacionados con la relación laboral.',
      'Verifica salario, antigüedad, fechas y prestaciones reflejadas en la estimación.',
      'Solicita información sobre los documentos y trámites que correspondan ante las instituciones competentes.',
      'Considera orientación profesional para revisar las circunstancias y documentación aplicables.',
    ],
  },
  incapacidad_no_profesional: {
    heading: 'Guía práctica según tu situación',
    context: 'Seleccionaste incapacidad no profesional. Este supuesto depende de circunstancias médicas y laborales que la calculadora no puede verificar.',
    items: [
      'Conserva certificados, comunicaciones laborales, recibos y documentos relacionados.',
      'Verifica salario, antigüedad, fechas y conceptos mostrados en el reporte.',
      'Distingue este supuesto de un riesgo de trabajo, que sigue reglas diferentes.',
      'Considera orientación profesional para revisar la documentación y el supuesto aplicable.',
    ],
  },
}

export function buildPracticalGuide(tipoSalida: TipoSalidaLiquidacion): PracticalGuide {
  return GUIDES[tipoSalida]
}
