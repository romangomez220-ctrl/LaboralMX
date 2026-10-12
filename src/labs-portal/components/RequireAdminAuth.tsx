import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminSession } from '../auth/useAdminSession'
import { useNoIndex } from '../../labs/useNoIndex'

export default function RequireAdminAuth({ children }: { children: ReactNode }) {
  useNoIndex()
  const { autenticado, cargando } = useAdminSession()

  if (cargando) {
    return (
      <div className="flex min-h-48 items-center justify-center" role="status" aria-live="polite">
        <span className="text-sm text-stone">Verificando acceso…</span>
      </div>
    )
  }
  if (!autenticado) return <Navigate to="/labs/admin/login" replace />

  return <>{children}</>
}
