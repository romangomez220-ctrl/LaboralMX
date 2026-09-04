import jsPDF from 'jspdf'
import type { ResultadoCalculo } from '../types/labor'
import type { ReportModel } from '../reports/types'
import { LABOR_REPORT_DISCLAIMER, LABOR_REPORT_METHOD_REFERENCES } from '../reports/legalContent'
import { formatCurrency } from './formatCurrency'

const NAVY: [number, number, number] = [15, 39, 68]
const GOLD: [number, number, number] = [212, 175, 55]
const STONE: [number, number, number] = [107, 114, 128]
const TEXT: [number, number, number] = [31, 41, 55]
const GREEN: [number, number, number] = [21, 128, 61]
const IVORY: [number, number, number] = [248, 248, 246]
const LEFT = 16
const RIGHT = 194
const WIDTH = RIGHT - LEFT
const BOTTOM = 272

export interface DatoCapturado { etiqueta: string; valor: string }

function header(doc: jsPDF, section?: string): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...NAVY)
  doc.text('ROMANUS', LEFT + 3, 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...STONE)
  doc.text(section ?? 'LaboralMX', RIGHT, 15, { align: 'right' })
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.45)
  doc.line(LEFT, 19, RIGHT, 19)
  return 29
}

function addPage(doc: jsPDF, section: string): number {
  doc.addPage()
  return header(doc, section)
}

function ensure(doc: jsPDF, y: number, needed: number, section: string): number {
  return y + needed > BOTTOM ? addPage(doc, section) : y
}

function title(doc: jsPDF, text: string, y: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(...NAVY)
  doc.text(text, LEFT, y)
  return y + 10
}

function paragraph(doc: jsPDF, text: string, y: number, width = WIDTH, size = 9.5): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(size)
  doc.setTextColor(...TEXT)
  const lines = doc.splitTextToSize(text, width)
  doc.text(lines, LEFT, y)
  return y + lines.length * (size * 0.48) + 3
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12.5)
  doc.setTextColor(...NAVY)
  doc.text(text, LEFT, y)
  return y + 7
}

function bulletList(doc: jsPDF, items: readonly string[], y: number, size = 8, width = WIDTH - 9): number {
  items.forEach((item) => {
    const lines = doc.splitTextToSize(item, width)
    doc.setFillColor(...GOLD)
    doc.circle(LEFT + 2, y - 1, 0.75, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...TEXT)
    doc.text(lines, LEFT + 6, y)
    y += lines.length * (size * 0.43) + 2.2
  })
  return y
}

function checkboxList(doc: jsPDF, items: readonly string[], y: number): number {
  items.forEach((item) => {
    const lines = doc.splitTextToSize(item, WIDTH - 10)
    doc.setDrawColor(...STONE)
    doc.setLineWidth(0.3)
    doc.rect(LEFT + 1, y - 2.5, 3, 3)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.8)
    doc.setTextColor(...TEXT)
    doc.text(lines, LEFT + 7, y)
    y += lines.length * 3.5 + 2
  })
  return y
}

export function formatSnapshotDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value
}

function footers(doc: jsPDF, folio?: string): void {
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.25)
    doc.line(LEFT, 284, RIGHT, 284)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...STONE)
    doc.text(folio ? `ROMANUS · ${folio}` : 'ROMANUS · LaboralMX', LEFT + 3, 290)
    doc.text(`Página ${page} de ${pages}`, RIGHT - 3, 290, { align: 'right' })
  }
}

function capturedRows(model: ReportModel): Array<[string, string]> {
  const s = model.snapshot
  const exitLabels: Record<string, string> = {
    despido_injustificado: 'Despido injustificado', despido_justificado: 'Despido justificado',
    renuncia: 'Renuncia', mutuo_acuerdo: 'Mutuo acuerdo', fallecimiento: 'Fallecimiento',
    incapacidad_no_profesional: 'Incapacidad no profesional',
  }
  return [
    ['Fecha de ingreso', formatSnapshotDate(s.fechaIngreso)],
    ['Fecha de terminación', formatSnapshotDate(s.fechaSalida)],
    ['Salario capturado', `${formatCurrency(s.salarioBase)} (${s.tipoSalario === 'diario' ? 'diario' : 'mensual'})`],
    ['Salario diario utilizado', formatCurrency(model.resultado.salarioDiario)],
    ['Salario diario integrado', formatCurrency(model.resultado.salarioDiarioIntegrado ?? 0)],
    ['Antigüedad calculada', model.resultado.antiguedadTexto],
    ['Días pendientes de pago', String(s.diasPendientes)],
    ['Vacaciones disfrutadas o pagadas', String(s.vacacionesDisfrutadas)],
    ['Tipo de terminación', exitLabels[s.tipoSalida] ?? s.tipoSalida],
  ]
}

