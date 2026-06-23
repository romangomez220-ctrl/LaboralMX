import EcosystemCard from '../components/EcosystemCard'

export default function ProductosListing() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Productos</h1>
        <p className="text-sm text-stone mt-1">
          Soluciones digitales de ROMANUS para el ámbito jurídico, fiscal y empresarial.
        </p>
      </div>

      <EcosystemCard
        to="/laboral-suite"
        nombre="Laboral Suite"
        descripcion="Calculadoras de finiquito, liquidación, aguinaldo, vacaciones y prima vacacional, y Salario Diario Integrado — todo conforme a la Ley Federal del Trabajo."
        disponible
        destacado
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 opacity-80">
          <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-2">
            Próximamente
          </p>
          <p className="font-serif text-lg font-semibold text-gray-500">
            Nuevas soluciones fiscales
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 opacity-80">
          <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-2">
            Próximamente
          </p>
          <p className="font-serif text-lg font-semibold text-gray-500">
            Nuevas soluciones empresariales
          </p>
        </div>
      </div>
    </div>
  )
}
