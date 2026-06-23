const VALORES = ['Claridad', 'Responsabilidad', 'Accesibilidad', 'Innovación', 'Confianza']

/**
 * Acerca de ROMANUS (la plataforma). Distinta y separada de
 * /productos/laboralmx/acerca-de (Acerca de Laboral Suite, con su propio
 * contenido sobre el producto y su fundador) — esa página no se tocó.
 *
 * v4.3: se mejoró la jerarquía visual (tarjetas separadas, eyebrow
 * dorado, grid de valores) para que se sienta como la página de una
 * organización, no como texto corrido.
 */
export default function AcercaDeRomanusPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="text-center pt-4">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Institucional
        </p>
        <h1 className="text-3xl font-semibold text-primary">Acerca de ROMANUS</h1>
      </div>

      <div className="max-w-2xl mx-auto w-full grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 sm:col-span-2">
          <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-2">
            Qué es ROMANUS
          </p>
          <p className="text-sm text-gray-700">
            ROMANUS es una plataforma mexicana que combina tecnología, estrategia y conocimiento
            para desarrollar herramientas jurídicas, fiscales y empresariales accesibles.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-2">Misión</p>
          <p className="text-sm text-gray-700">
            Hacer más comprensible y accesible la información jurídica, fiscal y empresarial
            mediante herramientas digitales claras y responsables.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-2">Visión</p>
          <p className="text-sm text-gray-700">
            Construir un ecosistema de referencia para personas, profesionistas y empresas que
            necesitan entender, calcular y tomar mejores decisiones.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <p className="text-xs font-semibold text-stone uppercase tracking-widest mb-3 text-center">
          Valores
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {VALORES.map((valor) => (
            <div
              key={valor}
              className="rounded-lg border border-gray-200 bg-white p-3 text-center"
            >
              <p className="text-sm font-medium text-primary">{valor}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
