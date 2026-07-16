import { Link } from 'react-router-dom'

interface CalculatorTrustPanelProps {
  compact?: boolean
}

export default function CalculatorTrustPanel({ compact = false }: CalculatorTrustPanelProps) {
  return (
    <aside
      className={`rounded-xl border border-gold/50 bg-white ${compact ? 'p-4' : 'p-5 sm:p-6'}`}
      aria-label="Información de confianza de la calculadora"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
            Cálculo transparente
          </p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-primary">
            Tus datos se procesan en este dispositivo
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            No necesitas crear una cuenta. Fechas, salario y respuestas se usan únicamente para
            realizar el cálculo en tu navegador; no se envían a Analytics.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-success-light px-3 py-1.5 text-xs font-semibold text-success">
          Actualizado: julio de 2026
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
        <div className="rounded-lg bg-ivory p-3">
          <p className="font-semibold text-primary">Base legal visible</p>
          <p className="mt-1 text-gray-600">Ley Federal del Trabajo y supuestos mostrados en el desglose.</p>
        </div>
        <div className="rounded-lg bg-ivory p-3">
          <p className="font-semibold text-primary">Sin registro</p>
          <p className="mt-1 text-gray-600">Obtén una estimación sin proporcionar nombre, teléfono o correo.</p>
        </div>
        <div className="rounded-lg bg-ivory p-3">
          <p className="font-semibold text-primary">Resultado revisable</p>
          <p className="mt-1 text-gray-600">Consulta fórmulas, copia el desglose o descárgalo en PDF.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
        <Link className="text-primary underline decoration-gold underline-offset-4" to="/productos/laboralmx/como-se-calcula">
          Ver metodología
        </Link>
        <Link className="text-primary underline decoration-gold underline-offset-4" to="/productos/laboralmx/aviso-legal">
          Revisar alcance legal
        </Link>
        <Link className="text-primary underline decoration-gold underline-offset-4" to="/privacidad">
          Aviso de privacidad
        </Link>
      </div>
    </aside>
  )
}
