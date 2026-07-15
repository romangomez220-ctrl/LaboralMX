import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import TerminosProcesalesPage from '../labs/juridico-suite/pages/TerminosProcesalesPage'
import FamiliarUrgentePage from '../labs/juridico-suite/pages/FamiliarUrgentePage'
import {
  esHerramientaVisiblePublicamente,
  obtenerHerramientaVistaPorClave,
  type HerramientaVista,
} from '../repositories/toolsView'
import { trackToolOpen } from '../utils/analytics'

const COMPONENTES_PUBLICOS: Record<string, ComponentType<{ publicMode?: boolean }>> = {
  'terminos-procesales': TerminosProcesalesPage,
  'familiar-urgente': FamiliarUrgentePage,
}

export default function HerramientaPublicaPage() {
  const { clave } = useParams()
  const [herramienta, setHerramienta] = useState<HerramientaVista | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!clave) {
      setCargando(false)
      return
    }
    obtenerHerramientaVistaPorClave(clave)
      .then(setHerramienta)
      .catch((err) => {
        console.error(err)
        setError('No pudimos verificar la publicación de esta herramienta en este momento.')
      })
      .finally(() => setCargando(false))
  }, [clave])

  useEffect(() => {
    if (herramienta && esHerramientaVisiblePublicamente(herramienta)) {
      trackToolOpen(herramienta.id, herramienta.nombreVisible, 'direct_public_route')
    }
  }, [herramienta])

  if (cargando) return <p className="text-sm text-stone">Cargando herramienta…</p>
  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <p className="font-semibold text-primary">Herramienta temporalmente no disponible</p>
        <p className="text-sm text-stone mt-1">{error}</p>
        <Link to="/herramientas" className="text-sm text-primary underline mt-4 inline-block">
          Volver a herramientas
        </Link>
      </div>
    )
  }

  if (!herramienta || !esHerramientaVisiblePublicamente(herramienta)) {
    return <Navigate to="/herramientas" replace />
  }

  const Componente = COMPONENTES_PUBLICOS[herramienta.clave]

  if (Componente) {
    return <Componente publicMode />
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest">
        Herramienta publicada
      </p>
      <div>
        <h1 className="text-3xl font-semibold text-primary">{herramienta.nombreVisible}</h1>
        <p className="text-sm text-stone mt-2 max-w-2xl">{herramienta.descripcion}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <p className="font-semibold text-primary">Vista pública en preparación</p>
        <p className="text-sm text-gray-600 mt-1">
          Esta herramienta ya fue marcada como pública, pero todavía no tiene una interfaz pública
          dedicada. Sigue disponible para validación interna en ROMANUS Labs.
        </p>
        <Link to="/herramientas" className="text-sm text-primary underline mt-4 inline-block">
          Volver a herramientas
        </Link>
      </div>
    </div>
  )
}
