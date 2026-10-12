import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

// "Labs" no aparece aquí: es un laboratorio interno, no un producto
// (ver App.tsx). "Laboral Suite" tampoco: ahora vive DENTRO de
// Productos, como su producto activo, no como sección independiente.
const ENLACES = [
  { to: '/', label: 'Inicio' },
  { to: '/herramientas', label: 'Herramientas' },
  { to: '/laboral-suite', label: 'Laboral' },
  { to: '/con-causa', label: 'Con Causa' },
  { to: '/acerca-de', label: 'Nosotros' },
]

export default function Navbar() {
  const [abierto, setAbierto] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-primary text-white shadow-sm">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link
          to="/"
          className="shrink-0 font-display text-2xl font-semibold uppercase tracking-[0.24em] text-white transition hover:text-gold"
          onClick={() => setAbierto(false)}
        >
          Romanus
        </Link>

        <button
          className="min-h-11 min-w-11 rounded-md text-2xl leading-none transition hover:bg-white/10 md:hidden"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
        >
          {abierto ? '✕' : '☰'}
        </button>

        <nav className="hidden items-center gap-8 text-[13px] font-medium uppercase tracking-[0.08em] md:flex">
          {ENLACES.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                isActive ? 'text-gold' : 'text-gray-200 transition hover:text-white'
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {abierto && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 text-sm uppercase tracking-wide md:hidden">
          {ENLACES.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setAbierto(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 ${isActive ? 'bg-white/10 font-semibold text-gold' : 'text-gray-200'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
