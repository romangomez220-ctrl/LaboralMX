import type { PaidReportSnapshot } from './types'

const drafts = new Map<string, PaidReportSnapshot>()

function createOpaqueId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Conserva el snapshot premium solo en memoria durante la sesión activa.
 * No lo serializa en history.state, sessionStorage, localStorage ni el DOM.
 */
export function storeReportDraft(snapshot: PaidReportSnapshot): string {
  const id = createOpaqueId()
  drafts.set(id, snapshot)
  return id
}

export function resolveReportDraft(id?: string): PaidReportSnapshot | undefined {
  return id ? drafts.get(id) : undefined
}
