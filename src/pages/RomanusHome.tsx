import { Link } from 'react-router-dom'
import { PAID_REPORTS_CONFIG, formatReportPrice } from '../config/paidReports'
import { trackCtaClick } from '../utils/analytics'

const HERRAMIENTAS = [
  {
    to: '/calcular-liquidacion',
    nombre: 'Liquidación',
    descripcion: 'Estima finiquito e indemnización por terminación laboral.',
  },
  {
    to: '/calcular-finiquito',
    nombre: 'Finiquito',
    descripcion: 'Calcula prestaciones pendientes con desglose claro.',
  },
  {
    to: '/productos/laboralmx/aguinaldo',
    nombre: 'Aguinaldo',
    descripcion: 'Obtén el monto anual o proporcional que te corresponde.',
  },
  {
    to: '/productos/laboralmx/vacaciones',
    nombre: 'Vacaciones y prima',
    descripcion: 'Revisa días pendientes y prima vacacional estimada.',
  },
  {
    to: '/productos/laboralmx/sdi',
    nombre: 'Salario integrado',
    descripcion: 'Calcula el SDI con prestaciones mínimas de ley.',
  },
]

export default function RomanusHome() {
  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <section className="grid items-center gap-10 py-6 sm:py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-14">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
            Tecnología jurídica para México
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] text-primary sm:text-6xl">
            Entiende tus derechos. Calcula con claridad.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Herramientas laborales gratuitas con metodología visible, resultados inmediatos y
            opciones profesionales cuando necesitas conservar o revisar la información.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/calcular-liquidacion"
              onClick={() => trackCtaClick('Calcular liquidación', '/calcular-liquidacion', 'home_hero')}
              className="rounded-lg bg-primary px-7 py-3 text-center font-semibold text-white transition hover:bg-primary-light"
            >
              Calcular liquidación
            </Link>
            <Link
              to="/herramientas"
              onClick={() => trackCtaClick('Ver herramientas', '/herramientas', 'home_hero')}
              className="rounded-lg border border-primary px-7 py-3 text-center font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              Ver herramientas
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone">
            <span>Sin registro</span>
            <span aria-hidden="true">·</span>
            <span>Datos procesados en tu navegador</span>
            <span aria-hidden="true">·</span>
            <span>Metodología visible</span>
          </div>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark">Laboral Suite</p>
          <h2 className="mt-2 text-3xl font-semibold text-primary">Tu cálculo, paso a paso</h2>
          <div className="mt-6 space-y-4">
            {[
              ['01', 'Captura', 'Fechas, salario y situación laboral.'],
              ['02', 'Comprende', 'Resultado desglosado y fórmulas consultables.'],
              ['03', 'Decide', 'Compara, comparte o genera un reporte profesional.'],
            ].map(([numero, titulo, descripcion]) => (
              <div key={numero} className="grid grid-cols-[2.25rem_1fr] gap-3 border-t border-gray-100 pt-4 first:border-0 first:pt-0">
                <span className="font-serif text-xl font-semibold text-gold-dark">{numero}</span>
                <div>
                  <p className="font-semibold text-primary">{titulo}</p>
                  <p className="mt-0.5 text-sm text-gray-600">{descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section>
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark">Disponible ahora</p>
            <h2 className="mt-1 text-3xl font-semibold text-primary">Calculadoras laborales</h2>
          </div>
          <Link to="/laboral-suite" className="text-sm font-semibold text-primary underline decoration-gold underline-offset-4">
            Ver Laboral Suite
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {HERRAMIENTAS.map((herramienta) => (
            <Link
              key={herramienta.nombre}
              to={herramienta.to}
              onClick={() => trackCtaClick(herramienta.nombre, herramienta.to, 'home_tools')}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gold hover:shadow-sm"
            >
              <p className="font-semibold text-primary group-hover:text-primary-light">{herramienta.nombre}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{herramienta.descripcion}</p>
              <p className="mt-5 text-sm font-semibold text-primary">Abrir →</p>
            </Link>
          ))}
        </div>
      </section>

      {PAID_REPORTS_CONFIG.enabled && (
        <section className="grid gap-6 rounded-2xl border border-gold/60 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark">Reporte ROMANUS</p>
            <h2 className="mt-2 text-3xl font-semibold text-primary">Del cálculo a un documento profesional</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
              El cálculo es gratuito. Si necesitas conservarlo o compartirlo, genera un PDF con
              folio, metodología, datos utilizados y checklist de revisión.
            </p>
            <p className="mt-3 font-semibold text-primary">Pago único de {formatReportPrice()}</p>
          </div>
          <Link
            to="/calcular-liquidacion"
            onClick={() => trackCtaClick('Probar cálculo', '/calcular-liquidacion', 'home_report')}
            className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white transition hover:bg-primary-light"
          >
            Probar cálculo
          </Link>
        </section>
      )}

      <section className="grid gap-8 border-t border-gray-200 pt-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark">Criterio ROMANUS</p>
          <h2 className="mt-2 text-3xl font-semibold text-primary">Claridad antes que complejidad</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
            Cada herramienta delimita sus supuestos, muestra cómo obtiene el resultado y pasa por
            revisión antes de llegar al catálogo público.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          {['Alcance claro', 'Cálculo visible', 'Revisión continua'].map((item) => (
            <div key={item} className="rounded-lg bg-white px-3 py-4 font-medium text-primary ring-1 ring-gray-200">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col justify-between gap-5 rounded-2xl bg-primary p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">ROMANUS con Causa</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Información jurídica que también acompaña.</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-300">
            Talleres gratuitos y orientación inicial para acercar conocimiento jurídico útil.
          </p>
        </div>
        <Link to="/con-causa" className="shrink-0 rounded-lg border border-gold px-5 py-2.5 text-center font-semibold text-gold transition hover:bg-gold hover:text-primary">
          Conocer la iniciativa
        </Link>
      </section>
    </div>
  )
}
