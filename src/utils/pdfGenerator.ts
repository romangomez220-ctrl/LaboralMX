import jsPDF from 'jspdf'
import type { ResultadoCalculo } from '../types/labor'
import { formatCurrency } from './formatCurrency'

const AVISO_LEGAL =
  'Esta herramienta ofrece una estimacion informativa basada en prestaciones minimas de la Ley Federal del Trabajo. No sustituye asesoria legal profesional. El resultado puede variar por contrato, prestaciones superiores, salario integrado, comisiones, bonos, sindicatos, convenio, juicio laboral o circunstancias especificas del caso.'

export function generarPDF(resultado: ResultadoCalculo): void {
  const doc = new jsPDF()
  const margenIzq = 14
  let y = 18

  doc.setFontSize(18)
  doc.setTextColor(11, 37, 69)
  doc.text('Laboral Suite', margenIzq, y)
  y += 8

  doc.setFontSize(12)
  doc.setTextColor(60, 60, 60)
  doc.text(
    resultado.tipo === 'finiquito' ? 'Resultado estimado de Finiquito' : 'Resultado estimado de Liquidación',
    margenIzq,
    y,
  )
  y += 10

  doc.setFontSize(11)
  doc.setTextColor(20, 20, 20)
  doc.text(`Salario diario: ${formatCurrency(resultado.salarioDiario)}`, margenIzq, y)
  y += 6
  doc.text(`Antigüedad: ${resultado.antiguedadTexto}`, margenIzq, y)
  y += 10

  resultado.conceptos.forEach((c) => {
    doc.text(`${c.etiqueta}: ${formatCurrency(c.monto)}`, margenIzq, y)
    y += 7
    if (c.detalle) {
      doc.setFontSize(9)
      doc.setTextColor(120, 120, 120)
      doc.text(c.detalle, margenIzq + 2, y)
      doc.setFontSize(11)
      doc.setTextColor(20, 20, 20)
      y += 6
    }
  })

  y += 4
  doc.setDrawColor(200, 200, 200)
  doc.line(margenIzq, y, 196, y)
  y += 8

  doc.setFontSize(13)
  doc.setTextColor(21, 128, 61)
  doc.text(`Total estimado: ${formatCurrency(resultado.totalEstimado)}`, margenIzq, y)
  y += 10

  if (resultado.veinteDiasInformativo) {
    doc.setFontSize(11)
    doc.setTextColor(146, 64, 14)
    doc.text(
      `${resultado.veinteDiasInformativo.etiqueta}: ${formatCurrency(resultado.veinteDiasInformativo.monto)}`,
      margenIzq,
      y,
    )
    y += 7
    if (resultado.totalConEscenarioInformativo !== undefined) {
      doc.text(
        `Total con escenario informativo: ${formatCurrency(resultado.totalConEscenarioInformativo)}`,
        margenIzq,
        y,
      )
      y += 10
    }
  }

  if (resultado.notas.length > 0) {
    doc.setFontSize(9)
    doc.setTextColor(146, 64, 14)
    resultado.notas.forEach((nota) => {
      const lineas = doc.splitTextToSize(`• ${nota}`, 180)
      doc.text(lineas, margenIzq, y)
      y += lineas.length * 5 + 2
    })
    y += 4
  }

  doc.setFontSize(8)
  doc.setTextColor(110, 110, 110)
  const lineasAviso = doc.splitTextToSize(AVISO_LEGAL, 180)
  doc.text(lineasAviso, margenIzq, y)

  doc.save(`laboral-suite-${resultado.tipo}-${Date.now()}.pdf`)
}