export function buildPremiumReportPdf(model: ReportModel): jsPDF {
  // Keep content streams uncompressed: some PDF renderers can otherwise omit
  // isolated text operators on graphics-heavy pages.
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: false })

  // Portada
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, 210, 297, 'F')
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(1)
  doc.line(18, 32, 80, 32)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.text('ROMANUS', 18, 55)
  doc.setFontSize(10)
  doc.setTextColor(...GOLD)
  doc.text('LABORALMX', 18, 65)
  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  const coverTitle = doc.splitTextToSize(model.title, 150)
  doc.text(coverTitle, 18, 112)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(220, 225, 231)
  doc.text('Reporte personalizado generado a partir de tu estimación en ROMANUS LaboralMX.', 18, 149)
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(18, 190, 174, 48, 3, 3, 'F')
  doc.setFontSize(9)
  doc.setTextColor(...STONE)
  doc.text('FOLIO', 25, 203)
  doc.text('GENERADO', 25, 219)
  doc.text('VERSIÓN', 110, 219)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...NAVY)
  doc.text(model.folio, 25, 211)
  doc.setFontSize(9)
  doc.text(new Date(model.generatedAt).toLocaleString('es-MX'), 25, 227)
  doc.text(model.reportVersion, 110, 227)

  // Resumen y datos
  let y = addPage(doc, 'Resumen ejecutivo')
  y = title(doc, 'Resumen ejecutivo', y)
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(...GREEN)
  doc.roundedRect(LEFT, y, WIDTH, 35, 3, 3, 'FD')
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...STONE)
  doc.text('ESTIMACIÓN TOTAL', LEFT + 7, y + 10)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(25); doc.setTextColor(...GREEN)
  doc.text(formatCurrency(model.resultado.totalEstimado), LEFT + 7, y + 26)
  y += 44
  y = paragraph(doc, 'Esta cifra es una estimación construida con los datos proporcionados y los conceptos producidos por el motor vigente de ROMANUS. No representa una cantidad definitiva ni sustituye una revisión individual.', y)
  y += 3
  y = title(doc, 'Datos utilizados', y)
  capturedRows(model).forEach(([label, value], index) => {
    y = ensure(doc, y, 9, 'Datos utilizados')
    if (index % 2 === 0) { doc.setFillColor(...IVORY); doc.rect(LEFT, y - 5, WIDTH, 8, 'F') }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...NAVY)
    doc.text(label, LEFT + 3, y)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...TEXT)
    doc.text(value, RIGHT - 3, y, { align: 'right' })
    y += 8
  })

  // Desglose
  y = addPage(doc, 'Desglose de la estimación')
  y = title(doc, 'Desglose completo', y)
  const col = { concept: LEFT + 2, criterion: 78, amount: RIGHT - 2 }
  doc.setFillColor(...NAVY); doc.rect(LEFT, y - 5, WIDTH, 10, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255)
  doc.text('CONCEPTO', col.concept, y + 1); doc.text('CRITERIO / OPERACIÓN', col.criterion, y + 1)
  doc.text('IMPORTE', col.amount, y + 1, { align: 'right' }); y += 12
  model.resultado.conceptos.forEach((item, index) => {
    const formulaLines = doc.splitTextToSize(item.formula ?? 'Concepto calculado por el motor ROMANUS', 80)
    const rowHeight = Math.max(13, formulaLines.length * 4 + 7)
    y = ensure(doc, y, rowHeight, 'Desglose de la estimación')
    if (index % 2 === 0) { doc.setFillColor(...IVORY); doc.rect(LEFT, y - 5, WIDTH, rowHeight, 'F') }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...TEXT)
    doc.text(doc.splitTextToSize(item.etiqueta, 56), col.concept, y)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.8); doc.setTextColor(...STONE)
    doc.text(formulaLines, col.criterion, y)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...TEXT)
    doc.text(formatCurrency(item.monto), col.amount, y, { align: 'right' })
    y += rowHeight
  })
  y = ensure(doc, y, 18, 'Desglose de la estimación')
  doc.setFillColor(236, 253, 245); doc.roundedRect(LEFT, y, WIDTH, 14, 2, 2, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...GREEN)
  doc.text('ESTIMACIÓN TOTAL', LEFT + 4, y + 9)
  doc.text(formatCurrency(model.resultado.totalEstimado), RIGHT - 4, y + 9, { align: 'right' })

  // Insights y composición
  y = addPage(doc, 'Lectura del resultado')
  y = title(doc, 'Puntos importantes de tu cálculo', y)
  model.insights.forEach((insight) => {
    const lines = doc.splitTextToSize(insight.text, WIDTH - 14)
    const h = lines.length * 4.5 + 8
    y = ensure(doc, y, h, 'Lectura del resultado')
    doc.setFillColor(...IVORY); doc.roundedRect(LEFT, y - 5, WIDTH, h, 2, 2, 'F')
    doc.setFillColor(...GOLD); doc.circle(LEFT + 5, y, 1.3, 'F')
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...TEXT)
    doc.text(lines, LEFT + 10, y + 1)
    y += h + 3
  })
  y += 3
  y = title(doc, 'Composición del resultado', y)
  model.resultado.conceptos.filter((c) => c.monto > 0).forEach((item) => {
    const ratio = model.resultado.totalEstimado > 0 ? item.monto / model.resultado.totalEstimado : 0
    y = ensure(doc, y, 14, 'Composición del resultado')
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...TEXT)
    doc.text(doc.splitTextToSize(item.etiqueta, 100)[0], LEFT, y)
    doc.text(`${Math.round(ratio * 100)}%`, RIGHT, y, { align: 'right' })
    doc.setFillColor(229, 231, 235); doc.rect(LEFT, y + 3, WIDTH, 4, 'F')
    doc.setFillColor(...NAVY); doc.rect(LEFT, y + 3, Math.max(1, WIDTH * ratio), 4, 'F')
    y += 13
  })

  // Significado, guía práctica, metodología y avisos
  y = addPage(doc, 'Guía práctica y metodología')
  y = title(doc, 'Qué significa y qué puedes hacer ahora', y)
  doc.setFillColor(...IVORY)
  const contextLines = doc.splitTextToSize(model.practicalGuide.context, WIDTH - 10)
  const contextHeight = contextLines.length * 4 + 9
  doc.roundedRect(LEFT, y - 5, WIDTH, contextHeight, 2, 2, 'F')
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...TEXT)
  doc.text(contextLines, LEFT + 5, y + 1)
  y += contextHeight + 3
  y = sectionTitle(doc, model.practicalGuide.heading, y)
  y = bulletList(doc, model.practicalGuide.items, y, 7.7)

  y += 1
  y = sectionTitle(doc, 'Checklist de verificación', y)
  y = checkboxList(doc, model.checklist, y)

  y += 1
  y = sectionTitle(doc, 'Metodología y fundamentos', y)
  y = paragraph(doc, 'El reporte presenta los mismos importes del resultado de ROMANUS y no ejecuta un segundo cálculo laboral.', y, WIDTH, 7.5)
  const referenciasAplicables = LABOR_REPORT_METHOD_REFERENCES.filter((reference) => {
    if (reference.startsWith('Indemnización')) return model.resultado.conceptos.some((c) => c.etiqueta.startsWith('Indemnización'))
    if (reference.startsWith('Prima de antigüedad')) return model.resultado.conceptos.some((c) => c.etiqueta === 'Prima de antigüedad') || Boolean(model.resultado.primaAntiguedadInformativa)
    if (reference.startsWith('El escenario')) return Boolean(model.resultado.veinteDiasInformativo)
    return true
  })
  y = bulletList(doc, referenciasAplicables, y, 7.1)

  y += 1
  doc.setFillColor(240, 244, 248)
  doc.setDrawColor(...GOLD)
  doc.roundedRect(LEFT, y - 4, WIDTH, 21, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...NAVY)
  doc.text('¿Necesitas revisar tu situación?', LEFT + 5, y + 2)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...TEXT)
  const nextLines = doc.splitTextToSize('Los hechos y documentos pueden modificar un análisis jurídico. ROMANUS permite solicitar una revisión con un abogado laboral participante, sin garantizar aceptación, disponibilidad ni resultado.', WIDTH - 48)
  doc.text(nextLines, LEFT + 5, y + 7)
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...NAVY)
  doc.text('romanus.mx', RIGHT - 5, y + 9, { align: 'right' })
  y += 23

  y = sectionTitle(doc, 'Avisos y limitaciones', y)
  paragraph(doc, LABOR_REPORT_DISCLAIMER, y, WIDTH, 7.1)

  footers(doc, model.folio)
  return doc
}

