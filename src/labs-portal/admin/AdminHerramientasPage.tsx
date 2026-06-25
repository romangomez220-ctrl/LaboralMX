import { useState, type ChangeEvent } from 'react'
import AdminLayout from './AdminLayout'
import EstadoBadge from '../components/EstadoBadge'
import { guardarHerramienta, listarAsignacionesPorHerramienta, listarHerramientas, listarValidadores } from '../storage/localStore'
import type { EstadoHerramienta } from '../types'

const ESTADOS: { value: EstadoHerramienta; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_validacion', label: 'En validación' },
  { value: 'lista_para_publico', label: 'Lista para público' },
  { value: 'publicada', label: 'Publicada' },
]

export default function AdminHerramientasPage() {
  const [, forceUpdate] = useState(0)
  const refrescar = () => forceUpdate((n) => n + 1)

  const herramientas = listarHerramientas()
  const validadores = listarValidadores()

  function cambiarEstado(id: string, estado: EstadoHerramienta) {
    const h = herramientas.find((x) => x.id === id)
    if (!h) return
    guardarHerramienta({ ...h, estado })
    refrescar()
  }

  function toggleVisibilidad(id: string, campo: 'visiblePublicamente' | 'disponibleSoloLabs') {
    const h = herramientas.find((x) => x.id === id)
    if (!h) return
    guardarHerramienta({ ...h, [campo]: !h[campo] })
    refrescar()
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-primary">Herramientas</h1>

      <div className="flex flex-col gap-3">
        {herramientas.map((h) => {
          const asignados = listarAsignacionesPorHerramienta(h.id)
          return (
            <div key={h.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{h.nombre}</p>
                  <p className="text-sm text-stone">{h.descripcion}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Suite: {h.suite} · Versión: {h.version} · Categoría: {h.categoria} · Ruta: <code>{h.ruta}</code>
                  </p>
                  <p className="text-xs text-gray-500">
                    Perfil recomendado: {h.perfilRecomendado} · Nivel mínimo: {h.nivelMinimoRequerido}
                  </p>
                </div>
                <EstadoBadge estado={h.estado} />
              </div>

              <div className="flex flex-wrap gap-3 mt-3 items-center">
                <select
                  value={h.estado}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => cambiarEstado(h.id, e.target.value as EstadoHerramienta)}
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
                    checked={h.visiblePublicamente}
                    onChange={() => toggleVisibilidad(h.id, 'visiblePublicamente')}
                  />
                  Visible públicamente
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={h.disponibleSoloLabs}
                    onChange={() => toggleVisibilidad(h.id, 'disponibleSoloLabs')}
                  />
                  Solo en Labs
                </label>
                <span className="text-xs text-stone">
                  {asignados.length} validador{asignados.length === 1 ? '' : 'es'} asignado{asignados.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          )
        })}
        {herramientas.length === 0 && <p className="text-sm text-stone">Sin herramientas registradas todavía.</p>}
      </div>

      <p className="text-xs text-stone">
        Total de validadores en el sistema: {validadores.length}. La asignación de herramientas por
        validador se gestiona desde la sección Validadores.
      </p>
    </AdminLayout>
  )
}
