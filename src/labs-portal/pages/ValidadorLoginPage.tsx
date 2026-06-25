import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useValidatorSession } from '../auth/useValidatorSession'
import { inicializarDatosDePrueba } from '../storage/seedData'
import { useNoIndex } from '../../labs/useNoIndex'

export default function ValidadorLoginPage() {
  useNoIndex()
  useEffect(() => {
    inicializarDatosDePrueba()
  }, [])

  const { iniciarSesion, estaAutenticado } = useValidatorSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (estaAutenticado) {
    const destino = (location.state as { desde?: string } | null)?.desde ?? '/labs'
    return <Navigate to={destino} replace />
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    const resultado = iniciarSesion(usuario.trim(), password)
    if (!resultado.ok) {
      setError(resultado.error ?? 'No se pudo iniciar sesión.')
      return
    }
    navigate('/labs', { replace: true })
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="font-display text-2xl font-semibold tracking-[0.18em] uppercase text-primary">Romanus</p>
          <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mt-1">Programa de Validadores</p>
        </div>

        <form onSubmit={manejarEnvio} className="rounded-lg border border-gray-200 bg-white p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsuario(e.target.value)}
              className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2.5 text-base"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña temporal</label>
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
            Entrar a ROMANUS Labs
          </button>
        </form>

        <p className="text-xs text-stone text-center mt-4">
          Acceso exclusivo para validadores invitados. Si no tienes credenciales, contacta al
          equipo de ROMANUS.
        </p>
      </div>
    </div>
  )
}
