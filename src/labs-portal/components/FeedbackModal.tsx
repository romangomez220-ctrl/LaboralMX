import { useState, type ChangeEvent } from 'react'
import { crearFeedback, registrarActividad } from '../storage/localStore'
import type { TipoFeedback } from '../types'

interface FeedbackModalProps {
  abierto: boolean
  onCerrar: () => void
  herramientaId: string
  herramientaNombre: string
  validadorId: string
}

const TIPOS: { value: TipoFeedback; label: string }[] = [
  { value: 'error', label: 'Reportar un error' },
  { value: 'idea', label: 'Proponer una idea' },
  { value: 'comentario_general', label: 'Comentario general' },
]

export default function FeedbackModal({
  abierto,
  onCerrar,
  herramientaId,
  herramientaNombre,
  validadorId,
}: FeedbackModalProps) {
  const [tipo, setTipo] = useState<TipoFeedback>('comentario_general')
  const [calificacion, setCalificacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)

  if (!abierto) return null

  function manejarEnvio() {
    if (comentario.trim() === '') return
    crearFeedback({ herramientaId, validadorId, calificacion, tipo, comentario: comentario.trim() })
    registrarActividad({ validadorId, tipo: 'feedback_enviado', herramientaId, duracionAproxSegundos: null })
    setEnviado(true)
    setTimeout(() => {
      setEnviado(false)
      setComentario('')
      onCerrar()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <p className="text-xs uppercase tracking-wide text-stone mb-1">Feedback</p>
        <h2 className="text-lg font-bold text-primary mb-3">{herramientaNombre}</h2>

        {enviado ? (
          <div className="rounded-lg bg-success-light text-success p-4 text-sm font-medium">
            Gracias — tu feedback quedó registrado.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select
                value={tipo}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setTipo(e.target.value as TipoFeedback)}
                className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Calificación (1-5)</label>
              <input
                type="range"
                min={1}
                max={5}
                value={calificacion}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCalificacion(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-stone text-center">{calificacion} / 5</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Comentario</label>
              <textarea
                value={comentario}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComentario(e.target.value)}
                rows={4}
                className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Describe lo que encontraste..."
              />
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={onCerrar}
                className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={manejarEnvio}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition"
              >
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
