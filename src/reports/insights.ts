import type { LiquidacionSnapshot, ReportInsight } from './types'

function porcentaje(monto: number, total: number): number {
  return total > 0 ? Math.round((monto / total) * 100) : 0
}

export function buildLiquidacionInsights(snapshot: LiquidacionSnapshot): ReportInsight[] {
  const { resultado } = snapshot
  const insights: ReportInsight[] = [
    {
      id: 'antiguedad',
      text: `Para esta estimación se utilizó una antigüedad de ${resultado.antiguedadTexto}.`,
    },
    {
      id: 'conceptos',
      text: `La estimación principal está compuesta por ${resultado.conceptos.length} conceptos.`,
    },
  ]

  const mayor = [...resultado.conceptos].sort((a, b) => b.monto - a.monto)[0]
  if (mayor && resultado.totalEstimado > 0) {
    insights.push({
      id: 'concepto-principal',
      text: `${mayor.etiqueta} representa aproximadamente ${porcentaje(mayor.monto, resultado.totalEstimado)}% del total estimado y es el componente con mayor peso.`,
    })
  }

  if (snapshot.tipoSalario === 'mensual') {
    insights.push({
      id: 'salario-mensual',
      text: 'El salario mensual capturado se convirtió a salario diario dividiéndolo entre 30.',
    })
  }

  if (snapshot.tipoSalida === 'despido_injustificado') {
    insights.push({
      id: snapshot.salarioDiarioIntegradoCapturado ? 'sdi-capturado' : 'sdi-estimado',
      text: snapshot.salarioDiarioIntegradoCapturado
        ? 'La indemnización se calculó con el salario diario integrado capturado.'
        : 'El salario diario integrado se estimó con prestaciones mínimas de ley; conviene verificar prestaciones habituales adicionales.',
    })
  }

  if (resultado.primaAntiguedadInformativa) {
    insights.push({
      id: 'prima-informativa',
      text: 'La prima de antigüedad se presenta como concepto informativo y no forma parte del total principal.',
    })
  }

  if (resultado.veinteDiasInformativo) {
    insights.push({
      id: 'veinte-dias',
      text: 'El escenario de 20 días por año se muestra por separado y no se considera un derecho automático dentro del total principal.',
    })
  }

  return insights
}

export function buildLiquidacionChecklist(snapshot: LiquidacionSnapshot): string[] {
  const items = [
    'Salario y periodicidad verificados.',
    'Fechas de ingreso y terminación comprobadas.',
    'Supuesto de terminación confirmado.',
    'Conceptos e importes comparados con tus documentos.',
  ]
  if (!snapshot.salarioDiarioIntegradoCapturado && snapshot.tipoSalida === 'despido_injustificado') {
    items.push('Salario diario integrado revisado si existían prestaciones adicionales.')
  }
  if (snapshot.resultado.veinteDiasInformativo) {
    items.push('Escenario informativo de 20 días separado del total principal.')
  }
  return items
}
