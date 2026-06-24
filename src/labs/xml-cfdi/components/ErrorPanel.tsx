/**
 * components/ErrorPanel.tsx
 * -----------------------------------------------------------------------------
 * Lista los archivos que fallaron, sin bloquear la visualización ni
 * exportación del resto del lote.
 * -----------------------------------------------------------------------------
 */

import type { ArchivoConError } from '../core/types'

interface ErrorPanelProps {
  errores: ArchivoConError[]
}

export function ErrorPanel({ errores }: ErrorPanelProps) {
  if (errores.length === 0) return null

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="mb-2 font-medium text-red-800">
        {errores.length} archivo(s) no se pudieron procesar:
      </p>
      <ul className="flex flex-col gap-1 text-sm text-red-700">
        {errores.map((e, i) => (
          <li key={`${e.archivo}-${i}`}>
            <strong>{e.archivo}</strong> — {e.motivo}
          </li>
        ))}
      </ul>
    </div>
  )
}
