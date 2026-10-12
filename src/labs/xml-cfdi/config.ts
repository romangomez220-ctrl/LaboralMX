/**
 * config.ts
 * -----------------------------------------------------------------------------
 * Configuración central del módulo "Auditor CFDI".
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

  /** Límite conservador mientras el procesamiento siga en el hilo principal. */
  maxBatchFiles: 250,

  /** Evita que un solo XML agote la memoria del navegador. */
  maxFileBytes: 5 * 1024 * 1024,

  /** Límite total por lote para la fase de validación. */
  maxBatchBytes: 25 * 1024 * 1024,

  /**
   * La exportación gratuita solo existe dentro de Labs para validar el reporte.
   * Debe cambiarse a false antes de publicar la herramienta; el producto
   * público utilizará el checkout y no debe depender de este interruptor.
   */
  pilotExportEnabled: true,

  /** Ruta de la herramienta — usada también como key de exclusión en analytics. */
  routePath: '/labs/xml-cfdi',
} as const;

export type ConverterConfig = typeof converterConfig;
