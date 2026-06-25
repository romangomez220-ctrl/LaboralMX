import { useState, type ChangeEvent } from 'react'
import AdminLayout from './AdminLayout'
import EstadoBadge from '../components/EstadoBadge'
import {
  crearAsignacion,
  crearValidador,
  eliminarAsignacion,
  eliminarValidador,
  guardarValidador,
  listarAsignacionesPorValidador,
  listarFeedback,
  listarHerramientas,
  listarValidadores,
} from '../storage/localStore'
import { NIVELES_VALIDADOR, type NivelValidador, type Validador } from '../types'

interface NuevoValidadorForm {
  usuario: string
  passwordTemporal: string
  nombre: string
  profesion: string
  especialidad: string
  nivel: NivelValidador
}

const FORM_VACIO: NuevoValidadorForm = {
  usuario: '',
  passwordTemporal: '',
  nombre: '',
  profesion: '',
  especialidad: '',
  nivel: 'validador_beta',
}

export default function AdminValidadoresPage() {
  const [, forceUpdate] = useState(0)
  const refrescar = () => forceUpdate((n) => n + 1)

  const [form, setForm] = useState<NuevoValidadorForm>(FORM_VACIO)
  const [seleccionado, setSeleccionado] = useState<string | null>(null)

  const validadores = listarValidadores()
  const herramientas = listarHerramientas()
  const feedback = listarFeedback()

  function crear() {
    if (!form.usuario.trim() || !form.passwordTemporal.trim() || !form.nombre.trim()) return
    crearValidador({
      usuario: form.usuario.trim(),
      passwordTemporal: form.passwordTemporal.trim(),
      nombre: form.nombre.trim(),
      profesion: form.profesion.trim(),
      especialidad: form.especialidad.trim(),
      nivel: form.nivel,
      estado: 'activo',
      calificacionInterna: null,
      notasAdmin: '',
    })
    setForm(FORM_VACIO)
    refrescar()
  }

  function toggleEstado(v: Validador) {
    guardarValidador({ ...v, estado: v.estado === 'activo' ? 'inactivo' : 'activo' })
    refrescar()
  }

  function eliminar(id: string) {
    eliminarValidador(id)
    if (seleccionado === id) setSeleccionado(null)
    refrescar()
  }

  function cambiarNivel(v: Validador, nivel: NivelValidador) {
    guardarValidador({ ...v, nivel })
    refrescar()
  }

  function cambiarCalificacion(v: Validador, calificacion: number) {
    guardarValidador({ ...v, calificacionInterna: calificacion })
    refrescar()
  }

  function cambiarNotas(v: Validador, notasAdmin: string) {
    guardarValidador({ ...v, notasAdmin })
    refrescar()
  }

  function toggleAsignacion(validadorId: string, herramientaId: string) {
    const existentes = listarAsignacionesPorValidador(validadorId)
    const existente = existentes.find((a) => a.herramientaId === herramientaId)
    if (existente) {
      eliminarAsignacion(existente.id)
    } else {
      crearAsignacion(validadorId, herramientaId)
    }
    refrescar()
  }

  const validadorDetalle = validadores.find((v) => v.id === seleccionado) ?? null

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-primary">Validadores</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Crear nuevo validador</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            placeholder="Usuario"
            value={form.usuario}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, usuario: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Contraseña temporal"
            value={form.passwordTemporal}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, passwordTemporal: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, nombre: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Profesión"
            value={form.profesion}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, profesion: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Especialidad"
            value={form.especialidad}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, especialidad: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={form.nivel}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setForm({ ...form, nivel: e.target.value as NivelValidador })}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {NIVELES_VALIDADOR.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={crear}
          className="mt-3 rounded-md bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary-light transition"
        >
          Crear validador
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 text-primary">Nombre</th>
              <th className="p-3 text-primary">Especialidad</th>
              <th className="p-3 text-primary">Nivel</th>
              <th className="p-3 text-primary">Estado</th>
              <th className="p-3 text-primary">Último acceso</th>
              <th className="p-3 text-primary">Feedback</th>
              <th className="p-3 text-primary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {validadores.map((v) => (
              <tr key={v.id} className="border-t border-gray-100">
                <td className="p-3">
                  <button onClick={() => setSeleccionado(v.id)} className="font-medium text-primary underline">
                    {v.nombre}
                  </button>
                  <p className="text-xs text-stone">{v.profesion}</p>
                </td>
                <td className="p-3 text-gray-600">{v.especialidad}</td>
                <td className="p-3 text-gray-600">{NIVELES_VALIDADOR.find((n) => n.value === v.nivel)?.label}</td>
                <td className="p-3">
                  <EstadoBadge estado={v.estado} />
                </td>
                <td className="p-3 text-xs text-stone">
                  {v.ultimoAcceso ? new Date(v.ultimoAcceso).toLocaleDateString('es-MX') : 'Nunca'}
                </td>
                <td className="p-3 text-gray-600">{feedback.filter((f) => f.validadorId === v.id).length}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleEstado(v)} className="text-xs text-amber-700 underline">
                      {v.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => eliminar(v.id)} className="text-xs text-red-600 underline">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {validadores.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-stone text-sm">
                  Sin validadores todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {validadorDetalle && (
        <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-primary">Detalle: {validadorDetalle.nombre}</p>
            <button onClick={() => setSeleccionado(null)} className="text-xs text-stone underline">
              Cerrar
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone uppercase">Nivel</label>
              <select
                value={validadorDetalle.nivel}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => cambiarNivel(validadorDetalle, e.target.value as NivelValidador)}
                className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {NIVELES_VALIDADOR.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone uppercase">Calificación interna (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={validadorDetalle.calificacionInterna ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => cambiarCalificacion(validadorDetalle, Number(e.target.value))}
                className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-stone uppercase">Notas administrativas</label>
            <textarea
              value={validadorDetalle.notasAdmin}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => cambiarNotas(validadorDetalle, e.target.value)}
              rows={2}
              className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-stone uppercase mb-2">Herramientas asignadas</p>
            <div className="flex flex-col gap-1">
              {herramientas.map((h) => {
                const asignada = listarAsignacionesPorValidador(validadorDetalle.id).some((a) => a.herramientaId === h.id)
                return (
                  <label key={h.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={asignada}
                      onChange={() => toggleAsignacion(validadorDetalle.id, h.id)}
                    />
                    {h.nombre}
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
