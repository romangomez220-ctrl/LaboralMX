import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { activityRepository, assignmentsRepository, feedbackRepository, validatorsRepository } from '../../repositories'
import { listarHerramientasVista, type HerramientaVista } from '../../repositories/toolsView'
import type { RegistroActividad, Validador, Feedback, Asignacion } from '../types'

function Tarjeta({ titulo, valor }: { titulo: string; valor: number | string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs text-stone uppercase tracking-wide">{titulo}</p>
      <p className="text-2xl font-bold text-primary mt-1">{valor}</p>
    </div>
  )
}

interface ActividadConNombres extends RegistroActividad {
  nombreValidador: string
  nombreHerramienta: string | null
}

export default function AdminDashboardPage() {
  const [validadores, setValidadores] = useState<Validador[]>([])
  const [herramientas, setHerramientas] = useState<HerramientaVista[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [actividad, setActividad] = useState<ActividadConNombres[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const [v, h, a, f, act] = await Promise.all([
        validatorsRepository.listar(),
        listarHerramientasVista(),
        assignmentsRepository.listar(),
        feedbackRepository.listar(),
        activityRepository.listar(),
      ])
      const actividadConNombres = act
        .slice()
        .reverse()
        .slice(0, 10)
        .map((reg) => ({
          ...reg,
          nombreValidador: v.find((val) => val.id === reg.validadorId)?.nombre ?? 'Validador desconocido',
          nombreHerramienta: reg.herramientaId ? h.find((tool) => tool.id === reg.herramientaId)?.nombreVisible ?? null : null,
        }))
      setValidadores(v)
      setHerramientas(h)
      setAsignaciones(a)
      setFeedback(f)
      setActividad(actividadConNombres)
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) {
    return (
      <AdminLayout>
        <p className="text-sm text-stone">Cargando…</p>
      </AdminLayout>
    )
  }

  const validadoresActivos = validadores.filter((v) => v.estado === 'activo').length
  const herramientasActivas = herramientas.filter((h) => h.estadoOperativo.estado === 'en_validacion').length
  const herramientasPendientes = herramientas.filter((h) => h.estadoOperativo.estado === 'pendiente').length
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
            {actividad.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-700">
                  <strong>{a.nombreValidador}</strong> — {a.tipo.replace('_', ' ')}
                  {a.nombreHerramienta ? ` · ${a.nombreHerramienta}` : ''}
                </span>
                <span className="text-xs text-stone">{new Date(a.fecha).toLocaleString('es-MX')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
