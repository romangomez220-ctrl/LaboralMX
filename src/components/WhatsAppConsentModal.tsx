import { useState, type ChangeEvent, type MouseEvent } from 'react'
import { WHATSAPP_LINK } from '../config/contacto'

interface WhatsAppConsentModalProps {
  abierto: boolean
  onCerrar: () => void
}

const PUNTOS = [
  'ROMANUS es un proyecto piloto en fase de validación.',
  'La orientación tiene carácter informativo.',
  'No constituye asesoría legal formal.',
  'No genera relación abogado-cliente.',
  'El servicio es gratuito.',
  'La atención puede ser limitada o suspendida.',
  'No se atienden emergencias ni asuntos urgentes.',
]

/**
 * Consentimiento obligatorio antes de enviar a un usuario al canal de
 * WhatsApp de ROMANUS con Causa (Fase 5, v4.5). Es un componente
 * independiente del Modal genérico (no lo reutiliza) porque necesita su
 * propio botón condicionado al checkbox, en vez del botón fijo
 * "Entendido" del Modal genérico.
 */
export default function WhatsAppConsentModal({ abierto, onCerrar }: WhatsAppConsentModalProps) {
  const [aceptado, setAceptado] = useState(false)

  if (!abierto) return null

  function continuar() {
    if (!aceptado) return
    window.open(WHATSAPP_LINK, '_blank', 'noopener,noreferrer')
    setAceptado(false)
    onCerrar()
  }

  function cerrar() {
    setAceptado(false)
    onCerrar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-consent-titulo"
      onClick={cerrar}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6" onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <h3 id="whatsapp-consent-titulo" className="text-lg font-semibold text-primary mb-3">
          Antes de continuar a WhatsApp
        </h3>

        <ul className="flex flex-col gap-1.5 text-sm text-gray-700 mb-4">
          {PUNTOS.map((punto) => (
            <li key={punto} className="flex gap-2">
              <span className="text-success font-semibold">✓</span>
              <span>{punto}</span>
            </li>
          ))}
        </ul>

        <label className="flex items-start gap-2 text-sm text-gray-800 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={aceptado}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAceptado(e.target.checked)}
            className="mt-0.5"
          />
          He leído y comprendido esta información y deseo continuar.
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={!aceptado}
            onClick={continuar}
            className={`rounded-lg px-5 py-2.5 font-semibold transition ${
              aceptado
                ? 'bg-primary text-white hover:bg-primary-light'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar a WhatsApp
          </button>
          <button
            type="button"
            onClick={cerrar}
            className="rounded-lg border-2 border-gray-300 text-gray-600 px-5 py-2.5 font-semibold hover:border-primary hover:text-primary transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
