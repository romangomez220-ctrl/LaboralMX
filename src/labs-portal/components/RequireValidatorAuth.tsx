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
 *
 * Fase 2: la búsqueda de la herramienta actual y el registro de actividad
 * pasan por repositories/, no por localStore directamente.
 * -----------------------------------------------------------------------------
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useValidatorSession } from '../auth/useValidatorSession'
import { activityRepository, assignmentsRepository } from '../../repositories'
import { obtenerHerramientaVistaPorRuta, type HerramientaVista } from '../../repositories/toolsView'
import { NIVELES_VALIDADOR } from '../types'
import { useNoIndex } from '../../labs/useNoIndex'
import FeedbackModal from './FeedbackModal'

export default function RequireValidatorAuth({ children }: { children: ReactNode }) {
  useNoIndex()
  const { validador, estaAutenticado, cargando } = useValidatorSession()
  const location = useLocation()
  const [feedbackAbierto, setFeedbackAbierto] = useState(false)
  const [herramientaActual, setHerramientaActual] = useState<HerramientaVista | null>(null)
  const [estadoAcceso, setEstadoAcceso] = useState<'revisando' | 'permitido' | 'sin_asignacion' | 'nivel_insuficiente' | 'error'>('revisando')
  const inicioRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!validador) {
      setHerramientaActual(null)
      setEstadoAcceso('revisando')
      return
    }

    let activo = true
    setEstadoAcceso('revisando')
    Promise.all([
      obtenerHerramientaVistaPorRuta(location.pathname),
      assignmentsRepository.listarPorValidador(validador.id),
    ]).then(([herramienta, asignaciones]) => {
      if (!activo) return
      setHerramientaActual(herramienta)
      if (!herramienta) {
        setEstadoAcceso('permitido')
        return
      }

      if (!asignaciones.some((asignacion) => asignacion.herramientaId === herramienta.id)) {
        setEstadoAcceso('sin_asignacion')
        return
      }

      const nivelRequerido = herramienta.estadoOperativo.nivelMinimoRequerido ?? herramienta.nivelMinimoAccesoDefault
      const ordenActual = NIVELES_VALIDADOR.find((nivel) => nivel.value === validador.nivel)?.orden ?? 0
      const ordenRequerido = NIVELES_VALIDADOR.find((nivel) => nivel.value === nivelRequerido)?.orden ?? Number.POSITIVE_INFINITY
      setEstadoAcceso(ordenActual >= ordenRequerido ? 'permitido' : 'nivel_insuficiente')
    }).catch(() => {
      if (activo) setEstadoAcceso('error')
    })

    return () => {
      activo = false
    }
  }, [location.pathname, validador])

  useEffect(() => {
    if (!validador) return
    inicioRef.current = Date.now()
    let herramientaIdParaCierre: string | null = null

    obtenerHerramientaVistaPorRuta(location.pathname).then((h) => {
      herramientaIdParaCierre = h?.id ?? null
      activityRepository.registrar({
        validadorId: validador.id,
        tipo: 'herramienta_abierta',
        herramientaId: herramientaIdParaCierre,
        duracionAproxSegundos: null,
      })
    })

    return () => {
      const duracion = Math.round((Date.now() - (inicioRef.current ?? Date.now())) / 1000)
      activityRepository.registrar({
        validadorId: validador.id,
        tipo: 'herramienta_abierta',
        herramientaId: herramientaIdParaCierre,
        duracionAproxSegundos: duracion,
      })
    }
    // Se vuelve a ejecutar cada vez que cambia la ruta dentro de Labs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, validador?.id])

  if (cargando || (validador && estadoAcceso === 'revisando')) return null

  if (!estaAutenticado || !validador) {
    return <Navigate to="/labs/login" replace state={{ desde: location.pathname }} />
  }

  if (estadoAcceso !== 'permitido') {
    const mensaje = estadoAcceso === 'sin_asignacion'
      ? 'Esta herramienta todavía no está asignada a tu cuenta de validador.'
      : estadoAcceso === 'nivel_insuficiente'
        ? 'Tu nivel actual de validación no cubre esta herramienta.'
        : 'No fue posible comprobar tu acceso a esta herramienta.'
    return (
      <div className="rounded-lg border border-amber-300 bg-warning-light p-5 text-sm text-warning">
        <p className="font-semibold">Acceso de validación no disponible</p>
        <p className="mt-1">{mensaje}</p>
        <Link to="/labs" className="mt-3 inline-block font-semibold underline">
          Volver a mis herramientas asignadas
        </Link>
      </div>
    )
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
          herramientaNombre={herramientaActual.nombreVisible}
          validadorId={validador.id}
        />
      )}
    </div>
  )
}
