import { trackCtaClick } from '../utils/analytics'
import PageMetadata from '../components/PageMetadata'
import FiniquitoCalculator from './FiniquitoCalculator'
import LiquidacionCalculator from './LiquidacionCalculator'

interface CalculatorCampaignLandingProps {
  calculator: 'finiquito' | 'liquidacion'
}

const CONTENT = {
  finiquito: {
    eyebrow: 'Calculadora laboral gratuita para México',
    title: 'Calcula tu finiquito en línea, sin registro',
    description:
      'Obtén una estimación informativa de salarios pendientes, aguinaldo proporcional, vacaciones y prima vacacional con un desglose claro.',
    time: 'Aproximadamente 2 minutos',
    cta: 'Calcular mi finiquito',
    location: 'campaign_landing_finiquito',
    documentTitle: 'Calculadora de finiquito gratis en México | ROMANUS',
    canonicalPath: '/calcular-finiquito',
    imagePath: '/romanus-finiquito-social.jpg',
  },
  liquidacion: {
    eyebrow: 'Calculadora laboral gratuita para México',
    title: 'Estima tu liquidación laboral en minutos',
    description:
      'Revisa un escenario informativo de finiquito e indemnización por terminación laboral, con conceptos separados y supuestos visibles.',
    time: 'Aproximadamente 3 minutos',
    cta: 'Calcular mi liquidación',
    location: 'campaign_landing_liquidacion',
    documentTitle: 'Calculadora de liquidación laboral en México | ROMANUS',
    canonicalPath: '/calcular-liquidacion',
    imagePath: '/romanus-liquidacion-social.jpg',
  },
} as const

export default function CalculatorCampaignLanding({ calculator }: CalculatorCampaignLandingProps) {
  const content = CONTENT[calculator]

  return (
    <div className="flex flex-col gap-8">
      <PageMetadata
        title={content.documentTitle}
        description={content.description}
        canonicalPath={content.canonicalPath}
        imagePath={content.imagePath}
      />
      <section className="rounded-xl border border-gold/50 bg-white p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-3">
          {content.eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-primary leading-tight max-w-3xl">
          {content.title}
        </h1>
        <p className="font-serif text-lg text-stone mt-4 max-w-2xl leading-relaxed">
          {content.description}
        </p>
        <p className="mt-3 text-sm font-semibold text-primary">{content.time} · No necesitas crear una cuenta</p>
        <a
          href="#calculadora"
          onClick={() => trackCtaClick(content.cta, '#calculadora', content.location)}
          className="inline-block mt-6 rounded-lg bg-primary text-white px-7 py-3 font-semibold hover:bg-primary-light transition"
        >
          {content.cta}
        </a>
        <div className="grid sm:grid-cols-3 gap-3 mt-7 text-sm">
          <p className="rounded-lg bg-ivory px-4 py-3 text-primary font-medium">Tus datos permanecen en tu dispositivo</p>
          <p className="rounded-lg bg-ivory px-4 py-3 text-primary font-medium">Resultado inmediato</p>
          <p className="rounded-lg bg-ivory px-4 py-3 text-primary font-medium">Metodología visible</p>
        </div>
      </section>

      <section id="calculadora" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
        {calculator === 'finiquito' ? (
          <FiniquitoCalculator headingLevel="h2" />
        ) : (
          <LiquidacionCalculator headingLevel="h2" />
        )}
      </section>

      <section className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="font-semibold text-primary mb-1">¿Qué necesitas?</p>
          <p>Fechas de ingreso y salida, salario y algunos datos básicos de la relación laboral.</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="font-semibold text-primary mb-1">¿Qué recibirás?</p>
          <p>Una estimación desglosada que puedes revisar, copiar o guardar como PDF.</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="font-semibold text-primary mb-1">Alcance</p>
          <p>Es información orientativa y no sustituye la revisión de documentos ni asesoría legal.</p>
        </div>
      </section>
    </div>
  )
}
