interface DisclaimerCardProps {
  text: string
  title?: string
}

/**
 * Tarjeta de aviso destacado, distinta del componente Disclaimer general
 * (que se usa al final de cada resultado en toda la plataforma). Esta es
 * específica de ROMANUS Labs: se usa para un mensaje puntual en un lugar
 * concreto del flujo (p. ej. antes de las recomendaciones), no como el
 * aviso legal genérico de cierre.
 */
export default function DisclaimerCard({ text, title = 'Importante' }: DisclaimerCardProps) {
  return (
    <div className="rounded-lg border-2 border-primary bg-white p-4">
      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{title}</p>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  )
}
