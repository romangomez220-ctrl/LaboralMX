import EcosystemCard from '../components/EcosystemCard'
import { useNoIndex } from '../labs/useNoIndex'

// Estructura conceptual de Labs (v4.9.2): organizada por suite. Los
// "Beta" listados aquí siguen siendo SOLO placeholders — no tienen
// ruta, no se desarrollan todavía. Ver ROADMAP-FISCAL-SUITE-PRO.md.
//
// Liquidación y SDI se quitaron de aquí (existían erróneamente como
// "Beta" en Labs desde v4.8): son herramientas reales y funcionales de
// Laboral Suite desde el inicio del proyecto, no experimentos. Mostrarlas
// como "Beta" en Labs contradecía su propio estado real.
const FISCAL_SUITE_BETA = ['Retenciones Beta']

/**
 * Página de ROMANUS Labs. No es una sección pública (v4.3): sin enlace
 * en ningún menú/catálogo/landing, solo accesible por URL directa, con
 * noindex/nofollow. Organizada conceptualmente por suite (Fiscal Suite)
 * para preparar el crecimiento futuro, sin desarrollar ni exponer
 * ninguna herramienta nueva todavía.
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
          <EcosystemCard
            to="/labs/xml-cfdi"
            nombre="XML CFDI Beta"
            descripcion="Convierte tus archivos XML de CFDI (incluye Nómina) a un libro de Excel, sin salir de tu navegador."
            disponible
          />
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
  )
}
