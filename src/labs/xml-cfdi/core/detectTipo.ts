/**
 * core/detectTipo.ts
 * -----------------------------------------------------------------------------
 * Decide qué parser aplicar a un XML ya parseado por DOMParser.
 * No depende de converterConfig: SIEMPRE detecta correctamente el tipo real
 * del archivo. Es config.ts (consumido por la UI) el que decide si el tipo
 * "cfdi-nomina" se procesa o se manda a errores como "no soportado en esta
 * versión". Separar detección de habilitación evita que un bug de detección
 * se disfrace de "feature apagada".
 * -----------------------------------------------------------------------------
 */

import type { TipoCfdi } from './types';

export function detectTipo(xmlDoc: Document): TipoCfdi {
  const comprobante = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0];

  if (!comprobante) {
    return 'no-cfdi';
  }

  const tieneNomina = xmlDoc.getElementsByTagNameNS(
    'http://www.sat.gob.mx/nomina12',
    'Nomina'
  ).length > 0;

  if (tieneNomina) {
    return 'cfdi-nomina';
  }

  return 'cfdi-estandar';
}

/**
 * Intenta parsear el texto crudo del archivo como XML. Si no es XML válido,
 * regresa null en vez de lanzar — el llamador decide cómo reportar el error.
 */
export function tryParseXml(rawText: string): Document | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawText, 'application/xml');
    const parserError = doc.getElementsByTagName('parsererror')[0];
    if (parserError) {
      return null;
    }
    return doc;
  } catch {
    return null;
  }
}
