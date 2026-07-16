import { useState } from 'react'
import { trackResultFeedback } from '../utils/analytics'
import type { TipoCalculo } from '../types/labor'

interface ResultFeedbackProps {
  calculator: TipoCalculo
}

const OPTIONS = [
  { value: 'helpful', label: 'Sí, fue claro' },
  { value: 'partial', label: 'Parcialmente' },
  { value: 'unclear', label: 'No entendí el resultado' },
  { value: 'possible_error', label: 'Encontré un posible error' },
] as const

export default function ResultFeedback({ calculator }: ResultFeedbackProps) {
  const [selection, setSelection] = useState<string | null>(null)

  function choose(value: typeof OPTIONS[number]['value']) {
    if (selection) return
    setSelection(value)
    trackResultFeedback(calculator, value)
  }

  return (
    <section className="rounded-xl border border-gold/50 bg-white p-5" aria-labelledby="result-feedback-title">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Ayúdanos a mejorar</p>
      <h2 id="result-feedback-title" className="mt-1 text-xl font-semibold text-primary">¿Este cálculo te ayudó?</h2>
      {selection ? (
        <p className="mt-3 rounded-lg bg-success-light p-3 text-sm font-medium text-success" role="status">
          Gracias. Tu respuesta anónima quedó registrada; no enviamos los datos de tu cálculo.
        </p>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(option.value)}
              className="min-h-11 rounded-lg border border-gray-300 bg-ivory px-4 py-2 text-left text-sm font-semibold text-primary transition hover:border-primary hover:bg-white"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
