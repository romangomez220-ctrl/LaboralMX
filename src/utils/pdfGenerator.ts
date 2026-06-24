import jsPDF from 'jspdf'
import type { ResultadoCalculo } from '../types/labor'
import { formatCurrency } from './formatCurrency'

const AVISO_LEGAL =
  'Importante: Los resultados mostrados son estimaciones informativas calculadas con base en los datos proporcionados por el usuario y la legislacion laboral vigente aplicable. Los importes pueden variar dependiendo de impuestos, retenciones, cuotas de seguridad social, prestaciones contractuales, convenios, politicas internas de la empresa u otras circunstancias particulares del caso concreto. Esta herramienta no sustituye asesoria juridica profesional.'

const COLOR_NAVY: [number, number, number] = [15, 39, 68]
const COLOR_GOLD: [number, number, number] = [212, 175, 55]
const COLOR_STONE: [number, number, number] = [107, 114, 128]
const COLOR_TEXTO: [number, number, number] = [31, 41, 55]
const COLOR_TOTAL: [number, number, number] = [21, 128, 61]
const COLOR_NOTA: [number, number, number] = [146, 64, 14]

const MARGEN_IZQ = 16
const MARGEN_DER = 196
const MARGEN_INFERIOR = 270
const ANCHO_TEXTO = MARGEN_DER - MARGEN_IZQ

export interface DatoCapturado {
  etiqueta: string
  valor: string
}

/**
 * Verifica si queda espacio en la página actual; si no, agrega una
 * página nueva y reinicia "y" al margen superior. Evita que el desglose
 * o las notas se corten cuando hay muchos conceptos o notas largas.
 */
function asegurarEspacio(doc: jsPDF, y: number, espacioNecesario = 10): number {
  if (y + espacioNecesario > MARGEN_INFERIOR) {
    doc.addPage()
    return 20
  }
  return y
}

function dibujarPiePagina(doc: jsPDF): void {
  const totalPaginas = doc.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setDrawColor(...COLOR_GOLD)
    doc.setLineWidth(0.3)
    doc.line(MARGEN_IZQ, 285, MARGEN_DER, 285)
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_STONE)
    doc.text('ROMANUS — Laboral Suite', MARGEN_IZQ, 290)
    doc.text(`Página ${i} de ${totalPaginas}`, MARGEN_DER, 290, { align: 'right' })
  }
}

