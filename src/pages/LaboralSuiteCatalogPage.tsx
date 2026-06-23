import { Link } from 'react-router-dom'

const HERRAMIENTAS = [
  {
    to: '/productos/laboralmx/finiquito',
    nombre: 'Finiquito',
    descripcion: 'Cálculo de finiquito por renuncia, mutuo acuerdo u otros supuestos.',
  },
  {
    to: '/productos/laboralmx/liquidacion',
    nombre: 'Liquidación',
    descripcion: 'Finiquito más indemnización constitucional en despido injustificado.',
  },
  {
    to: '/productos/laboralmx/aguinaldo',
    nombre: 'Aguinaldo',
    descripcion: 'Estimación de aguinaldo proporcional al 31 de diciembre.',
  },
  {
    to: '/productos/laboralmx/vacaciones',
    nombre: 'Vacaciones',
    descripcion: 'Días de vacaciones pendientes según tu antigüedad laboral.',
  },
  {
    to: '/productos/laboralmx/vacaciones',
    nombre: 'Prima vacacional',
    descripcion: '25% sobre el valor de tus vacaciones pendientes.',
  },
]

const ENLACES_UTILES = [
  { to: '/productos/laboralmx/como-se-calcula', label: 'Cómo se calcula' },
  { to: '/productos/laboralmx/aviso-legal', label: 'Aviso legal' },
  { to: '/productos/laboralmx/acerca-de', label: 'Acerca de Laboral Suite' },
]

/**
 * Laboral Suite ahora es un producto de primer nivel, accesible desde el
 * menú principal de ROMANUS. Esta página es su catálogo de herramientas;
 * cada tarjeta enlaza directamente a la calculadora correspondiente
 * (que sigue viviendo, sin cambios, en /productos/laboralmx/*).
 */
export default function LaboralSuiteCatalogPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center pt-4">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Producto disponible
        </p>
        <h1 className="text-3xl font-semibold text-primary">Laboral Suite</h1>
        <p className="text-sm text-stone mt-2 max-w-md mx-auto">
          Calculadoras laborales conforme a la Ley Federal del Trabajo. Elige la herramienta que
          necesitas.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {HERRAMIENTAS.map((h) => (
          <Link
            key={h.nombre}
            to={h.to}
            className="rounded-lg border border-gray-200 bg-white p-5 hover:border-gold transition"
          >
            <p className="font-serif text-xl font-semibold text-primary mb-1">{h.nombre}</p>
            <p className="text-sm text-gray-600">{h.descripcion}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-stone border-t border-gray-200 pt-5">
        {ENLACES_UTILES.map((l) => (
          <Link key={l.to} to={l.to} className="hover:text-primary transition underline">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
