import { Link, Outlet } from 'react-router-dom'

/**
 * Layout específico del producto Laboral Suite. Vive anidado dentro del
 * Layout global de ROMANUS. Solo aporta el breadcrumb de marca — la
 * navegación de herramientas (Finiquito, Liquidación, etc.) ahora vive
 * en el catálogo de /laboral-suite, accesible desde el menú principal,
 * para no duplicar navegación secundaria dentro de cada calculadora.
 */
export default function LaboralMXLayout() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-xs uppercase tracking-wide text-stone">
        <Link to="/" className="hover:text-gold-dark transition">
          Romanus
        </Link>
        <span className="mx-1.5 text-gray-300">›</span>
        <Link to="/laboral-suite" className="hover:text-gold-dark transition">
          Laboral Suite
        </Link>
      </div>

      <Outlet />
    </div>
  )
}
