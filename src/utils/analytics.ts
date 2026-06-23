declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export const GA_MEASUREMENT_ID = 'G-0XMBSS23D7'

/**
 * Registra un page view en GA4 para la ruta indicada. Se usa en cada
 * cambio de ruta de React Router (ver AnalyticsTracker.tsx), ya que la
 * etiqueta global en index.html tiene send_page_view desactivado para
 * evitar contar solo la carga inicial y perder las navegaciones internas
 * de la SPA.
 *
 * Defensivo: si gtag no cargó (bloqueador de anuncios, fallo de red, etc.)
 * no rompe la aplicación, simplemente no envía el evento.
 */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}
