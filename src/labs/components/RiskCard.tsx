interface RiskCardProps {
  title?: string
  risks: string[]
}

/**
 * Tarjeta reutilizable para presentar riesgos o puntos de atención de un
 * escenario fiscal. El llamador decide qué riesgos son relevantes para
 * el caso concreto (este componente no filtra ni evalúa nada).
 */
export default function RiskCard({ title = 'Aspectos que deben revisarse cuidadosamente', risks }: RiskCardProps) {
  if (risks.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-300 bg-warning-light p-4">
      <p className="font-semibold text-warning mb-2">{title}</p>
      <ul className="text-sm text-gray-700 space-y-1.5">
        {risks.map((r) => (
          <li key={r} className="flex gap-2">
            <span className="text-warning">•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
