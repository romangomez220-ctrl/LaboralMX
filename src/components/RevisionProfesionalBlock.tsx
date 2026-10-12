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
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Orientación profesional</p>
        <h2 className="mt-1 text-xl font-semibold text-primary">¿Necesitas revisar tu caso?</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Si una propuesta no coincide con el cálculo, solicita una revisión inicial de tu situación.
        </p>
      </div>
      <div className="mt-4 flex shrink-0 flex-wrap gap-3 sm:mt-0 sm:justify-end">
        {calculator && (
          <button
            type="button"
            onClick={() => {
              trackProfessionalReview(calculator, 'started')
              setModalAbierto(true)
            }}
            className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary-light"
          >
            Solicitar revisión
          </button>
        )}
        <Link
          to="/productos/laboralmx/como-se-calcula"
          onClick={() => calculator && trackResultAction(calculator, 'view_methodology')}
          className="rounded-lg border border-primary px-5 py-2.5 font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          Ver metodología
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
    </section>
  )
}
