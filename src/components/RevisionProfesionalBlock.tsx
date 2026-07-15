import { Link } from 'react-router-dom'
import { trackResultAction } from '../utils/analytics'
import type { TipoCalculo } from '../types/labor'

interface RevisionProfesionalBlockProps {
  calculator?: TipoCalculo
}

export default function RevisionProfesionalBlock({ calculator }: RevisionProfesionalBlockProps) {
  return (
    <div className="rounded-lg border border-gold/60 bg-white p-5">
      <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
        Siguiente paso
      </p>
      <h3 className="font-semibold text-primary text-lg mb-3">
        Usa esta estimación para hacer una revisión ordenada
      </h3>
      <ol className="grid sm:grid-cols-3 gap-3 text-sm text-gray-600 mb-5">
        <li className="rounded-lg bg-ivory p-3"><strong className="text-primary">1.</strong> Guarda el PDF con el desglose.</li>
        <li className="rounded-lg bg-ivory p-3"><strong className="text-primary">2.</strong> Compáralo con recibos, fechas y la propuesta recibida.</li>
        <li className="rounded-lg bg-ivory p-3"><strong className="text-primary">3.</strong> Revisa diferencias con una persona profesional antes de decidir.</li>
      </ol>
      <div className="flex gap-3 flex-wrap">
        <Link
          to="/productos/laboralmx/como-se-calcula"
          onClick={() => calculator && trackResultAction(calculator, 'view_methodology')}
          className="rounded-lg bg-primary text-white px-5 py-2.5 font-semibold hover:bg-primary-light transition"
        >
          Entender cómo se calcula
        </Link>
        <Link
          to="/productos/laboralmx/aviso-legal"
          onClick={() => calculator && trackResultAction(calculator, 'view_legal_notice')}
          className="rounded-lg border-2 border-primary text-primary px-5 py-2.5 font-semibold hover:bg-primary hover:text-white transition"
        >
          Revisar alcance legal
        </Link>
      </div>
    </div>
  )
}
