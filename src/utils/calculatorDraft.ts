const DURACION_BORRADOR_MS = 24 * 60 * 60 * 1000

interface BorradorGuardado<T> {
  expiresAt: number
  value: T
}

export function cargarBorrador<T extends object>(key: string, initialValue: T): { value: T; recovered: boolean } {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { value: initialValue, recovered: false }
    const parsed = JSON.parse(raw) as BorradorGuardado<Partial<T>>
    if (!parsed.expiresAt || parsed.expiresAt <= Date.now() || !parsed.value) {
      localStorage.removeItem(key)
      return { value: initialValue, recovered: false }
    }

    const safeValue = { ...initialValue }
    for (const keyName of Object.keys(initialValue) as Array<keyof T>) {
      if (keyName in parsed.value) safeValue[keyName] = parsed.value[keyName] as T[keyof T]
    }
    return { value: safeValue, recovered: true }
  } catch {
    return { value: initialValue, recovered: false }
  }
}

export function guardarBorrador<T extends object>(key: string, value: T): void {
  try {
    const payload: BorradorGuardado<T> = {
      expiresAt: Date.now() + DURACION_BORRADOR_MS,
      value,
    }
    localStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // El cálculo sigue funcionando aunque el navegador bloquee el almacenamiento local.
  }
}

export function borrarBorrador(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // No crítico: algunos navegadores privados bloquean localStorage.
  }
}
