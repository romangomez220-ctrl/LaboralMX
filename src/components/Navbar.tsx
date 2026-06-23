import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const ENLACES = [
  { to: '/', label: 'Inicio' },
  { to: '/productos', label: 'Productos' },
]

export default function Navbar() {
  const [abierto, setAbierto] = useState(false)

  return (
    <header className="bg-primary text-white sticky top-0 z-10 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-semibold text-[28px] tracking-[0.24em] uppercase text-white hover:text-gold transition"
          onClick={() => setAbierto(false)}
        >
          Romanus
        </Link>

        <button
          className="md:hidden text-2xl leading-none px-2"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
        >
          {abierto ? '✕' : '☰'}
        </button>

        <nav className="hidden md:flex gap-6 text-sm uppercase tracking-wide">
          {ENLACES.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                isActive ? 'font-semibold text-gold' : 'opacity-90 hover:text-gold transition'
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {abierto && (
        <nav className="md:hidden flex flex-col px-4 pb-4 gap-3 text-sm uppercase tracking-wide">
          {ENLACES.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setAbierto(false)}
              className={({ isActive }) => (isActive ? 'font-semibold text-gold' : 'opacity-90')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
