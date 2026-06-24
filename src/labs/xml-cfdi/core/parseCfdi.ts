/**
 * core/parseCfdi.ts
 * -----------------------------------------------------------------------------
 * Parser puro: recibe un Document XML ya parseado + nombre de archivo,
 * regresa un objeto tipado. No toca el DOM de la página, no hace red,
 * no escribe en ningún storage. Esto es lo que se puede mover a un
 * Web Worker sin cambiar una línea cuando llegue la fase Pro.
 * -----------------------------------------------------------------------------
 */

import type { Concepto, ComprobanteBase, ImpuestoConcepto } from './types';

const attr = (el: Element | null, name: string): string =>
  el?.getAttribute(name) ?? '';

function parseConceptos(comprobante: Element): Concepto[] {
  const conceptosNodes = Array.from(
    comprobante.getElementsByTagName('cfdi:Concepto')
  );

  return conceptosNodes.map((c) => {
    const impuestos: ImpuestoConcepto[] = [];

    Array.from(c.getElementsByTagName('cfdi:Traslado')).forEach((t) => {
      impuestos.push({
        tipo: 'traslado',
        impuesto: attr(t, 'Impuesto'),
        tasaOCuota: attr(t, 'TasaOCuota'),
        importe: attr(t, 'Importe'),
      });
    });

    Array.from(c.getElementsByTagName('cfdi:Retencion')).forEach((r) => {
      impuestos.push({
        tipo: 'retencion',
        impuesto: attr(r, 'Impuesto'),
        tasaOCuota: attr(r, 'TasaOCuota'),
        importe: attr(r, 'Importe'),
      });
    });

    return {
      claveProdServ: attr(c, 'ClaveProdServ'),
      noIdentificacion: attr(c, 'NoIdentificacion') || undefined,
      cantidad: attr(c, 'Cantidad'),
      claveUnidad: attr(c, 'ClaveUnidad'),
      unidad: attr(c, 'Unidad') || undefined,
      descripcion: attr(c, 'Descripcion'),
      valorUnitario: attr(c, 'ValorUnitario'),
      importe: attr(c, 'Importe'),
      descuento: attr(c, 'Descuento') || undefined,
      impuestos,
    };
  });
}

function parseUuid(xmlDoc: Document): string | undefined {
  const tfd = xmlDoc.getElementsByTagNameNS(
    'http://www.sat.gob.mx/TimbreFiscalDigital',
    'TimbreFiscalDigital'
  )[0];
  return tfd ? attr(tfd, 'UUID') || undefined : undefined;
}

export function parseCfdi(xmlDoc: Document, archivo: string): ComprobanteBase & { archivo: string } {
  const comprobante = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0];
  const emisor = xmlDoc.getElementsByTagName('cfdi:Emisor')[0] ?? null;
  const receptor = xmlDoc.getElementsByTagName('cfdi:Receptor')[0] ?? null;

  if (!comprobante) {
    throw new Error('No se encontró el nodo cfdi:Comprobante.');
  }

  return {
    archivo,
    uuid: parseUuid(xmlDoc),
    version: attr(comprobante, 'Version'),
    serie: attr(comprobante, 'Serie') || undefined,
    folio: attr(comprobante, 'Folio') || undefined,
    fecha: attr(comprobante, 'Fecha'),
    tipoDeComprobante: attr(comprobante, 'TipoDeComprobante'),
    subTotal: attr(comprobante, 'SubTotal'),
    descuento: attr(comprobante, 'Descuento') || undefined,
    total: attr(comprobante, 'Total'),
    moneda: attr(comprobante, 'Moneda'),
    formaPago: attr(comprobante, 'FormaPago') || undefined,
    metodoPago: attr(comprobante, 'MetodoPago') || undefined,
    lugarExpedicion: attr(comprobante, 'LugarExpedicion'),
    emisorRfc: attr(emisor, 'Rfc'),
    emisorNombre: attr(emisor, 'Nombre') || undefined,
    emisorRegimenFiscal: attr(emisor, 'RegimenFiscal') || undefined,
    receptorRfc: attr(receptor, 'Rfc'),
    receptorNombre: attr(receptor, 'Nombre') || undefined,
    receptorUsoCfdi: attr(receptor, 'UsoCFDI') || undefined,
    receptorDomicilioFiscal: attr(receptor, 'DomicilioFiscalReceptor') || undefined,
    conceptos: parseConceptos(comprobante),
  };
}
