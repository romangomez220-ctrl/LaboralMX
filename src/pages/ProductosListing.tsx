import { Link } from 'react-router-dom'
import ContactWhatsAppButton from '../components/ContactWhatsAppButton'

const PROXIMAMENTE = [
  {
    nombre: 'Contable Suite',
    descripcion: 'Herramientas fiscales y contables en validación privada dentro de ROMANUS Labs.',
    estado: 'Labs',
  },
  {
    nombre: 'Jurídico Suite',
    descripcion: 'Asistentes y matrices de trabajo para abogados, en proceso de publicación gradual.',
    estado: 'Publicación gradual',
  },
]

export default function ProductosListing() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid lg:grid-cols-[1fr_0.72fr] gap-6 items-end">
        <div>
          <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
            Ecosistema ROMANUS
          </p>
          <h1 className="text-3xl font-semibold text-primary">Productos y suites</h1>
          <p className="text-sm text-stone mt-2 max-w-2xl">
            ROMANUS organiza sus herramientas por áreas de práctica. Las suites públicas ya están
            disponibles; las nuevas soluciones pasan primero por Labs antes de publicarse.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-2">
            Criterio de publicación
          </p>
          <p className="text-sm text-gray-600">
            Cada producto debe tener alcance claro, aviso legal visible y ruta funcional antes de
            quedar disponible para el público.
          </p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-gold bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Disponible
        </p>
        <p className="font-serif text-2xl font-semibold text-primary mb-1">Laboral Suite</p>
        <p className="text-sm text-gray-600 mb-5 max-w-2xl">
          Calculadoras laborales gratuitas para México: finiquito, liquidación, aguinaldo,
          vacaciones, prima vacacional y salario diario integrado.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/laboral-suite"
            className="inline-block rounded-lg bg-primary text-white px-5 py-2.5 font-semibold hover:bg-primary-light transition"
          >
            Usar Laboral Suite
          </Link>
          <Link
            to="/herramientas"
            className="inline-block rounded-lg border border-primary text-primary px-5 py-2.5 font-semibold hover:bg-primary hover:text-white transition"
          >
            Explorar biblioteca pública
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {PROXIMAMENTE.map((p) => (
          <div key={p.nombre} className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-2">
              {p.estado}
            </p>
            <p className="font-serif text-lg font-semibold text-primary mb-1">{p.nombre}</p>
            <p className="text-sm text-gray-600">{p.descripcion}</p>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <ContactWhatsAppButton label="¿Tienes dudas? Contáctanos" />
      </div>
    </div>
  )
}
