interface RecoveryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function reportRecoveryStorageKey(purchaseId: string): string {
  return `romanus_report_recovery_${purchaseId}`
}

export function storeReportRecoveryToken(
  purchaseId: string,
  recoveryToken: string,
  storage: RecoveryStorage = sessionStorage,
): void {
  storage.setItem(reportRecoveryStorageKey(purchaseId), recoveryToken)
}

export function resolveReportRecoveryToken(
  purchaseId: string | null,
  tokenFromReturnUrl: string | null,
  storage: RecoveryStorage = sessionStorage,
): string | null {
  if (!purchaseId) return null
  if (tokenFromReturnUrl) {
    storeReportRecoveryToken(purchaseId, tokenFromReturnUrl, storage)
    return tokenFromReturnUrl
  }
  return storage.getItem(reportRecoveryStorageKey(purchaseId))
}
