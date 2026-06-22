export default function FiniquitoVsLiquidacion() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
      <h2 className="font-semibold text-primary mb-3">
        ¿Cuál es la diferencia entre finiquito y liquidación?
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-800 mb-1">Finiquito</p>
          <ul className="list-disc pl-4 space-y-1 text-gray-600">
            <li>Renuncia voluntaria.</li>
            <li>Terminación por mutuo acuerdo.</li>
            <li>Vencimiento de contrato temporal.</li>
            <li>Incluye prestaciones pendientes y proporcionales.</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">Liquidación</p>
          <ul className="list-disc pl-4 space-y-1 text-gray-600">
            <li>Generalmente aplica en casos de despido injustificado.</li>
            <li>Incluye todo lo correspondiente al finiquito.</li>
            <li>Además contempla indemnizaciones legales.</li>
          </ul>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500 italic">
        Los resultados mostrados son estimativos y pueden variar según las circunstancias
        particulares de cada caso.
      </p>
    </section>
  )
}
