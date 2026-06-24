/**
 * core/parseNomina.ts
 * -----------------------------------------------------------------------------
 * Parser puro del Complemento de Nómina 1.2 (Revisión E, vigente desde el
 * 1 de enero de 2026). Solo se invoca cuando detectTipo() devolvió
 * 'cfdi-nomina' Y converterConfig.nominaEnabled es true — esa decisión vive
 * en el componente orquestador, no aquí, para mantener este archivo puro.
 *
 * Nota de validación (Rev. E): toda percepción/deducción debe traer al menos
 * un importe gravado o exento. Si un nodo viene sin ninguno de los dos, NO
 * se marca como error de este parser — se reporta tal cual para que el
 * usuario lo revise, evitando falsos positivos contra una regla del SAT
 * que cambió recientemente.
 * -----------------------------------------------------------------------------
 */

import type {
  ComplementoNomina,
  DeduccionNomina,
  OtroPagoNomina,
  PercepcionNomina,
} from './types';

const NS_NOMINA = 'http://www.sat.gob.mx/nomina12';

const attr = (el: Element | null, name: string): string =>
  el?.getAttribute(name) ?? '';

function parsePercepciones(nominaNode: Element): PercepcionNomina[] {
  return Array.from(
    nominaNode.getElementsByTagNameNS(NS_NOMINA, 'Percepcion')
  ).map((p) => ({
    tipoPercepcion: attr(p, 'TipoPercepcion'),
    clave: attr(p, 'Clave'),
    concepto: attr(p, 'Concepto'),
    importeGravado: attr(p, 'ImporteGravado'),
    importeExento: attr(p, 'ImporteExento'),
  }));
}

function parseDeducciones(nominaNode: Element): DeduccionNomina[] {
  return Array.from(
    nominaNode.getElementsByTagNameNS(NS_NOMINA, 'Deduccion')
  ).map((d) => ({
    tipoDeduccion: attr(d, 'TipoDeduccion'),
    clave: attr(d, 'Clave'),
    concepto: attr(d, 'Concepto'),
    importe: attr(d, 'Importe'),
  }));
}

function parseOtrosPagos(nominaNode: Element): OtroPagoNomina[] {
  return Array.from(
    nominaNode.getElementsByTagNameNS(NS_NOMINA, 'OtroPago')
  ).map((o) => ({
    tipoOtroPago: attr(o, 'TipoOtroPago'),
    clave: attr(o, 'Clave'),
    concepto: attr(o, 'Concepto'),
    importe: attr(o, 'Importe'),
  }));
}

export function parseNomina(xmlDoc: Document): ComplementoNomina {
  const nominaNode = xmlDoc.getElementsByTagNameNS(NS_NOMINA, 'Nomina')[0];

  if (!nominaNode) {
    throw new Error('No se encontró el nodo nomina12:Nomina.');
  }

  const receptorNode = xmlDoc.getElementsByTagNameNS(NS_NOMINA, 'Receptor')[0] ?? null;
  const percepcionesNode = xmlDoc.getElementsByTagNameNS(NS_NOMINA, 'Percepciones')[0] ?? null;
  const deduccionesNode = xmlDoc.getElementsByTagNameNS(NS_NOMINA, 'Deducciones')[0] ?? null;
  const otrosPagosNode = xmlDoc.getElementsByTagNameNS(NS_NOMINA, 'OtrosPagos')[0] ?? null;

  return {
    tipoNomina: attr(nominaNode, 'TipoNomina'),
    fechaPago: attr(nominaNode, 'FechaPago'),
    fechaInicialPago: attr(nominaNode, 'FechaInicialPago'),
    fechaFinalPago: attr(nominaNode, 'FechaFinalPago'),
    numDiasPagados: attr(nominaNode, 'NumDiasPagados'),
    totalPercepciones: attr(percepcionesNode, 'TotalPercepciones') || undefined,
    totalDeducciones: attr(deduccionesNode, 'TotalDeducciones') || undefined,
    totalOtrosPagos: attr(otrosPagosNode, 'TotalOtrosPagos') || undefined,
    trabajadorCurp: attr(receptorNode, 'Curp') || undefined,
    trabajadorNumSeguridadSocial: attr(receptorNode, 'NumSeguridadSocial') || undefined,
    trabajadorRegimenFiscal: attr(receptorNode, 'TipoRegimen') || undefined,
    trabajadorPuesto: attr(receptorNode, 'Puesto') || undefined,
    percepciones: percepcionesNode ? parsePercepciones(percepcionesNode) : [],
    deducciones: deduccionesNode ? parseDeducciones(deduccionesNode) : [],
    otrosPagos: otrosPagosNode ? parseOtrosPagos(otrosPagosNode) : [],
  };
}
