import { Link } from 'react-router-dom'

const RAZONES = [
  'Herramientas desarrolladas para el ámbito jurídico mexicano.',
  'Metodologías transparentes y comprensibles.',
  'Enfoque institucional y profesional.',
  'Acceso futuro a orientación especializada.',
]

const CHIPS_HERO = [
  { to: '/productos/laboralmx/liquidacion', label: 'Liquidación' },
  { to: '/productos/laboralmx/finiquito', label: 'Finiquito' },
  { to: '/productos/laboralmx/aguinaldo', label: 'Aguinaldo' },
  { to: '/productos/laboralmx/vacaciones', label: 'Vacaciones' },
  { to: '/productos/laboralmx/vacaciones', label: 'Prima vacacional' },
  { to: '/productos/laboralmx/sdi', label: 'Salario Diario Integrado' },
]

export default function RomanusHome() {
  return (
    <div className="flex flex-col gap-20">
      {/* Hero — se quitó el "ROMANUS" gigante (ya está en el navbar; era
          redundante). El título ahora comunica de inmediato qué hace la
          plataforma, sin que el visitante tenga que buscarlo. */}
      <section className="text-center pt-12 sm:pt-16">
        <h1 className="text-4xl sm:text-5xl font-semibold text-primary leading-tight">
          Calculadoras laborales gratuitas para México
        </h1>
        <p className="font-serif text-lg sm:text-xl text-stone mt-5 max-w-xl mx-auto leading-relaxed">
          Calcula finiquitos, liquidaciones, aguinaldo, vacaciones, prima vacacional y salario
          diario integrado conforme a la Ley Federal del Trabajo.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/laboral-suite"
            className="rounded-lg bg-primary text-white px-8 py-3 font-semibold hover:bg-primary-light transition"
          >
            Calcular ahora
          </Link>
          <a
            href="#herramientas-destacadas"
            className="rounded-lg border-2 border-primary text-primary px-8 py-3 font-semibold hover:bg-primary hover:text-white transition"
          >
            Ver herramientas
          </a>
        </div>

        <div id="herramientas-destacadas" className="mt-10 flex flex-wrap justify-center gap-2.5">
          {CHIPS_HERO.map((c) => (
            <Link
              key={c.label}
              to={c.to}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-primary hover:border-gold hover:text-gold-dark transition"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* La sección "¿Qué puedes calcular hoy?" se eliminó: duplicaba
          exactamente los chips ya mostrados en el hero (Liquidación,
          Finiquito, Aguinaldo, Vacaciones, Prima vacacional, SDI). */}

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
