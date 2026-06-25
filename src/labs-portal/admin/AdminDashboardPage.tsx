import AdminLayout from './AdminLayout'
import {
  listarActividad,
  listarAsignaciones,
  listarFeedback,
  listarHerramientas,
  listarValidadores,
  obtenerHerramientaPorId,
  obtenerValidadorPorId,
} from '../storage/localStore'

function Tarjeta({ titulo, valor }: { titulo: string; valor: number | string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs text-stone uppercase tracking-wide">{titulo}</p>
      <p className="text-2xl font-bold text-primary mt-1">{valor}</p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const validadores = listarValidadores()
  const herramientas = listarHerramientas()
  const asignaciones = listarAsignaciones()
  const feedback = listarFeedback()
  const actividad = listarActividad().slice().reverse().slice(0, 10)

  const validadoresActivos = validadores.filter((v) => v.estado === 'activo').length
  const herramientasActivas = herramientas.filter((h) => h.estado === 'en_validacion').length
  const herramientasPendientes = herramientas.filter((h) => h.estado === 'pendiente').length
  const erroresReportados = feedback.filter((f) => f.tipo === 'error').length
  const ideasPropuestas = feedback.filter((f) => f.tipo === 'idea').length

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-primary">Resumen</h1>

      <div className="grid sm:grid-cols-4 gap-3">
        <Tarjeta titulo="Validadores activos" valor={validadoresActivos} />
        <Tarjeta titulo="Herramientas en validación" valor={herramientasActivas} />
        <Tarjeta titulo="Herramientas pendientes" valor={herramientasPendientes} />
        <Tarjeta titulo="Asignaciones totales" valor={asignaciones.length} />
        <Tarjeta titulo="Feedback recibido" valor={feedback.length} />
        <Tarjeta titulo="Errores reportados" valor={erroresReportados} />
        <Tarjeta titulo="Ideas propuestas" valor={ideasPropuestas} />
        <Tarjeta titulo="Validadores totales" valor={validadores.length} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-primary mb-3">Actividad reciente</h2>
        {actividad.length === 0 ? (
          <p className="text-sm text-stone">Sin actividad registrada todavía.</p>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
            {actividad.map((a) => {
              const validador = obtenerValidadorPorId(a.validadorId)
              const herramienta = a.herramientaId ? obtenerHerramientaPorId(a.herramientaId) : null
              return (
                <div key={a.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-700">
                    <strong>{validador?.nombre ?? 'Validador desconocido'}</strong> — {a.tipo.replace('_', ' ')}
                    {herramienta ? ` · ${herramienta.nombre}` : ''}
                  </span>
                  <span className="text-xs text-stone">{new Date(a.fecha).toLocaleString('es-MX')}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
