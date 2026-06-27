import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listarHerramientasPublicasVista,
  obtenerRutaPublicaHerramienta,
  type HerramientaVista,
} from '../repositories/toolsView'

function nombreSuite(suiteId: string) {
  if (suiteId === 'suite_laboral') return 'Laboral Suite'
  if (suiteId === 'suite_contable') return 'Contable Suite'
  if (suiteId === 'suite_juridica') return 'Jurídico Suite'
  return 'ROMANUS'
}

export default function HerramientasPublicasPage() {
  const [herramientas, setHerramientas] = useState<HerramientaVista[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarHerramientasPublicasVista()
      .then(setHerramientas)
      .catch((err) => {
        console.error(err)
        setError('No pudimos cargar el catálogo público en este momento. Intenta nuevamente en unos minutos.')
      })
      .finally(() => setCargando(false))
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <section className="pt-4">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Biblioteca pública
        </p>
        <h1 className="text-3xl font-semibold text-primary">Herramientas ROMANUS</h1>
        <p className="text-sm text-stone mt-2 max-w-2xl">
          Calculadoras, asistentes y recursos jurídicos publicados después de pasar por el proceso
          de validación de ROMANUS Labs.
        </p>
      </section>

      {cargando ? (
        <p className="text-sm text-stone">Cargando herramientas…</p>
      ) : error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-primary">Catálogo temporalmente no disponible</p>
          <p className="text-sm text-stone mt-1">{error}</p>
          <Link to="/laboral-suite" className="text-sm text-primary underline mt-3 inline-block">
            Ver Laboral Suite
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {herramientas.map((h) => (
            <Link
              key={h.id}
              to={obtenerRutaPublicaHerramienta(h)}
              className="rounded-lg border border-gray-200 bg-white p-5 hover:border-gold transition"
            >
              <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
                {nombreSuite(h.suiteId)}
              </p>
              <p className="font-serif text-xl font-semibold text-primary mb-1">{h.nombreVisible}</p>
              <p className="text-sm text-gray-600">{h.descripcion}</p>
              <p className="text-xs text-stone mt-4">
                Categoría: {h.categoria} · Versión: {h.versionSoftware}
              </p>
            </Link>
          ))}
        </div>
      )}

      {!cargando && !error && herramientas.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="font-semibold text-primary">Aún no hay herramientas nuevas publicadas.</p>
          <p className="text-sm text-stone mt-1">
            Laboral Suite sigue disponible mientras las herramientas de Labs terminan su validación.
          </p>
          <Link to="/laboral-suite" className="text-sm text-primary underline mt-3 inline-block">
            Ver Laboral Suite
          </Link>
        </div>
      )}
    </div>
  )
}
