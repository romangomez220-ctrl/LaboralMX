/**
 * RequireValidatorAuth.tsx
 * -----------------------------------------------------------------------------
 * Envuelve cualquier ruta de Labs que deba quedar restringida a
 * validadores autenticados. Si no hay sesión activa, redirige a
 * /labs/login. Si hay sesión, además:
 *   - Registra actividad "herramienta_abierta" al entrar a la ruta, y
 *     calcula una duración aproximada al salir (al desmontar o cambiar de
 *     ruta) — best-effort, no captura cierres abruptos de pestaña.
 *   - Muestra una barra superior con el nombre del validador y un botón
 *     de feedback flotante para la herramienta actual.
 * -----------------------------------------------------------------------------
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useValidatorSession } from '../auth/useValidatorSession'
import { obtenerHerramientaPorRuta, registrarActividad } from '../storage/localStore'
import { useNoIndex } from '../../labs/useNoIndex'
import FeedbackModal from './FeedbackModal'

export default function RequireValidatorAuth({ children }: { children: ReactNode }) {
  useNoIndex()
  const { validador, estaAutenticado, cargando } = useValidatorSession()
  const location = useLocation()
  const [feedbackAbierto, setFeedbackAbierto] = useState(false)
  const inicioRef = useRef<number>(Date.now())

  const herramientaActual = obtenerHerramientaPorRuta(location.pathname)

  useEffect(() => {
    if (!validador) return
    inicioRef.current = Date.now()
    registrarActividad({
      validadorId: validador.id,
      tipo: 'herramienta_abierta',
      herramientaId: herramientaActual?.id ?? null,
      duracionAproxSegundos: null,
    })

    return () => {
      const duracion = Math.round((Date.now() - (inicioRef.current ?? Date.now())) / 1000)
      registrarActividad({
        validadorId: validador.id,
        tipo: 'herramienta_abierta',
        herramientaId: herramientaActual?.id ?? null,
        duracionAproxSegundos: duracion,
      })
    }
    // Se vuelve a ejecutar cada vez que cambia la ruta dentro de Labs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, validador?.id])

  if (cargando) return null

  if (!estaAutenticado || !validador) {
    return <Navigate to="/labs/login" replace state={{ desde: location.pathname }} />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm">
        <p className="text-gray-600">
          Sesión de validador: <span className="font-semibold text-primary">{validador.nombre}</span>
        </p>
        {herramientaActual && (
          <button
            type="button"
            onClick={() => setFeedbackAbierto(true)}
            className="rounded-md border border-gold text-gold-dark px-3 py-1.5 text-xs font-semibold hover:bg-warning-light transition"
          >
            Enviar feedback de esta herramienta
          </button>
        )}
      </div>

      {children}

      {herramientaActual && (
        <FeedbackModal
          abierto={feedbackAbierto}
          onCerrar={() => setFeedbackAbierto(false)}
          herramientaId={herramientaActual.id}
          herramientaNombre={herramientaActual.nombre}
          validadorId={validador.id}
        />
      )}
    </div>
  )
}