export function generarPDF(resultado: ResultadoCalculo, datosCapturados: DatoCapturado[] = []): void {
  const doc = new jsPDF()
  let y = 20

  // Encabezado institucional — solo texto "ROMANUS" (aún no hay logotipo
  // definitivo), con una línea dorada como acento de marca.
  doc.setFontSize(20)
  doc.setTextColor(...COLOR_NAVY)
  doc.text('ROMANUS', MARGEN_IZQ, y)
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_STONE)
  doc.text('Laboral Suite', MARGEN_DER, y, { align: 'right' })
  y += 3
  doc.setDrawColor(...COLOR_GOLD)
  doc.setLineWidth(0.6)
  doc.line(MARGEN_IZQ, y, MARGEN_DER, y)
  y += 10

  // Nombre de la calculadora + fecha y hora de generación.
  doc.setFontSize(14)
  doc.setTextColor(...COLOR_NAVY)
  doc.text(
    resultado.tipo === 'finiquito' ? 'Resultado estimado de Finiquito' : 'Resultado estimado de Liquidación',
    MARGEN_IZQ,
    y,
  )
  y += 6
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_STONE)
  const fechaGeneracion = new Date().toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
  doc.text(`Generado el ${fechaGeneracion}`, MARGEN_IZQ, y)
  y += 10

  // Datos capturados por el usuario.
  if (datosCapturados.length > 0) {
    doc.setFontSize(11)
    doc.setTextColor(...COLOR_NAVY)
    doc.text('Datos capturados', MARGEN_IZQ, y)
    y += 6
    doc.setFontSize(10)
    doc.setTextColor(...COLOR_TEXTO)
    datosCapturados.forEach((d) => {
      y = asegurarEspacio(doc, y)
      doc.text(`${d.etiqueta}: ${d.valor}`, MARGEN_IZQ, y)
      y += 5.5
    })
    y += 4
  }

  // Desglose de cálculo: cada concepto con su fórmula, sin agrupar ni
  // ocultar ninguno.
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_NAVY)
  y = asegurarEspacio(doc, y, 14)
  doc.text('Desglose de cálculo', MARGEN_IZQ, y)
  y += 6

  resultado.conceptos.forEach((c) => {
    y = asegurarEspacio(doc, y, 14)
    doc.setFontSize(10.5)
    doc.setTextColor(...COLOR_TEXTO)
    doc.text(c.etiqueta, MARGEN_IZQ, y)
    doc.text(formatCurrency(c.monto), MARGEN_DER, y, { align: 'right' })
    y += 5
    if (c.detalle) {
      doc.setFontSize(8.5)
      doc.setTextColor(...COLOR_STONE)
      doc.text(c.detalle, MARGEN_IZQ + 2, y)
      y += 4.5
    }
    if (c.formula) {
      doc.setFontSize(8.5)
      doc.setTextColor(...COLOR_STONE)
      doc.text(`Fórmula: ${c.formula}`, MARGEN_IZQ + 2, y)
      y += 4.5
    }
    y += 2
  })

  y = asegurarEspacio(doc, y, 16)
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.line(MARGEN_IZQ, y, MARGEN_DER, y)
  y += 4

  // Resultado final destacado.
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(...COLOR_TOTAL)
  doc.roundedRect(MARGEN_IZQ, y, ANCHO_TEXTO, 12, 2, 2, 'FD')
  doc.setFontSize(13)
  doc.setTextColor(...COLOR_TOTAL)
  doc.text('Total estimado', MARGEN_IZQ + 4, y + 8)
  doc.text(formatCurrency(resultado.totalEstimado), MARGEN_DER - 4, y + 8, { align: 'right' })
  y += 18

  if (resultado.veinteDiasInformativo) {
    y = asegurarEspacio(doc, y, 14)
    doc.setFontSize(10.5)
    doc.setTextColor(...COLOR_NOTA)
    doc.text(
      `${resultado.veinteDiasInformativo.etiqueta}: ${formatCurrency(resultado.veinteDiasInformativo.monto)}`,
      MARGEN_IZQ,
      y,
    )
    y += 6
    if (resultado.totalConEscenarioInformativo !== undefined) {
      doc.text(
        `Total con escenario informativo: ${formatCurrency(resultado.totalConEscenarioInformativo)}`,
        MARGEN_IZQ,
        y,
      )
      y += 8
    }
  }

  // Antigüedad, como referencia del cálculo.
  y = asegurarEspacio(doc, y, 10)
  doc.setFontSize(9.5)
  doc.setTextColor(...COLOR_STONE)
  doc.text(
    `Salario capturado: ${formatCurrency(resultado.salarioBase)} (${resultado.tipoSalario === 'diario' ? 'diario' : 'mensual'}) · Salario diario usado: ${formatCurrency(resultado.salarioDiario)} · Antigüedad: ${resultado.antiguedadTexto}`,
    MARGEN_IZQ,
    y,
  )
  y += 8

  if (resultado.notas.length > 0) {
    y = asegurarEspacio(doc, y, 14)
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_NOTA)
    resultado.notas.forEach((nota) => {
      const lineas = doc.splitTextToSize(`• ${nota}`, ANCHO_TEXTO)
      y = asegurarEspacio(doc, y, lineas.length * 5 + 2)
      doc.text(lineas, MARGEN_IZQ, y)
      y += lineas.length * 5 + 2
    })
    y += 4
  }

  // Leyenda legal obligatoria.
  y = asegurarEspacio(doc, y, 20)
  doc.setFontSize(8)
  doc.setTextColor(...COLOR_STONE)
  const lineasAviso = doc.splitTextToSize(AVISO_LEGAL, ANCHO_TEXTO)
  doc.text(lineasAviso, MARGEN_IZQ, y)

  dibujarPiePagina(doc)

  doc.save(`romanus-laboral-suite-${resultado.tipo}-${Date.now()}.pdf`)
}
