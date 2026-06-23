export interface ValidateItem {
  text: string
  highlighted?: boolean
}

interface ValidateWithExpertCardProps {
  title?: string
  items: ValidateItem[]
}

/**
 * Checklist reutilizable para convertir un diagnóstico en una lista de
 * acción práctica antes de hablar con un profesional. `highlighted`
 * permite resaltar los puntos más relevantes para el caso concreto sin
 * ocultar el resto del checklist estándar.
 */
export default function ValidateWithExpertCard({
  title = 'Antes de tomar una decisión, valida estos puntos con un contador',
  items,
}: ValidateWithExpertCardProps) {
  return (
    <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
      <p className="font-semibold text-primary mb-2">{title}</p>
      <ul className="text-sm text-gray-700 space-y-1.5">
        {items.map((item) => (
          <li key={item.text} className="flex gap-2">
            <span className="text-primary">☐</span>
            <span className={item.highlighted ? 'font-semibold text-primary' : ''}>
              {item.text}
              {item.highlighted && (
                <span className="ml-1 text-xs text-blue-600">(relevante para tu caso)</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
