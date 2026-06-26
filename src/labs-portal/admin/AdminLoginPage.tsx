import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminSession } from '../auth/useAdminSession'
import { useNoIndex } from '../../labs/useNoIndex'

export default function AdminLoginPage() {
  useNoIndex()
  const { iniciarSesion, autenticado } = useAdminSession()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (autenticado) return <Navigate to="/labs/admin" replace />

  async function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    const resultado = await iniciarSesion(usuario.trim(), password)
    if (!resultado.ok) {
      setError(resultado.error ?? 'No se pudo iniciar sesión.')
      return
    }
    navigate('/labs/admin', { replace: true })
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="font-display text-2xl font-semibold tracking-[0.18em] uppercase text-primary">Romanus</p>
          <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mt-1">Panel Administrativo</p>
        </div>

        <form onSubmit={manejarEnvio} className="rounded-lg border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Correo del administrador</label>
            <input
              type="email"
              value={usuario}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsuario(e.target.value)}
              className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2.5 text-base"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2.5 text-base"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition"
          >
            Entrar al panel
          </button>
        </form>
      </div>
    </div>
  )
}
