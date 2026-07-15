import { Link } from 'react-router-dom'
import Disclaimer from '../components/Disclaimer'
import { trackCtaClick } from '../utils/analytics'

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="text-center pt-6">
        <h1 className="text-3xl font-bold text-primary">Laboral Suite</h1>
        <p className="mt-2 text-lg text-gray-600">
          Calcula tu finiquito o liquidación en minutos.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/productos/laboralmx/finiquito"
            onClick={() => trackCtaClick('Calcular finiquito', '/productos/laboralmx/finiquito', 'laboral_home_hero')}
            className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition"
          >
            Calcular finiquito
          </Link>
          <Link
            to="/productos/laboralmx/liquidacion"
            onClick={() => trackCtaClick('Calcular liquidación', '/productos/laboralmx/liquidacion', 'laboral_home_hero')}
            className="rounded-lg border-2 border-primary text-primary px-6 py-3 font-semibold hover:bg-primary hover:text-white transition"
          >
            Calcular liquidación
          </Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-primary mb-1">¿Qué es el finiquito?</h2>
          <p>
            Es el pago que te corresponde al terminar tu relación laboral, sin importar la causa:
            salarios pendientes, aguinaldo proporcional y vacaciones proporcionales con su prima.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-primary mb-1">¿Qué es la liquidación?</h2>
          <p>
            Es el pago adicional al finiquito que corresponde cuando hay un despido injustificado:
            incluye la indemnización constitucional de 90 días y, en su caso, la prima de
            antigüedad.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-primary mb-3">Más herramientas</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <Link
            to="/productos/laboralmx/aguinaldo"
            onClick={() => trackCtaClick('Aguinaldo', '/productos/laboralmx/aguinaldo', 'laboral_home_more_tools')}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:border-primary transition block"
          >
            <p className="font-semibold text-primary mb-1">Aguinaldo</p>
            <p className="text-gray-600">Estima tu aguinaldo proyectado al 31 de diciembre.</p>
          </Link>
          <Link
            to="/productos/laboralmx/vacaciones"
            onClick={() => trackCtaClick('Vacaciones y prima vacacional', '/productos/laboralmx/vacaciones', 'laboral_home_more_tools')}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:border-primary transition block"
          >
            <p className="font-semibold text-primary mb-1">Vacaciones y prima vacacional</p>
            <p className="text-gray-600">Consulta tus días pendientes según tu antigüedad.</p>
          </Link>
          <Link
            to="/productos/laboralmx/sdi"
            onClick={() => trackCtaClick('Salario Diario Integrado', '/productos/laboralmx/sdi', 'laboral_home_more_tools')}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:border-primary transition block"
          >
            <p className="font-semibold text-primary mb-1">Salario Diario Integrado</p>
            <p className="text-gray-600">Calcula tu SDI con prestaciones mínimas de ley.</p>
          </Link>
        </div>
      </section>

      <section className="text-sm text-gray-600">
        <p>
          Captura tus fechas, tu salario y algunos datos de tu caso. Laboral Suite hace los cálculos
          con base en las prestaciones mínimas de la Ley Federal del Trabajo y te muestra un
          desglose claro, con la opción de copiarlo o descargarlo en PDF.
        </p>
      </section>

      <Disclaimer compact />
    </div>
  )
}
