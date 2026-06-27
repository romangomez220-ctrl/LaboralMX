import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

// "Labs" no aparece aquí: es un laboratorio interno, no un producto
// (ver App.tsx). "Laboral Suite" tampoco: ahora vive DENTRO de
// Productos, como su producto activo, no como sección independiente.
const ENLACES = [
  { to: '/', label: 'Inicio' },
  { to: '/productos', label: 'Productos' },
  { to: '/herramientas', label: 'Herramientas' },
  { to: '/con-causa', label: 'Con Causa' },
  { to: '/acerca-de', label: 'Acerca de' },
]

export default function Navbar() {
  const [abierto, setAbierto] = useState(false)

  return (
    <header className="bg-primary text-white sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-semibold text-[28px] tracking-[0.24em] uppercase text-white hover:text-gold transition shrink-0"
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

        <nav className="hidden md:flex items-center gap-9 text-sm uppercase tracking-wide">
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
        <nav className="md:hidden flex flex-col px-6 pb-4 gap-3 text-sm uppercase tracking-wide">
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
