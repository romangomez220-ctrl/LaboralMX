import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAdminSession } from '../auth/useAdminSession'

const NAV = [
  { to: '/labs/admin', label: 'Resumen' },
  { to: '/labs/admin/validadores', label: 'Validadores' },
  { to: '/labs/admin/herramientas', label: 'Herramientas' },
  { to: '/labs/admin/feedback', label: 'Feedback' },
  { to: '/labs/admin/estadisticas', label: 'Estadísticas' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { cerrarSesion } = useAdminSession()
  const location = useLocation()

  return (
    <div className="grid sm:grid-cols-[200px_1fr] gap-6">
      <aside className="flex flex-col gap-1">
        <div className="mb-3">
          <p className="font-display text-sm font-semibold tracking-[0.18em] uppercase text-primary">Romanus</p>
          <p className="text-xs text-gold-dark font-semibold uppercase tracking-wide">Admin</p>
        </div>
        {NAV.map((item) => {
          const activo = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                activo ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
        <button
          onClick={cerrarSesion}
          className="mt-4 text-left rounded-md px-3 py-2 text-sm text-stone hover:bg-gray-100 transition"
        >
          Cerrar sesión
        </button>
      </aside>
      <main className="flex flex-col gap-5 min-w-0">{children}</main>
    </div>
  )
}
