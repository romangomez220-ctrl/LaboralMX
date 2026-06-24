/**
 * components/ConsentGate.tsx
 * -----------------------------------------------------------------------------
 * Bloquea la zona de carga hasta que el usuario marque explícitamente el
 * checkbox de entendimiento. No hay "recordar mi elección": cada sesión de
 * pestaña empieza sin consentimiento, porque no hay storage donde guardarlo
 * (ver regla de cero persistencia en config.ts).
 * -----------------------------------------------------------------------------
 */

import { useState, type ChangeEvent, type ReactNode } from 'react'
import { trackXmlConverterEvent } from '../analytics/xmlConverterAnalytics'

const TEXTO_CHECKBOX =
  'Entiendo que el procesamiento es local y que soy responsable de los archivos que subo.'

interface ConsentGateProps {
  children: (consentGiven: boolean) => ReactNode
}

export function ConsentGate({ children }: ConsentGateProps) {
  const [checked, setChecked] = useState(false)

  function handleChange(value: boolean) {
    setChecked(value)
    if (value) {
      trackXmlConverterEvent('xml_cfdi_consent_accepted')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-amber-300 bg-warning-light p-4 text-sm text-warning">
        <p className="mb-3">
          Este conversor procesa los archivos <strong>localmente en tu navegador</strong>. Ningún
          XML se envía a servidores de ROMANUS, no se almacena, y no se comparte con terceros.
        </p>
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="mt-1"
            checked={checked}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.checked)}
          />
          <span>{TEXTO_CHECKBOX}</span>
        </label>
      </div>

      {children(checked)}
    </div>
  )
}
