import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const HERRAMIENTAS = [
  { to: '/productos/laboralmx/finiquito', label: 'Finiquito' },
  { to: '/productos/laboralmx/liquidacion', label: 'Liquidación' },
  { to: '/productos/laboralmx/aguinaldo', label: 'Aguinaldo' },
  { to: '/productos/laboralmx/vacaciones', label: 'Vacaciones y prima vacacional' },
  { to: '/productos/laboralmx/sdi', label: 'Salario Diario Integrado (SDI)' },
]

const ENLACES_DIRECTOS = [
  { to: '/productos/laboralmx/como-se-calcula', label: 'Cómo se calcula' },
  { to: '/productos/laboralmx/aviso-legal', label: 'Aviso legal' },
  { to: '/productos/laboralmx/acerca-de', label: 'Acerca de' },
]

/**
 * Layout específico del producto Laboral Suite. Vive anidado dentro del
 * Layout global de ROMANUS. Incluye un breadcrumb de marca para que el
 * usuario sienta en todo momento que está dentro de un producto del
 * ecosistema, más la sub-navegación de herramientas propia de Laboral Suite.
 */
export default function LaboralMXLayout() {
  const [abierto, setAbierto] = useState(false)
  const [herramientasAbierto, setHerramientasAbierto] = useState(false)
  const [herramientasAbiertoMovil, setHerramientasAbiertoMovil] = useState(false)

  function cerrarTodo() {
    setAbierto(false)
    setHerramientasAbierto(false)
    setHerramientasAbiertoMovil(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 pt-3 text-xs uppercase tracking-wide text-stone">
          <Link to="/" className="hover:text-gold-dark transition">
            Romanus
          </Link>
          <span className="mx-1.5 text-gray-300">›</span>
          <span className="text-primary font-semibold">Laboral Suite</span>
        </div>

        <div className="px-4 h-12 flex items-center justify-between">
          <Link to="/productos/laboralmx" className="font-semibold text-primary" onClick={cerrarTodo}>
            Laboral Suite
          </Link>

          <button
            className="md:hidden text-xl leading-none px-2 text-primary"
            onClick={() => setAbierto((v) => !v)}
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={abierto}
          >
            {abierto ? '✕' : '☰'}
          </button>

          <nav className="hidden md:flex gap-4 text-sm items-center text-gray-600">
            <div
              className="relative"
              onMouseEnter={() => setHerramientasAbierto(true)}
              onMouseLeave={() => setHerramientasAbierto(false)}
            >
              <button
                className="hover:text-primary flex items-center gap-1"
                onClick={() => setHerramientasAbierto((v) => !v)}
                aria-expanded={herramientasAbierto}
                aria-haspopup="true"
              >
                Herramientas <span className="text-xs">▾</span>
              </button>
              {herramientasAbierto && (
                <div className="absolute right-0 top-full mt-1 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 py-2 min-w-[220px] z-20">
                  {HERRAMIENTAS.map((h) => (
                    <NavLink
                      key={h.to}
                      to={h.to}
                      onClick={cerrarTodo}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm ${isActive ? 'font-semibold text-primary' : 'hover:bg-gray-50'}`
                      }
                    >
                      {h.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {ENLACES_DIRECTOS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-primary' : 'hover:text-primary'
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {abierto && (
          <nav className="md:hidden flex flex-col px-4 pb-4 gap-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
            <div>
              <button
                className="flex items-center gap-1"
                onClick={() => setHerramientasAbiertoMovil((v) => !v)}
                aria-expanded={herramientasAbiertoMovil}
              >
                Herramientas <span className="text-xs">{herramientasAbiertoMovil ? '▴' : '▾'}</span>
              </button>
              {herramientasAbiertoMovil && (
                <div className="flex flex-col gap-3 mt-3 pl-4 border-l border-gray-200">
                  {HERRAMIENTAS.map((h) => (
                    <NavLink
                      key={h.to}
                      to={h.to}
                      onClick={cerrarTodo}
                      className={({ isActive }) => (isActive ? 'font-semibold text-primary' : '')}
                    >
                      {h.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {ENLACES_DIRECTOS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={cerrarTodo}
                className={({ isActive }) => (isActive ? 'font-semibold text-primary' : '')}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>

      <Outlet />
    </div>
  )
}
