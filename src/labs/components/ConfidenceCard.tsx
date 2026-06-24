interface ConfidenceCardProps {
  level: 'alto' | 'medio' | 'bajo'
  explanation: string
  factorsEvaluated: string[]
  specificNotes?: string[]
}

const ESTILOS_NIVEL: Record<string, { texto: string; color: string }> = {
  alto: { texto: 'Alto', color: 'text-success' },
  medio: { texto: 'Medio', color: 'text-warning' },
  bajo: { texto: 'Bajo', color: 'text-red-600' },
}

const ESTILO_DESCONOCIDO = { texto: 'No determinado', color: 'text-gray-500' }

/**
 * Tarjeta reutilizable de "nivel de confianza" para diagnósticos de
 * ROMANUS Labs. No calcula nada: solo presenta un nivel y una
 * explicación que ya fueron determinados por la lógica de cada
 * herramienta (en RESICO, por evaluarConfianza en resicoCalculations.ts,
 * que no se modificó).
 */
export default function ConfidenceCard({
  level,
  explanation,
  factorsEvaluated,
  specificNotes = [],
}: ConfidenceCardProps) {
  const estilo = ESTILOS_NIVEL[level] ?? ESTILO_DESCONOCIDO

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">Nivel de confianza</p>
      <p className={`text-lg font-bold ${estilo.color}`}>{estilo.texto}</p>
      <p className="text-sm text-gray-700 mt-2">{explanation}</p>

      {/* v4.8: explicación genérica del puntaje, reutilizable por
          cualquier herramienta futura que use esta tarjeta (no es texto
          específico de RESICO). */}
      <p className="text-xs text-gray-500 mt-2">
        Esta puntuación es una estimación orientativa basada en la información proporcionada. No
        constituye una determinación fiscal oficial. Aumenta cuando la información capturada es
        completa y consistente; disminuye cuando hay datos inciertos, valores cercanos a un
        límite relevante, o respuestas ambiguas.
      </p>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-1">
        Factores evaluados
      </p>
      <ul className="text-sm text-gray-700 space-y-1">
        {factorsEvaluated.map((f) => (
          <li key={f}>
            <span className="text-success font-semibold">✓</span> {f}
          </li>
        ))}
      </ul>

      {specificNotes.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-1">
            Observaciones específicas de este caso
          </p>
          <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
            {specificNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
