import { Link } from 'react-router-dom'
import { useValidatorSession } from '../auth/useValidatorSession'
import {
  actualizarEstadoAsignacion,
  listarAsignacionesPorValidador,
  listarActividadPorValidador,
  listarFeedback,
  obtenerHerramientaPorId,
} from '../storage/localStore'
import { NIVELES_VALIDADOR } from '../types'
import EstadoBadge from '../components/EstadoBadge'

function formatFecha(iso: string | null): string {
  if (!iso) return 'Nunca'
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function ValidadorPortalPage() {
  const { validador, cerrarSesion } = useValidatorSession()
  if (!validador) return null

  const asignaciones = listarAsignacionesPorValidador(validador.id)
  const feedbackPropio = listarFeedback().filter((f) => f.validadorId === validador.id)
  const actividad = listarActividadPorValidador(validador.id).slice(0, 8)
  const nivelInfo = NIVELES_VALIDADOR.find((n) => n.value === validador.nivel)

  function avanzarEstado(asignacionId: string, estadoActual: string) {
    const siguiente = estadoActual === 'pendiente' ? 'en_revision' : estadoActual === 'en_revision' ? 'completada' : 'pendiente'
    actualizarEstadoAsignacion(asignacionId, siguiente as 'pendiente' | 'en_revision' | 'completada')
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest">Bienvenido a</p>
          <h1 className="text-3xl font-semibold text-primary">ROMANUS Labs</h1>
        </div>
        <button
          onClick={cerrarSesion}
          className="text-sm text-stone underline hover:text-primary transition"
        >
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
            {asignaciones.map((a) => {
              const herramienta = obtenerHerramientaPorId(a.herramientaId)
              if (!herramienta) return null
              return (
                <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">{herramienta.nombre}</p>
                    <p className="text-sm text-stone">{herramienta.descripcion}</p>
                    <Link to={herramienta.ruta} className="text-sm text-primary underline mt-1 inline-block">
                      Abrir herramienta →
                    </Link>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <EstadoBadge estado={a.estado} />
                    <button
                      onClick={() => avanzarEstado(a.id, a.estado)}
                      className="text-xs text-stone underline hover:text-primary"
                    >
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
            {feedbackPropio.map((f) => {
              const herramienta = obtenerHerramientaPorId(f.herramientaId)
              return (
                <div key={f.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-700">{herramienta?.nombre ?? f.herramientaId}</p>
                    <EstadoBadge estado={f.estado} />
                  </div>
                  <p className="text-gray-600 mt-1">{f.comentario}</p>
                  <p className="text-xs text-stone mt-1">{formatFecha(f.fecha)} · Calificación: {f.calificacion}/5</p>
                </div>
              )
            })}
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
