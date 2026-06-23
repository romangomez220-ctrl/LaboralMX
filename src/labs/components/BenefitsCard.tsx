interface BenefitsCardProps {
  title?: string
  benefits: string[]
}

/**
 * Tarjeta reutilizable para presentar posibles beneficios de un régimen
 * o escenario fiscal. El llamador es responsable de redactar cada
 * beneficio en lenguaje condicional ("podría", "potencialmente") — este
 * componente solo da el contenedor visual, no decide el contenido.
 */
export default function BenefitsCard({ title = 'Posibles beneficios', benefits }: BenefitsCardProps) {
  if (benefits.length === 0) return null

  return (
    <div className="rounded-lg border border-green-300 bg-success-light p-4">
      <p className="font-semibold text-success mb-2">{title}</p>
      <ul className="text-sm text-gray-700 space-y-1.5">
        {benefits.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-success">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