export function premiumReportBlob(model: ReportModel): Blob {
  return buildPremiumReportPdf(model).output('blob')
}

export function descargarReportePremium(model: ReportModel): void {
  buildPremiumReportPdf(model).save(`reporte-romanus-${model.folio}.pdf`)
}

// Compatibilidad temporal mientras paidReportsEnabled permanece apagado.
// No se usa como autorización ni como renderer premium.
export function generarPDF(resultado: ResultadoCalculo, datosCapturados: DatoCapturado[] = []): void {
  const doc = new jsPDF()
  let y = header(doc, 'Resultado gratuito temporal')
  y = title(doc, resultado.tipo === 'finiquito' ? 'Resultado estimado de finiquito' : 'Resultado estimado de liquidación', y)
  datosCapturados.forEach((dato) => { y = paragraph(doc, `${dato.etiqueta}: ${dato.valor}`, y) })
  resultado.conceptos.forEach((item) => { y = paragraph(doc, `${item.etiqueta}: ${formatCurrency(item.monto)}`, y) })
  doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN); doc.setFontSize(14)
  doc.text(`Total estimado: ${formatCurrency(resultado.totalEstimado)}`, LEFT, y + 5)
  footers(doc)
  doc.save(`romanus-laboral-suite-${resultado.tipo}-${Date.now()}.pdf`)
}
