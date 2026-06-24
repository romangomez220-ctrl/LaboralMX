/**
 * analytics/xmlConverterAnalytics.ts
 * -----------------------------------------------------------------------------
 * REGLA NO NEGOCIABLE: esta ruta (/labs/xml-cfdi) no debe enviar a Google
 * Analytics 4 (ni a ningún otro sistema) nombres de archivo, contenido de
 * XML, RFC, CURP, NSS, UUID, importes, ni datos de emisor/receptor.
 *
 * Cómo se exige, no solo se documenta:
 *   1. AllowedEventName es la ÚNICA forma de nombrar un evento aquí — no
 *      existe un parámetro de payload en la firma de la función. Es
 *      estructuralmente imposible pasar datos adicionales sin que
 *      TypeScript marque error de compilación.
 *   2. Reutiliza trackEvent() de src/utils/analytics.ts (la misma
 *      integración de GA4 que usa el resto de ROMANUS) en vez de declarar
 *      su propio acceso a window.gtag, para no duplicar esa declaración
 *      global y mantener un solo punto de contacto con GA4 en todo el
 *      proyecto.
 * -----------------------------------------------------------------------------
 */

import { trackEvent } from '../../../utils/analytics'

export type AllowedEventName =
  | 'xml_cfdi_page_view'
  | 'xml_cfdi_consent_accepted'
  | 'xml_cfdi_export_completed'

export function trackXmlConverterEvent(name: AllowedEventName): void {
  trackEvent(name, {})
}
