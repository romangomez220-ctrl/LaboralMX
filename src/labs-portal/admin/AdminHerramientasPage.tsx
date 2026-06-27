import { useEffect, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import EstadoBadge from '../components/EstadoBadge'
import { assignmentsRepository, toolsRepository, validatorsRepository } from '../../repositories'
import { listarHerramientasVista, type HerramientaVista } from '../../repositories/toolsView'
import type { EstadoHerramienta } from '../types'

const ESTADOS: { value: EstadoHerramienta; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_validacion', label: 'En validación' },
  { value: 'lista_para_publico', label: 'Lista para público' },
  { value: 'publicada', label: 'Publicada' },
]

export default function AdminHerramientasPage() {
  const [herramientas, setHerramientas] = useState<HerramientaVista[]>([])
  const [conteoAsignados, setConteoAsignados] = useState<Record<string, number>>({})
  const [totalValidadores, setTotalValidadores] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [guardandoId, setGuardandoId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function cargar() {
    try {
      const [h, v] = await Promise.all([listarHerramientasVista(), validatorsRepository.listar()])
      const conteos: Record<string, number> = {}
      await Promise.all(
        h.map(async (tool) => {
          conteos[tool.id] = (await assignmentsRepository.listarPorHerramienta(tool.id)).length
        }),
      )
      setHerramientas(h)
      setConteoAsignados(conteos)
      setTotalValidadores(v.length)
    } catch (err) {
      console.error(err)
      setError('No se pudo cargar el estado de herramientas. Revisa la conexión o los permisos de Supabase.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function cambiarEstado(h: HerramientaVista, estado: EstadoHerramienta) {
    setError('')
    setGuardandoId(h.id)
    try {
      await toolsRepository.guardarEstado({ ...h.estadoOperativo, estado })
      await cargar()
    } catch (err) {
      console.error(err)
      setError(`No se pudo guardar el estado de ${h.nombreVisible}. Intenta de nuevo o revisa permisos de Supabase.`)
    } finally {
      setGuardandoId(null)
    }
  }

  async function toggleVisibilidad(h: HerramientaVista, campo: 'visiblePublicamente' | 'disponibleSoloLabs') {
    const siguienteValor = !h.estadoOperativo[campo]
    const siguiente = { ...h.estadoOperativo, [campo]: siguienteValor }

    if (campo === 'visiblePublicamente' && siguienteValor) {
      siguiente.disponibleSoloLabs = false
      if (siguiente.estado === 'pendiente' || siguiente.estado === 'en_validacion') {
        siguiente.estado = 'lista_para_publico'
      }
    }

    if (campo === 'disponibleSoloLabs' && siguienteValor) {
      siguiente.visiblePublicamente = false
    }

    setError('')
    setGuardandoId(h.id)
    try {
      await toolsRepository.guardarEstado(siguiente)
      await cargar()
    } catch (err) {
      console.error(err)
      setError(`No se pudo guardar la visibilidad de ${h.nombreVisible}. Intenta de nuevo o revisa permisos de Supabase.`)
    } finally {
      setGuardandoId(null)
    }
  }

  if (cargando) {
    return (
      <AdminLayout>
        <p className="text-sm text-stone">Cargando…</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-primary">Herramientas</h1>
      <p className="text-xs text-stone">
        La estructura de cada herramienta (nombre, suite, ruta, versión) viene del Registro
        Central (<code>src/catalog/registry.ts</code>) y solo cambia desplegando código nuevo. Lo
        que se edita aquí es su estado operativo.
      </p>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {herramientas.map((h) => (
          <div key={h.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  to={h.ruta}
                  className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 hover:text-primary-light hover:decoration-primary-light transition"
                >
                  {h.nombreVisible}
                </Link>
                <p className="text-sm text-stone">{h.descripcion}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Suite: {h.suiteId} · Versión: {h.versionSoftware} · Categoría: {h.categoria} · Ruta: <code>{h.ruta}</code>
                </p>
                <p className="text-xs text-gray-500">
                  Perfil recomendado: {h.perfilRecomendado} · Nivel mínimo: {h.estadoOperativo.nivelMinimoRequerido ?? h.nivelMinimoAccesoDefault}
                </p>
              </div>
              <EstadoBadge estado={h.estadoOperativo.estado} />
            </div>

            <div className="flex flex-wrap gap-3 mt-3 items-center">
              <select
                value={h.estadoOperativo.estado}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => cambiarEstado(h, e.target.value as EstadoHerramienta)}
                disabled={guardandoId === h.id}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-xs"
              >
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={h.estadoOperativo.visiblePublicamente}
                  onChange={() => toggleVisibilidad(h, 'visiblePublicamente')}
                  disabled={guardandoId === h.id}
                />
                Visible públicamente
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={h.estadoOperativo.disponibleSoloLabs}
                  onChange={() => toggleVisibilidad(h, 'disponibleSoloLabs')}
                  disabled={guardandoId === h.id}
                />
                Solo en Labs
              </label>
              {guardandoId === h.id && <span className="text-xs text-stone">Guardando…</span>}
              <span className="text-xs text-stone">
                {conteoAsignados[h.id] ?? 0} validador{(conteoAsignados[h.id] ?? 0) === 1 ? '' : 'es'} asignado{(conteoAsignados[h.id] ?? 0) === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        ))}
        {herramientas.length === 0 && <p className="text-sm text-stone">Sin herramientas registradas todavía.</p>}
      </div>

      <p className="text-xs text-stone">
        Total de validadores en el sistema: {totalValidadores}. La asignación de herramientas por
        validador se gestiona desde la sección Validadores.
      </p>
    </AdminLayout>
  )
}
