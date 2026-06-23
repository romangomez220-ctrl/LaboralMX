import { Link } from 'react-router-dom'
import ContactWhatsAppButton from '../components/ContactWhatsAppButton'

const PROXIMAMENTE = [
  {
    nombre: 'Contable Suite',
    descripcion: 'Herramientas fiscales y contables para emprendedores y profesionistas.',
  },
  {
    nombre: 'Empresarial Suite',
    descripcion: 'Recursos digitales para gestión y toma de decisiones.',
  },
]

export default function ProductosListing() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Productos</h1>
        <p className="text-sm text-stone mt-1">
          Soluciones digitales de ROMANUS para el ámbito jurídico, fiscal y empresarial.
        </p>
      </div>

      <div className="rounded-lg border-2 border-gold bg-white p-5">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Disponible
        </p>
        <p className="font-serif text-xl font-semibold text-primary mb-1">Laboral Suite</p>
        <p className="text-sm text-gray-600 mb-4">
          Calculadoras laborales gratuitas para México.
        </p>
        <Link
          to="/laboral-suite"
          className="inline-block rounded-lg bg-primary text-white px-5 py-2.5 font-semibold hover:bg-primary-light transition"
        >
          Ver Laboral Suite
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {PROXIMAMENTE.map((p) => (
          <div key={p.nombre} className="rounded-lg border border-gray-200 bg-gray-50 p-5 opacity-80">
            <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-2">
              Próximamente
            </p>
            <p className="font-serif text-lg font-semibold text-gray-500 mb-1">{p.nombre}</p>
            <p className="text-sm text-gray-500">{p.descripcion}</p>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <ContactWhatsAppButton label="¿Tienes dudas? Contáctanos" />
      </div>
    </div>
  )
}
