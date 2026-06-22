import { formatCurrency } from '../utils/formatCurrency'

interface ResultCardProps {
  etiqueta: string
  monto: number
  detalle?: string
  formula?: string
  variant?: 'default' | 'total' | 'info'
}

export default function ResultCard({ etiqueta, monto, detalle, formula, variant = 'default' }: ResultCardProps) {
  const estilos: Record<string, string> = {
    default: 'bg-white border-gray-200',
    total: 'bg-success-light border-green-300',
    info: 'bg-warning-light border-amber-300',
  }
  const colorMonto: Record<string, string> = {
    default: 'text-primary',
    total: 'text-success',
    info: 'text-warning',
  }

  return (
    <div className={`rounded-lg border p-4 flex items-center justify-between gap-3 ${estilos[variant]}`}>
      <div>
        <p className="text-sm text-gray-600">{etiqueta}</p>
        {detalle && <p className="text-xs text-gray-400 mt-0.5">{detalle}</p>}
        {formula && <p className="text-xs text-gray-400 mt-0.5 italic">{formula}</p>}
      </div>
      <p className={`text-lg font-semibold whitespace-nowrap ${colorMonto[variant]}`}>
        {formatCurrency(monto)}
      </p>
    </div>
  )
}
