declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

import { PAID_REPORTS_CONFIG } from '../config/paidReports'

export const GA_MEASUREMENT_ID = 'G-0XMBSS23D7'

const SENSITIVE_REPORT_PARAMS = ['report_token', 'report_purchase']

export function sanitizeAnalyticsPath(path: string): string {
  try {
    const url = new URL(path, 'https://analytics.invalid')
    SENSITIVE_REPORT_PARAMS.forEach((parameter) => url.searchParams.delete(parameter))
    const query = url.searchParams.toString()
    return `${url.pathname}${query ? `?${query}` : ''}`
  } catch {
    return path.split('?')[0]
  }
}

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

  const safePath = sanitizeAnalyticsPath(path)

  window.gtag('event', 'page_view', {
    page_path: safePath,
    page_location: `${window.location.origin}${safePath}`,
    page_title: document.title,
  })
}

/**
 * Envía un evento de GA4 con nombre y parámetros propios (a diferencia de
 * trackPageView, que siempre envía "page_view"). Se usa para eventos de
 * producto específicos, como los de ROMANUS Labs (resico_page_view,
 * resico_calculation_started, etc.).
 */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

function currentPath(): string {
  if (typeof window === 'undefined') return ''
  return sanitizeAnalyticsPath(window.location.pathname + window.location.search)
}

/**
 * Eventos públicos mínimos para medir intención real sin enviar datos
 * personales ni información jurídica sensible a Google Analytics.
 */
export function trackCtaClick(label: string, destination: string, location = currentPath()): void {
  trackEvent('romanus_cta_click', {
    cta_label: label,
    cta_destination: destination,
    cta_location: location,
  })
}

export function trackWhatsAppIntent(source: string, mode: 'direct' | 'consent_required'): void {
  trackEvent('romanus_whatsapp_intent', {
    source,
    mode,
    page_path: currentPath(),
  })
}

export function trackConCausaStep(step: string): void {
  trackEvent('romanus_con_causa_step', {
    step,
    page_path: currentPath(),
  })
}

export function trackToolOpen(toolId: string, toolName: string, source = currentPath()): void {
  trackEvent('romanus_tool_open', {
    tool_id: toolId,
    tool_name: toolName,
    source,
  })
}

export function trackCalculatorCompleted(calculator: string): void {
  trackEvent('romanus_calculator_completed', {
    calculator,
    page_path: currentPath(),
  })
}

export function trackCalculatorStarted(calculator: 'finiquito' | 'liquidacion'): void {
  trackEvent('romanus_calculator_started', {
    calculator,
    page_path: currentPath(),
  })
}

export function trackCalculatorValidationError(
  calculator: 'finiquito' | 'liquidacion',
  fields: string[],
): void {
  trackEvent('romanus_calculator_validation_error', {
    calculator,
    error_count: fields.length,
    error_fields: fields.join(','),
    page_path: currentPath(),
  })
}

export function trackResultViewed(calculator: 'finiquito' | 'liquidacion'): void {
  trackEvent('romanus_result_viewed', {
    calculator,
    page_path: currentPath(),
  })
}

export function trackResultFeedback(
  calculator: 'finiquito' | 'liquidacion',
  rating: 'helpful' | 'partial' | 'unclear' | 'possible_error',
): void {
  trackEvent('romanus_result_feedback', {
    calculator,
    rating,
    page_path: currentPath(),
  })
}

export function trackResultAction(
  calculator: 'finiquito' | 'liquidacion',
  action: 'copy' | 'share' | 'download_pdf' | 'new_calculation' | 'view_methodology' | 'view_legal_notice' | 'report_problem',
): void {
  trackEvent('romanus_result_action', {
    calculator,
    action,
    page_path: currentPath(),
  })
}

export function trackProfessionalReview(
  calculator: 'finiquito' | 'liquidacion',
  step: 'started' | 'submitted' | 'blocked_urgent' | 'whatsapp_continued',
): void {
  const eventName = {
    started: 'romanus_review_started',
    submitted: 'romanus_review_submitted',
    blocked_urgent: 'romanus_review_blocked_urgent',
    whatsapp_continued: 'romanus_review_whatsapp_continued',
  }[step]

  trackEvent(eventName, {
    calculator,
    page_path: currentPath(),
  })
}

type PaidReportStep =
  | 'offer_viewed'
  | 'checkout_started'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'generated'
  | 'downloaded'

export function trackPaidReport(step: PaidReportStep, calculator: 'liquidacion'): void {
  trackEvent(`romanus_pdf_${step}`, {
    calculator_type: calculator,
    report_price: PAID_REPORTS_CONFIG.priceMinor / 100,
    currency: PAID_REPORTS_CONFIG.currency,
    report_version: PAID_REPORTS_CONFIG.reportVersion,
    payment_provider: PAID_REPORTS_CONFIG.paymentProvider,
  })
}
