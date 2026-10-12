import { Link } from 'react-router-dom'

interface CalculatorTrustPanelProps {
  compact?: boolean
}

export default function CalculatorTrustPanel(_: CalculatorTrustPanelProps) {
  return (
    <aside
      className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Privacidad y metodología"
    >
      <p>
        <span className="font-semibold text-primary">Privado y sin registro.</span>{' '}
        El cálculo se realiza en tu navegador.
      </p>
      <Link
        className="shrink-0 font-semibold text-primary underline decoration-gold underline-offset-4"
        to="/productos/laboralmx/como-se-calcula"
      >
        Ver metodología
      </Link>
    </aside>
  )
}
