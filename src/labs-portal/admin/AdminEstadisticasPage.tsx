import AdminLayout from './AdminLayout'
import { listarAsignacionesPorHerramienta, listarFeedback, listarHerramientas, listarValidadores } from '../storage/localStore'

function BarraMetrica({ etiqueta, valor, max }: { etiqueta: string; valor: number; max: number }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm text-gray-700 mb-1">
        <span>{etiqueta}</span>
        <span className="font-semibold">{valor}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AdminEstadisticasPage() {
  const validadores = listarValidadores()
  const herramientas = listarHerramientas()
  const feedback = listarFeedback()

  const feedbackPorHerramienta = herramientas
    .map((h) => ({ nombre: h.nombre, cantidad: feedback.filter((f) => f.herramientaId === h.id).length }))
    .sort((a, b) => b.cantidad - a.cantidad)

  const erroresPorHerramienta = herramientas
    .map((h) => ({ nombre: h.nombre, cantidad: feedback.filter((f) => f.herramientaId === h.id && f.tipo === 'error').length }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .filter((h) => h.cantidad > 0)

  const listasParaPublico = herramientas.filter((h) => h.estado === 'lista_para_publico' || h.estado === 'publicada')

  const especialidadesConteo: Record<string, number> = {}
  validadores.forEach((v) => {
    const key = v.especialidad || 'Sin especialidad'
    especialidadesConteo[key] = (especialidadesConteo[key] ?? 0) + 1
  })
  const especialidades = Object.entries(especialidadesConteo).sort((a, b) => b[1] - a[1])

  const maxFeedback = Math.max(1, ...feedbackPorHerramienta.map((f) => f.cantidad))
  const maxEspecialidad = Math.max(1, ...especialidades.map(([, c]) => c))

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-primary">Estadísticas</h1>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-stone uppercase">Validadores</p>
          <p className="text-2xl font-bold text-primary">{validadores.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-stone uppercase">Feedback enviado</p>
          <p className="text-2xl font-bold text-primary">{feedback.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-stone uppercase">Herramientas listas para público</p>
          <p className="text-2xl font-bold text-primary">{listasParaPublico.length}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="font-semibold text-gray-800 mb-3">Herramientas más revisadas (por feedback)</p>
        <div className="flex flex-col gap-3">
          {feedbackPorHerramienta.map((f) => (
            <BarraMetrica key={f.nombre} etiqueta={f.nombre} valor={f.cantidad} max={maxFeedback} />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="font-semibold text-gray-800 mb-3">Herramientas con más errores reportados</p>
        {erroresPorHerramienta.length === 0 ? (
          <p className="text-sm text-stone">Sin errores reportados todavía.</p>
        ) : (
          <ul className="text-sm text-gray-700 flex flex-col gap-1">
            {erroresPorHerramienta.map((e) => (
              <li key={e.nombre} className="flex justify-between">
                <span>{e.nombre}</span>
                <span className="font-semibold text-red-600">{e.cantidad}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="font-semibold text-gray-800 mb-3">Especialidades con mayor participación</p>
        <div className="flex flex-col gap-3">
          {especialidades.map(([nombre, cantidad]) => (
            <BarraMetrica key={nombre} etiqueta={nombre} valor={cantidad} max={maxEspecialidad} />
          ))}
          {especialidades.length === 0 && <p className="text-sm text-stone">Sin validadores todavía.</p>}
        </div>
      </div>
    </AdminLayout>
  )
}
