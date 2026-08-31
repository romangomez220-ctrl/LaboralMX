import { useState } from 'react'
import { Link } from 'react-router-dom'
import { trackProfessionalReview, trackResultAction } from '../utils/analytics'
import type { TipoCalculo } from '../types/labor'
import ProfessionalReviewModal from './ProfessionalReviewModal'

interface RevisionProfesionalBlockProps {
  calculator?: TipoCalculo
  totalEstimado?: number
}

export default function RevisionProfesionalBlock({ calculator, totalEstimado }: RevisionProfesionalBlockProps) {
  const [modalAbierto, setModalAbierto] = useState(false)

  return (
    <div className="rounded-lg border-2 border-gold/70 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
        Siguiente paso
      </p>
      <h3 className="font-semibold text-primary text-lg mb-3">
        ¿La propuesta no coincide con esta estimación?
      </h3>
      <p className="mb-4 text-sm text-gray-600">
        Responde unas preguntas para saber si tu situación puede canalizarse con un abogado laboral participante. Enviar la solicitud no garantiza atención ni crea una relación abogado-cliente.
      </p>
      <ol className="grid sm:grid-cols-3 gap-3 text-sm text-gray-600 mb-5">
        <li className="rounded-lg bg-ivory p-3"><strong className="text-primary">1.</strong> Guarda el PDF con el desglose.</li>
        <li className="rounded-lg bg-ivory p-3"><strong className="text-primary">2.</strong> Compáralo con recibos, fechas y la propuesta recibida.</li>
        <li className="rounded-lg bg-ivory p-3"><strong className="text-primary">3.</strong> Revisa diferencias con una persona profesional antes de decidir.</li>
      </ol>
      <div className="flex gap-3 flex-wrap">
        {calculator && (
          <button
            type="button"
            onClick={() => {
              trackProfessionalReview(calculator, 'started')
              setModalAbierto(true)
            }}
            className="rounded-lg bg-primary text-white px-5 py-2.5 font-semibold hover:bg-primary-light transition"
          >
            Solicitar revisión de mi situación
          </button>
        )}
        <Link
          to="/productos/laboralmx/como-se-calcula"
          onClick={() => calculator && trackResultAction(calculator, 'view_methodology')}
          className="rounded-lg border-2 border-primary text-primary px-5 py-2.5 font-semibold hover:bg-primary hover:text-white transition"
        >
          Entender cómo se calcula
        </Link>
        <Link
          to="/productos/laboralmx/aviso-legal"
          onClick={() => calculator && trackResultAction(calculator, 'view_legal_notice')}
          className="rounded-lg border border-gray-300 text-gray-600 px-5 py-2.5 font-semibold hover:border-primary hover:text-primary transition"
        >
          Revisar alcance legal
        </Link>
      </div>
      {calculator && (
        <ProfessionalReviewModal
          abierto={modalAbierto}
          calculator={calculator}
          totalEstimado={totalEstimado}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  )
}
