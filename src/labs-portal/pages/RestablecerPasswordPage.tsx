/**
 * RestablecerPasswordPage.tsx
 * -----------------------------------------------------------------------------
 * Página a la que llega el validador después de hacer clic en el enlace
 * del correo de recuperación (enviado por
 * authRepository.solicitarRestablecerPassword). Supabase JS detecta el
 * token de la URL automáticamente y establece una sesión de recuperación
 * temporal — esta página solo pide la contraseña nueva y la guarda.
 * -----------------------------------------------------------------------------
 */

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../repositories/supabase/client'
import { useNoIndex } from '../../labs/useNoIndex'

export default function RestablecerPasswordPage() {
  useNoIndex()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)

  async function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }
    const { error: errorUpdate } = await supabase.auth.updateUser({ password })
    if (errorUpdate) {
      setError(errorUpdate.message)
      return
    }
    setListo(true)
    setTimeout(() => navigate('/labs/login', { replace: true }), 2000)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="font-display text-2xl font-semibold tracking-[0.18em] uppercase text-primary">Romanus</p>
          <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mt-1">Restablecer contraseña</p>
        </div>

        {listo ? (
          <div className="rounded-lg bg-success-light text-success p-4 text-sm font-medium text-center">
            Contraseña actualizada. Redirigiendo al inicio de sesión…
          </div>
        ) : (
          <form onSubmit={manejarEnvio} className="rounded-lg border border-gray-200 bg-white p-6 flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2.5 text-base"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmacion}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmacion(e.target.value)}
                className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2.5 text-base"
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition"
            >
              Guardar nueva contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
