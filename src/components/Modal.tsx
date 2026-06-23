import type { MouseEvent, ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
}

export default function Modal({ abierto, onCerrar, titulo, children }: ModalProps) {
  if (!abierto) return null

  function detenerPropagacion(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
        onClick={detenerPropagacion}
      >
        <h3 id="modal-titulo" className="text-lg font-semibold text-primary mb-3">
          {titulo}
        </h3>
        <div className="text-sm text-gray-700">{children}</div>
        <button
          onClick={onCerrar}
          className="mt-5 rounded-lg bg-primary text-white px-5 py-2 font-semibold hover:bg-primary-light transition"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
