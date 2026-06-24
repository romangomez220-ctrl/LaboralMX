import EcosystemCard from '../components/EcosystemCard'
import { useNoIndex } from '../labs/useNoIndex'

// Estructura conceptual de Labs (v4.8): organizada por suite. Todos los
// "Beta" listados aquí son SOLO placeholders — no tienen ruta, no se
// desarrollan todavía, no son productos. Ver ROADMAP-FISCAL-SUITE-PRO.md.
const FISCAL_SUITE_BETA = ['XML CFDI Beta', 'Retenciones Beta']
const LABORAL_SUITE_BETA = ['Liquidación Beta', 'SDI Beta']

/**
 * Página de ROMANUS Labs. No es una sección pública (v4.3): sin enlace
 * en ningún menú/catálogo/landing, solo accesible por URL directa, con
 * noindex/nofollow. v4.8: se reorganiza conceptualmente por suite
 * (Fiscal Suite, Laboral Suite) para preparar el crecimiento futuro,
 * sin desarrollar ni exponer ninguna herramienta nueva todavía.
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

      <div className="rounded-lg border border-amber-300 bg-warning-light text-warning text-sm p-3 text-center">
        Herramientas experimentales en fase de validación. No sustituyen asesoría profesional.
      </div>

      {/* Fiscal Suite */}
      <div>
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-3">
          Fiscal Suite
        </p>
        <div className="flex flex-col gap-3">
          <EcosystemCard
            to="/labs/resico"
            nombre="RESICO Beta"
            descripcion="Estima si el Régimen Simplificado de Confianza podría ser adecuado para tu situación fiscal."
            disponible
            destacado
          />
          <div className="grid sm:grid-cols-2 gap-3">
            {FISCAL_SUITE_BETA.map((nombre) => (
              <div key={nombre} className="rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-80">
                <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-1">
                  Próximamente
                </p>
                <p className="font-medium text-gray-500">{nombre}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Laboral Suite (experimentos) */}
      <div>
        <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-3">
          Laboral Suite
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {LABORAL_SUITE_BETA.map((nombre) => (
            <div key={nombre} className="rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-80">
              <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-1">
                Próximamente
              </p>
              <p className="font-medium text-gray-500">{nombre}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
