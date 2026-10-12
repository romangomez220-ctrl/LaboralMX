/**
 * Genera un libro .xlsx exclusivamente a partir de datos ya normalizados.
 * Nunca abre ni interpreta libros aportados por el usuario. El paquete de
 * escritura se carga solo al solicitar la descarga para mantener liviana la
 * ruta de auditoría y reducir la superficie expuesta a documentos externos.
 */

import type { ArchivoConError, CfdiParseado, IncidenciaCfdi } from './types'

type CellValue = string | number
type TableRow = CellValue[]

const HEADER_STYLE = {
  fontWeight: 'bold' as const,
  backgroundColor: '#172B4D',
  color: '#FFFFFF',
}

function sheetData(headers: string[], rows: TableRow[]) {
  return [
    headers.map((value) => ({ value, ...HEADER_STYLE })),
    ...(rows.length > 0 ? rows : [headers.map(() => '')]),
  ]
}

function resumenRows(resultados: CfdiParseado[]): TableRow[] {
  return resultados.map((r) => [
    r.archivo,
    r.comprobante.uuid ?? '',
    r.comprobante.tipoDeComprobante,
    r.comprobante.fecha,
    r.comprobante.emisorRfc,
    r.comprobante.emisorNombre ?? '',
    r.comprobante.receptorRfc,
    r.comprobante.receptorNombre ?? '',
    Number(r.comprobante.subTotal) || 0,
    Number(r.comprobante.descuento) || 0,
    Number(r.comprobante.total) || 0,
    r.comprobante.moneda,
    r.comprobante.formaPago ?? '',
    r.comprobante.metodoPago ?? '',
  ])
}

function conceptosRows(resultados: CfdiParseado[]): TableRow[] {
  return resultados.flatMap((r) => r.comprobante.conceptos.map((c) => [
    r.archivo,
    r.comprobante.uuid ?? '',
    c.claveProdServ,
    c.descripcion,
    Number(c.cantidad) || 0,
    c.unidad ?? '',
    Number(c.valorUnitario) || 0,
    Number(c.importe) || 0,
    Number(c.descuento) || 0,
  ]))
}

function nominaRows(resultados: CfdiParseado[]): TableRow[] {
  return resultados.flatMap((r) => {
    if (!r.nomina) return []
    const base: TableRow = [
      r.archivo,
      r.comprobante.uuid ?? '',
      r.comprobante.receptorRfc,
      r.nomina.trabajadorCurp ?? '',
      r.nomina.trabajadorNumSeguridadSocial ?? '',
      r.nomina.tipoNomina,
      r.nomina.fechaPago,
    ]
    return [
      ...r.nomina.percepciones.map((p): TableRow => [
        ...base,
        `Percepción: ${p.concepto}`,
        p.clave,
        Number(p.importeGravado) || 0,
        Number(p.importeExento) || 0,
        0,
      ]),
      ...r.nomina.deducciones.map((d): TableRow => [
        ...base,
        `Deducción: ${d.concepto}`,
        d.clave,
        0,
        0,
        Number(d.importe) || 0,
      ]),
      ...r.nomina.otrosPagos.map((o): TableRow => [
        ...base,
        `Otro pago: ${o.concepto}`,
        o.clave,
        0,
        0,
        Number(o.importe) || 0,
      ]),
    ]
  })
}

export async function buildWorkbook(
  exitosos: CfdiParseado[],
  errores: ArchivoConError[],
  incidencias: IncidenciaCfdi[],
  incluirNomina: boolean,
): Promise<Blob> {
  const { default: writeXlsxFile } = await import('write-excel-file/browser')
  const sheets = [
    {
      sheet: 'Resumen',
      data: sheetData(
        ['Archivo', 'UUID', 'Tipo', 'Fecha', 'RFC Emisor', 'Nombre Emisor', 'RFC Receptor', 'Nombre Receptor', 'SubTotal', 'Descuento', 'Total', 'Moneda', 'Forma de Pago', 'Método de Pago'],
        resumenRows(exitosos),
      ),
      stickyRowsCount: 1,
    },
    {
      sheet: 'Conceptos',
      data: sheetData(
        ['Archivo', 'UUID', 'ClaveProdServ', 'Descripción', 'Cantidad', 'Unidad', 'ValorUnitario', 'Importe', 'Descuento'],
        conceptosRows(exitosos),
      ),
      stickyRowsCount: 1,
    },
    {
      sheet: 'Incidencias',
      data: sheetData(
        ['Severidad', 'Código', 'Archivo', 'Incidencia', 'Detalle', 'Campo'],
        incidencias.map((item) => [item.severidad, item.codigo, item.archivo, item.titulo, item.detalle, item.campo ?? '']),
      ),
      stickyRowsCount: 1,
    },
    {
      sheet: 'Errores',
      data: sheetData(
        ['Archivo', 'Motivo'],
        errores.map((item) => [item.archivo, item.motivo]),
      ),
      stickyRowsCount: 1,
    },
  ]

  if (incluirNomina && exitosos.some((item) => item.nomina)) {
    sheets.splice(2, 0, {
      sheet: 'Nómina',
      data: sheetData(
        ['Archivo', 'UUID', 'RFC Trabajador', 'CURP', 'NSS', 'Tipo Nómina', 'Fecha Pago', 'Concepto', 'Clave', 'Importe Gravado', 'Importe Exento', 'Importe'],
        nominaRows(exitosos),
      ),
      stickyRowsCount: 1,
    })
  }

  return writeXlsxFile(sheets, { fontFamily: 'Arial', fontSize: 10 }).toBlob()
}
