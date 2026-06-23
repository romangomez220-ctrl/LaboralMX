import EcosystemCard from '../components/EcosystemCard'
import { useNoIndex } from '../labs/useNoIndex'

const PROXIMAMENTE = ['Herramientas fiscales', 'Herramientas jurídicas', 'Herramientas empresariales']

/**
 * Página de ROMANUS Labs. Ya NO es una sección pública (v4.3): se quitó
 * del menú principal y del catálogo de Productos porque Labs es un
 * laboratorio interno de experimentación, no un producto. Sigue
 * funcionando por URL directa, y por eso lleva noindex/nofollow — igual
 * que /labs/resico — para que no aparezca en buscadores.
 */
export default function LabsLandingPage() {
  useNoIndex()

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center pt-4">
        <h1 className="text-3xl font-semibold text-primary">ROMANUS Labs</h1>
        <p className="text-sm text-stone mt-2 max-w-md mx-auto">
          Espacio de investigación, validación y desarrollo de herramientas jurídicas, fiscales y
          empresariales.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-3">
          Herramientas disponibles
        </p>
        <EcosystemCard
          to="/labs/resico"
          nombre="Diagnóstico RESICO"
          descripcion="Estima si el Régimen Simplificado de Confianza podría ser adecuado para tu situación fiscal."
          disponible
          destacado
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-3">
          Próximamente
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {PROXIMAMENTE.map((nombre) => (
            <div key={nombre} className="rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-80">
              <p className="font-medium text-gray-500">{nombre}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
