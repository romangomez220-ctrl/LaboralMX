const VALORES = ['Claridad', 'Responsabilidad', 'Accesibilidad', 'Innovación', 'Confianza']

/**
 * Acerca de ROMANUS (la plataforma). Distinta y separada de
 * /productos/laboralmx/acerca-de (Acerca de Laboral Suite, con su propio
 * contenido sobre el producto y su fundador) — esa página no se tocó.
 */
export default function AcercaDeRomanusPage() {
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-semibold text-primary text-center">Acerca de ROMANUS</h1>

      <section>
        <h2 className="font-semibold text-primary mb-2">Qué es ROMANUS</h2>
        <p className="text-sm text-gray-700">
          ROMANUS es una plataforma mexicana que combina tecnología, estrategia y conocimiento
          para desarrollar herramientas jurídicas, fiscales y empresariales accesibles.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-primary mb-2">Misión</h2>
        <p className="text-sm text-gray-700">
          Hacer más comprensible y accesible la información jurídica, fiscal y empresarial
          mediante herramientas digitales claras y responsables.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-primary mb-2">Visión</h2>
        <p className="text-sm text-gray-700">
          Construir un ecosistema de referencia para personas, profesionistas y empresas que
          necesitan entender, calcular y tomar mejores decisiones.
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-primary mb-2">Valores</h2>
        <ul className="text-sm text-gray-700 grid grid-cols-2 gap-2">
          {VALORES.map((valor) => (
            <li key={valor} className="flex items-center gap-2">
              <span className="text-gold-dark">•</span> {valor}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
