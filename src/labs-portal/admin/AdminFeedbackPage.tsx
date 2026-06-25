import { useMemo, useState, type ChangeEvent } from 'react'
import AdminLayout from './AdminLayout'
import EstadoBadge from '../components/EstadoBadge'
import { actualizarEstadoFeedback, listarFeedback, obtenerHerramientaPorId, obtenerValidadorPorId } from '../storage/localStore'
import type { EstadoFeedback, TipoFeedback } from '../types'

type FiltroEstado = 'todos' | EstadoFeedback
type FiltroTipo = 'todos' | TipoFeedback

export default function AdminFeedbackPage() {
  const [, forceUpdate] = useState(0)
  const refrescar = () => forceUpdate((n) => n + 1)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos')

  const todoElFeedback = listarFeedback()

  const filtrado = useMemo(() => {
    return todoElFeedback
      .filter((f) => filtroEstado === 'todos' || f.estado === filtroEstado)
      .filter((f) => filtroTipo === 'todos' || f.tipo === filtroTipo)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todoElFeedback, filtroEstado, filtroTipo])

  function cambiarEstado(id: string, estado: EstadoFeedback) {
    actualizarEstadoFeedback(id, estado)
    refrescar()
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-primary">Feedback</h1>

      <div className="flex gap-3">
        <select
          value={filtroEstado}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltroEstado(e.target.value as FiltroEstado)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_revision">En revisión</option>
          <option value="resuelto">Resuelto</option>
        </select>
        <select
          value={filtroTipo}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltroTipo(e.target.value as FiltroTipo)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="todos">Todos los tipos</option>
          <option value="error">Errores</option>
          <option value="idea">Ideas</option>
          <option value="comentario_general">Comentarios generales</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {filtrado.map((f) => {
          const herramienta = obtenerHerramientaPorId(f.herramientaId)
          const validador = obtenerValidadorPorId(f.validadorId)
          return (
            <div key={f.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{herramienta?.nombre ?? f.herramientaId}</p>
                  <p className="text-xs text-stone">
                    {validador?.nombre ?? 'Validador desconocido'} · {new Date(f.fecha).toLocaleString('es-MX')} ·
                    Calificación {f.calificacion}/5 · {f.tipo.replace('_', ' ')}
                  </p>
                </div>
                <EstadoBadge estado={f.estado} />
              </div>
              <p className="text-sm text-gray-700 mt-2">{f.comentario}</p>
              <div className="flex gap-2 mt-2">
                {(['pendiente', 'en_revision', 'resuelto'] as EstadoFeedback[]).map((e) => (
                  <button
                    key={e}
                    onClick={() => cambiarEstado(f.id, e)}
                    className={`text-xs rounded-md px-2 py-1 border ${
                      f.estado === e ? 'border-primary text-primary font-semibold' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {e.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        {filtrado.length === 0 && <p className="text-sm text-stone">Sin feedback que coincida con los filtros.</p>}
      </div>
    </AdminLayout>
  )
}
