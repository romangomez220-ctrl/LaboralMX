import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listarHerramientasPublicasVista,
  obtenerRutaPublicaHerramienta,
  type HerramientaVista,
} from '../repositories/toolsView'
import { trackToolOpen } from '../utils/analytics'

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
      .then((lista) => {
        setHerramientas(
          [...lista].sort((a, b) => {
            if (a.requiereValidador !== b.requiereValidador) return a.requiereValidador ? 1 : -1
            return a.nombreVisible.localeCompare(b.nombreVisible)
          }),
        )
      })
      .catch((err) => {
        console.error(err)
        setError('No pudimos cargar el catálogo público en este momento. Intenta nuevamente en unos minutos.')
      })
      .finally(() => setCargando(false))
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <section className="max-w-3xl pt-4">
          <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
            Biblioteca pública
          </p>
          <h1 className="text-3xl font-semibold text-primary">Herramientas ROMANUS</h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            Elige una herramienta y obtén un resultado claro. No necesitas crear una cuenta.
          </p>
      </section>

      {cargando ? (
        <div className="grid gap-4 sm:grid-cols-2" role="status" aria-label="Cargando herramientas">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>
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
              className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gold hover:shadow-sm"
              onClick={() => trackToolOpen(h.id, h.nombreVisible, '/herramientas')}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest">
                  {nombreSuite(h.suiteId)}
                </p>
                {h.requiereValidador && (
                  <span className="rounded-full bg-ivory px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-stone">
                    Validada
                  </span>
                )}
              </div>
              <p className="font-serif text-xl font-semibold text-primary mb-1">{h.nombreVisible}</p>
              <p className="text-sm leading-relaxed text-gray-600">{h.descripcion}</p>
              <p className="mt-5 text-sm font-semibold text-primary">Abrir →</p>
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
