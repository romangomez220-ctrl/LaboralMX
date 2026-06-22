import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const ENLACES_DIRECTOS = [
  { to: '/', label: 'Inicio' },
  { to: '/como-se-calcula', label: 'Cómo se calcula' },
  { to: '/aviso-legal', label: 'Aviso legal' },
  { to: '/acerca-de', label: 'Acerca de' },
]

const HERRAMIENTAS = [
  { to: '/finiquito', label: 'Finiquito' },
  { to: '/liquidacion', label: 'Liquidación' },
  { to: '/aguinaldo', label: 'Aguinaldo' },
  { to: '/vacaciones', label: 'Vacaciones y prima vacacional' },
  { to: '/sdi', label: 'Salario Diario Integrado (SDI)' },
]

export default function Navbar() {
  const [abierto, setAbierto] = useState(false)
  const [herramientasAbierto, setHerramientasAbierto] = useState(false)
  const [herramientasAbiertoMovil, setHerramientasAbiertoMovil] = useState(false)

  function cerrarTodo() {
    setAbierto(false)
    setHerramientasAbierto(false)
    setHerramientasAbiertoMovil(false)
  }

  return (
    <header className="bg-primary text-white sticky top-0 z-10 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg" onClick={cerrarTodo}>
          LaboralMX
        </Link>

        <button
          className="md:hidden text-2xl leading-none px-2"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
        >
          {abierto ? '✕' : '☰'}
        </button>

        <nav className="hidden md:flex gap-5 text-sm items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'font-semibold underline' : 'opacity-90 hover:opacity-100'
            }
          >
            Inicio
          </NavLink>

          <div
            className="relative"
            onMouseEnter={() => setHerramientasAbierto(true)}
            onMouseLeave={() => setHerramientasAbierto(false)}
          >
            <button
              className="opacity-90 hover:opacity-100 flex items-center gap-1"
              onClick={() => setHerramientasAbierto((v) => !v)}
              aria-expanded={herramientasAbierto}
              aria-haspopup="true"
            >
              Herramientas <span className="text-xs">▾</span>
            </button>
            {herramientasAbierto && (
              <div className="absolute left-0 top-full mt-1 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 py-2 min-w-[220px]">
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

          {ENLACES_DIRECTOS.filter((l) => l.to !== '/').map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                isActive ? 'font-semibold underline' : 'opacity-90 hover:opacity-100'
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {abierto && (
        <nav className="md:hidden flex flex-col px-4 pb-4 gap-3 text-sm">
          <NavLink
            to="/"
            onClick={cerrarTodo}
            className={({ isActive }) => (isActive ? 'font-semibold underline' : 'opacity-90')}
          >
            Inicio
          </NavLink>

          <div>
            <button
              className="opacity-90 flex items-center gap-1"
              onClick={() => setHerramientasAbiertoMovil((v) => !v)}
              aria-expanded={herramientasAbiertoMovil}
            >
              Herramientas <span className="text-xs">{herramientasAbiertoMovil ? '▴' : '▾'}</span>
            </button>
            {herramientasAbiertoMovil && (
              <div className="flex flex-col gap-3 mt-3 pl-4 border-l border-white/20">
                {HERRAMIENTAS.map((h) => (
                  <NavLink
                    key={h.to}
                    to={h.to}
                    onClick={cerrarTodo}
                    className={({ isActive }) => (isActive ? 'font-semibold underline' : 'opacity-90')}
                  >
                    {h.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {ENLACES_DIRECTOS.filter((l) => l.to !== '/').map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={cerrarTodo}
              className={({ isActive }) => (isActive ? 'font-semibold underline' : 'opacity-90')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
