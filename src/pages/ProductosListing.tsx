import EcosystemCard from '../components/EcosystemCard'

export default function ProductosListing() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Productos</h1>
        <p className="text-sm text-stone mt-1">
          Soluciones digitales de ROMANUS para el ámbito jurídico, empresarial y personal.
        </p>
      </div>

      <EcosystemCard
        to="/productos/laboralmx"
        nombre="Laboral Suite"
        descripcion="Calculadoras de finiquito, liquidación, aguinaldo, vacaciones y prima vacacional, y Salario Diario Integrado — todo conforme a la Ley Federal del Trabajo."
        disponible
        destacado
      />
    </div>
  )
}
