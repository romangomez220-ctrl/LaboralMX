import { Link } from 'react-router-dom'

interface EcosystemCardProps {
  to: string
  nombre: string
  descripcion: string
  disponible?: boolean
  destacado?: boolean
}

export default function EcosystemCard({
  to,
  nombre,
  descripcion,
  disponible = false,
  destacado = false,
}: EcosystemCardProps) {
  return (
    <Link
      to={to}
      className={`rounded-lg p-5 transition block ${
        destacado
          ? 'border-2 border-gold bg-white hover:shadow-md'
          : 'border border-gray-200 bg-white hover:border-gold'
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-widest mb-2 ${
          disponible ? 'text-gold-dark' : 'text-stone'
        }`}
      >
        {disponible ? 'Disponible' : 'Próximamente'}
      </p>
      <p className="font-serif text-xl font-semibold text-primary mb-1">{nombre}</p>
      <p className={`text-sm ${disponible ? 'text-gray-600' : 'text-stone'}`}>{descripcion}</p>
    </Link>
  )
}
