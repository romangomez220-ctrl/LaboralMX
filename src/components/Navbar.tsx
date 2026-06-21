import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const ENLACES = [
  { to: '/', label: 'Inicio' },
  { to: '/finiquito', label: 'Finiquito' },
  { to: '/liquidacion', label: 'Liquidación' },
  { to: '/como-se-calcula', label: 'Cómo se calcula' },
  { to: '/aviso-legal', label: 'Aviso legal' },
  { to: '/acerca-de', label: 'Acerca de' },
]

export default function Navbar() {
  const [abierto, setAbierto] = useState(false)

  return (
    <header className="bg-primary text-white sticky top-0 z-10 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg" onClick={() => setAbierto(false)}>
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

        <nav className="hidden md:flex gap-5 text-sm">
          {ENLACES.map((l) => (
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
          {ENLACES.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setAbierto(false)}
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
