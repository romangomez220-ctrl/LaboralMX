import { Link } from 'react-router-dom'

const RAZONES = [
  'Herramientas con metodología jurídica visible.',
  'Laboratorio privado con validadores profesionales.',
  'Publicación gradual de recursos confiables.',
  'Iniciativa social conectada a educación jurídica gratuita.',
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
    <div className="flex flex-col gap-16">
      <section className="pt-10 sm:pt-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
        <div>
          <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-3">
            Plataforma jurídica y tecnológica
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-primary leading-tight">
            Herramientas legales claras para tomar mejores decisiones.
          </h1>
          <p className="font-serif text-lg sm:text-xl text-stone mt-5 max-w-2xl leading-relaxed">
            ROMANUS combina calculadoras, asistentes jurídicos y educación gratuita para acercar
            información útil, verificable y comprensible al contexto mexicano.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/herramientas"
              className="rounded-lg bg-primary text-white px-8 py-3 font-semibold hover:bg-primary-light transition text-center"
            >
              Explorar herramientas
            </Link>
            <Link
              to="/con-causa"
              className="rounded-lg border-2 border-primary text-primary px-8 py-3 font-semibold hover:bg-primary hover:text-white transition text-center"
            >
              Ver Con Causa
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-3">
            Disponible hoy
          </p>
          <p className="font-serif text-2xl font-semibold text-primary">Laboral Suite</p>
          <p className="text-sm text-gray-600 mt-2">
            Calcula finiquitos, liquidaciones, aguinaldo, vacaciones, prima vacacional y salario
            diario integrado conforme a parámetros de la Ley Federal del Trabajo.
          </p>
          <div id="herramientas-destacadas" className="mt-5 flex flex-wrap gap-2.5">
            {CHIPS_HERO.map((c) => (
              <Link
                key={c.label}
                to={c.to}
                className="rounded-full border border-gray-200 bg-ivory px-4 py-2 text-sm font-medium text-primary hover:border-gold hover:text-gold-dark transition"
              >
                {c.label}
              </Link>
            ))}
          </div>
          <Link to="/laboral-suite" className="text-sm text-primary underline mt-5 inline-block">
            Ver Laboral Suite
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="font-semibold text-primary">Productos públicos</p>
          <p className="text-sm text-gray-600 mt-1">
            Herramientas listas para uso general, con alcance y avisos claros.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="font-semibold text-primary">ROMANUS Labs</p>
          <p className="text-sm text-gray-600 mt-1">
            Validación privada con profesionistas antes de publicar nuevas soluciones.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="font-semibold text-primary">Con Causa</p>
          <p className="text-sm text-gray-600 mt-1">
            Talleres gratuitos y orientación inicial para acercar conocimiento jurídico.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-primary mb-5">Herramientas destacadas</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHIPS_HERO.slice(0, 6).map((c) => (
            <Link key={c.label} to={c.to} className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gold transition">
              <p className="font-semibold text-primary">{c.label}</p>
              <p className="text-sm text-stone mt-1">Calculadora pública de Laboral Suite.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gold bg-white p-6">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Primer taller en preparación
        </p>
        <h2 className="text-2xl font-semibold text-primary">
          Derechos básicos al terminar una relación laboral
        </h2>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Con Causa prepara un taller gratuito sobre finiquito, liquidación y qué revisar antes de
          firmar documentos al terminar una relación de trabajo.
        </p>
        <Link to="/con-causa" className="text-sm text-primary underline mt-4 inline-block">
          Conocer el programa
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-primary mb-6">¿Por qué ROMANUS?</h2>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
          {RAZONES.map((razon) => (
            <li key={razon} className="rounded-lg border border-gray-200 bg-white p-4">
              {razon}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
