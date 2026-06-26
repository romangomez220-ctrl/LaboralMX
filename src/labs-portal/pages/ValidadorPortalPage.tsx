import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useValidatorSession } from '../auth/useValidatorSession'
import { activityRepository, assignmentsRepository, feedbackRepository } from '../../repositories'
import { obtenerHerramientaVista, type HerramientaVista } from '../../repositories/toolsView'
import { NIVELES_VALIDADOR, type Asignacion, type Feedback, type RegistroActividad } from '../types'
import EstadoBadge from '../components/EstadoBadge'

function formatFecha(iso: string | null): string {
  if (!iso) return 'Nunca'
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}

interface AsignacionConHerramienta {
  asignacion: Asignacion
  herramienta: HerramientaVista | null
}

interface FeedbackConHerramienta {
  feedback: Feedback
  herramienta: HerramientaVista | null
}

export default function ValidadorPortalPage() {
  const { validador, cerrarSesion } = useValidatorSession()
  const [asignaciones, setAsignaciones] = useState<AsignacionConHerramienta[]>([])
  const [feedbackPropio, setFeedbackPropio] = useState<FeedbackConHerramienta[]>([])
  const [actividad, setActividad] = useState<RegistroActividad[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!validador) return
    let activo = true

    async function cargar() {
      const [listaAsignaciones, listaFeedback, listaActividad] = await Promise.all([
        assignmentsRepository.listarPorValidador(validador!.id),
        feedbackRepository.listar(),
        activityRepository.listarPorValidador(validador!.id),
      ])

      const feedbackDelValidador = listaFeedback.filter((f) => f.validadorId === validador!.id)

      const asignacionesConHerramienta = await Promise.all(
        listaAsignaciones.map(async (a) => ({ asignacion: a, herramienta: await obtenerHerramientaVista(a.herramientaId) })),
      )
      const feedbackConHerramienta = await Promise.all(
        feedbackDelValidador.map(async (f) => ({ feedback: f, herramienta: await obtenerHerramientaVista(f.herramientaId) })),
      )

      if (!activo) return
      setAsignaciones(asignacionesConHerramienta)
      setFeedbackPropio(feedbackConHerramienta)
      setActividad(listaActividad.slice(0, 8))
      setCargando(false)
    }

    cargar()
    return () => {
      activo = false
    }
  }, [validador])

  if (!validador) return null
  if (cargando) return <p className="text-sm text-stone">Cargando tu portal…</p>

  const nivelInfo = NIVELES_VALIDADOR.find((n) => n.value === validador.nivel)

  async function avanzarEstado(asignacionId: string, estadoActual: string) {
    const siguiente = estadoActual === 'pendiente' ? 'en_revision' : estadoActual === 'en_revision' ? 'completada' : 'pendiente'
    await assignmentsRepository.actualizarEstado(asignacionId, siguiente as 'pendiente' | 'en_revision' | 'completada')
    setAsignaciones((prev) =>
      prev.map((item) =>
        item.asignacion.id === asignacionId
          ? { ...item, asignacion: { ...item.asignacion, estado: siguiente as 'pendiente' | 'en_revision' | 'completada' } }
          : item,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest">Bienvenido a</p>
          <h1 className="text-3xl font-semibold text-primary">ROMANUS Labs</h1>
        </div>
        <button onClick={cerrarSesion} className="text-sm text-stone underline hover:text-primary transition">
          Cerrar sesión
        </button>
      </div>

      {/* Perfil */}
      <div className="grid sm:grid-cols-4 gap-3">
        {[
          { label: 'Nombre', valor: validador.nombre },
          { label: 'Perfil profesional', valor: validador.profesion },
          { label: 'Especialidad', valor: validador.especialidad },
          { label: 'Nivel', valor: nivelInfo?.label ?? validador.nivel },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-stone uppercase tracking-wide">{item.label}</p>
            <p className="font-semibold text-gray-800 mt-1">{item.valor}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-stone">Último acceso: {formatFecha(validador.ultimoAcceso)}</p>

      {/* Herramientas asignadas */}
      <div>
        <h2 className="text-lg font-bold text-primary mb-3">Herramientas asignadas</h2>
        {asignaciones.length === 0 ? (
          <p className="text-sm text-stone">Todavía no tienes herramientas asignadas. El administrador te asignará pronto.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {asignaciones.map(({ asignacion: a, herramienta }) => {
              if (!herramienta) return null
              return (
                <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">{herramienta.nombreVisible}</p>
                    <p className="text-sm text-stone">{herramienta.descripcion}</p>
                    <Link to={herramienta.ruta} className="text-sm text-primary underline mt-1 inline-block">
                      Abrir herramienta →
                    </Link>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <EstadoBadge estado={a.estado} />
                    <button onClick={() => avanzarEstado(a.id, a.estado)} className="text-xs text-stone underline hover:text-primary">
                      Cambiar estado
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Feedback enviado */}
      <div>
        <h2 className="text-lg font-bold text-primary mb-3">Comentarios enviados ({feedbackPropio.length})</h2>
        {feedbackPropio.length === 0 ? (
          <p className="text-sm text-stone">Todavía no has enviado feedback.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {feedbackPropio.map(({ feedback: f, herramienta }) => (
              <div key={f.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-700">{herramienta?.nombreVisible ?? f.herramientaId}</p>
                  <EstadoBadge estado={f.estado} />
                </div>
                <p className="text-gray-600 mt-1">{f.comentario}</p>
                <p className="text-xs text-stone mt-1">{formatFecha(f.fecha)} · Calificación: {f.calificacion}/5</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de actividad */}
      <div>
        <h2 className="text-lg font-bold text-primary mb-3">Historial reciente</h2>
        {actividad.length === 0 ? (
          <p className="text-sm text-stone">Sin actividad registrada todavía.</p>
        ) : (
          <ul className="text-sm text-gray-600 flex flex-col gap-1">
            {actividad.map((a) => (
              <li key={a.id} className="flex justify-between border-b border-gray-100 py-1.5">
                <span>{a.tipo.replace('_', ' ')}</span>
                <span className="text-stone">{formatFecha(a.fecha)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
