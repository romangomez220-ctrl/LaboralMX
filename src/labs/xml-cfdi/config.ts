/**
 * config.ts
 * -----------------------------------------------------------------------------
 * Configuración central del módulo "Conversor XML CFDI → Excel".
 *
 * REGLAS NO NEGOCIABLES DE ESTE MÓDULO (ver ARQUITECTURA-CONVERSOR-XML-CFDI.md):
 *   1. Cero red: ningún archivo de este módulo hace fetch/XHR con contenido del XML.
 *   2. Cero persistencia: nada se escribe en localStorage/sessionStorage/IndexedDB.
 *   3. Telemetría restringida: el único evento permitido en esta ruta es
 *      'xml_cfdi_page_view', sin payload. Ver analytics/xmlConverterAnalytics.ts.
 *
 * Cambiar `nominaEnabled` a `false` oculta el soporte de nómina sin borrar código.
 * -----------------------------------------------------------------------------
 */

export const converterConfig = {
  /** Si Josué no necesita nómina tras la validación, cambiar a false. */
  nominaEnabled: true,

  /** Tope de archivos por lote en fase Labs. Subir solo cuando exista Web Worker. */
  maxBatchFiles: 50,

  /** Ruta de la herramienta — usada también como key de exclusión en analytics. */
  routePath: '/labs/xml-cfdi',
} as const;

export type ConverterConfig = typeof converterConfig;
