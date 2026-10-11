import { buildLiquidacionChecklist, buildLiquidacionInsights } from './insights'
import type {
  LiquidacionReportModel,
  LiquidacionSnapshot,
  PaidReportSnapshot,
  ReportMetadata,
  ReportModel,
} from './types'
import { buildPracticalGuide } from './practicalGuide'

export function buildLiquidacionReportModel(
  snapshot: LiquidacionSnapshot,
  metadata: ReportMetadata,
): LiquidacionReportModel {
  if (snapshot.resultado.tipo !== 'liquidacion') {
    throw new Error('El snapshot no contiene un resultado de liquidación.')
  }
  return {
    calculatorType: 'liquidacion',
    title: 'Reporte de estimación de liquidación',
    ...metadata,
    snapshot,
    resultado: snapshot.resultado,
    insights: buildLiquidacionInsights(snapshot),
    checklist: buildLiquidacionChecklist(snapshot),
    practicalGuide: buildPracticalGuide(snapshot.tipoSalida),
  }
}

export function buildPaidReportModel(
  snapshot: PaidReportSnapshot,
  metadata: ReportMetadata,
): ReportModel {
  if (snapshot.calculatorType === 'liquidacion') {
    return buildLiquidacionReportModel(snapshot, metadata)
  }
  return { ...snapshot, ...metadata }
}
