import { Link } from 'react-router-dom'

const RAZONES = [
  'Herramientas desarrolladas para el ámbito jurídico mexicano.',
  'Metodologías transparentes y comprensibles.',
  'Enfoque institucional y profesional.',
  'Acceso futuro a orientación especializada.',
]

export default function RomanusHome() {
  return (
    <div className="flex flex-col gap-20">
      {/* Hero — ROMANUS es el protagonista, antes que cualquier otro texto */}
      <section className="text-center pt-12">
        <h1 className="font-display font-semibold text-6xl sm:text-7xl tracking-[0.1em] uppercase text-gold">
          Romanus
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-stone mt-8 max-w-lg mx-auto leading-relaxed">
          Soluciones integrales para el ámbito jurídico, empresarial y personal.
        </p>
        <div className="mt-10">
          <Link
            to="/productos/laboralmx"
            className="rounded-lg bg-primary text-white px-8 py-3 font-semibold hover:bg-primary-light transition"
          >
            Usar Laboral Suite
          </Link>
        </div>
      </section>

      {/* Credibilidad */}
      <section className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-primary mb-6">¿Por qué ROMANUS?</h2>
        <ul className="flex flex-col gap-3 text-sm text-gray-600 text-left sm:text-center">
          {RAZONES.map((razon) => (
            <li key={razon} className="sm:flex sm:justify-center">
              <span className="sm:max-w-md">• {razon}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Filosofía */}
      <section className="text-center max-w-xl mx-auto pb-6">
        <p className="font-serif text-2xl italic text-primary leading-relaxed">
          “Construimos soluciones fundamentadas en conocimiento, estrategia y tecnología.”
        </p>
      </section>
    </div>
  )
}
