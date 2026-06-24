/**
 * core/buildWorkbook.ts
 * -----------------------------------------------------------------------------
 * Arma el libro de Excel en memoria a partir de los resultados ya parseados.
 * No descarga el archivo — solo regresa el Blob. El componente que llama a
 * esta función decide cómo dispararlo (URL.createObjectURL + revoke inmediato).
 *
 * Requiere: `xlsx` instalado como dependencia de npm del proyecto
 *   npm install xlsx
 * No se carga desde CDN — evita exponer metadata de la sesión a un tercero
 * y evita una dependencia de red para una herramienta que debe funcionar
 * 100% local.
 * -----------------------------------------------------------------------------
 */

import * as XLSX from 'xlsx';
import type { ArchivoConError, CfdiParseado } from './types';

function hojaResumen(resultados: CfdiParseado[]) {
  const filas = resultados.map((r) => ({
    Archivo: r.archivo,
    UUID: r.comprobante.uuid ?? '',
    Tipo: r.comprobante.tipoDeComprobante,
    Fecha: r.comprobante.fecha,
    'RFC Emisor': r.comprobante.emisorRfc,
    'Nombre Emisor': r.comprobante.emisorNombre ?? '',
    'RFC Receptor': r.comprobante.receptorRfc,
    'Nombre Receptor': r.comprobante.receptorNombre ?? '',
    SubTotal: Number(r.comprobante.subTotal) || 0,
    Descuento: Number(r.comprobante.descuento) || 0,
    Total: Number(r.comprobante.total) || 0,
    Moneda: r.comprobante.moneda,
    'Forma de Pago': r.comprobante.formaPago ?? '',
    'Método de Pago': r.comprobante.metodoPago ?? '',
  }));
  return XLSX.utils.json_to_sheet(filas);
}

function hojaConceptos(resultados: CfdiParseado[]) {
  const filas: Record<string, string | number>[] = [];
  resultados.forEach((r) => {
    r.comprobante.conceptos.forEach((c) => {
      filas.push({
        Archivo: r.archivo,
        UUID: r.comprobante.uuid ?? '',
        ClaveProdServ: c.claveProdServ,
        Descripcion: c.descripcion,
        Cantidad: Number(c.cantidad) || 0,
        Unidad: c.unidad ?? '',
        ValorUnitario: Number(c.valorUnitario) || 0,
        Importe: Number(c.importe) || 0,
        Descuento: Number(c.descuento) || 0,
      });
    });
  });
  return XLSX.utils.json_to_sheet(filas);
}

function hojaNomina(resultados: CfdiParseado[]) {
  const filas: Record<string, string | number>[] = [];
  resultados.forEach((r) => {
    if (!r.nomina) return;
    const base = {
      Archivo: r.archivo,
      UUID: r.comprobante.uuid ?? '',
      'RFC Trabajador': r.comprobante.receptorRfc,
      CURP: r.nomina.trabajadorCurp ?? '',
      NSS: r.nomina.trabajadorNumSeguridadSocial ?? '',
      'Tipo Nómina': r.nomina.tipoNomina,
      'Fecha Pago': r.nomina.fechaPago,
    };

    r.nomina.percepciones.forEach((p) => {
      filas.push({
        ...base,
        Concepto: `Percepción: ${p.concepto}`,
        Clave: p.clave,
        'Importe Gravado': Number(p.importeGravado) || 0,
        'Importe Exento': Number(p.importeExento) || 0,
      });
    });

    r.nomina.deducciones.forEach((d) => {
      filas.push({
        ...base,
        Concepto: `Deducción: ${d.concepto}`,
        Clave: d.clave,
        Importe: Number(d.importe) || 0,
      });
    });
  });
  return XLSX.utils.json_to_sheet(filas);
}

function hojaErrores(errores: ArchivoConError[]) {
  const filas = errores.map((e) => ({ Archivo: e.archivo, Motivo: e.motivo }));
  return XLSX.utils.json_to_sheet(filas.length ? filas : [{ Archivo: '', Motivo: '' }]);
}

/**
 * @param incluirNomina  Debe venir de converterConfig.nominaEnabled, decidido
 *                       por el componente orquestador — esta función no lo
 *                       infiere por sí misma para no duplicar la fuente de verdad.
 */
export function buildWorkbook(
  exitosos: CfdiParseado[],
  errores: ArchivoConError[],
  incluirNomina: boolean
): Blob {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, hojaResumen(exitosos), 'Resumen');
  XLSX.utils.book_append_sheet(wb, hojaConceptos(exitosos), 'Conceptos');

  if (incluirNomina) {
    const conNomina = exitosos.filter((r) => r.nomina);
    if (conNomina.length > 0) {
      XLSX.utils.book_append_sheet(wb, hojaNomina(conNomina), 'Nómina');
    }
  }

  XLSX.utils.book_append_sheet(wb, hojaErrores(errores), 'Errores');

  const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
