import ContactWhatsAppButton from '../components/ContactWhatsAppButton'

const AREAS_ENFOQUE = [
  {
    titulo: 'Atención a grupos vulnerables',
    descripcion:
      'Personas y familias que enfrentan situaciones jurídicas sin los recursos para acceder a asesoría profesional.',
  },
  {
    titulo: 'Trabajo pro bono',
    descripcion:
      'Colaboración con profesionistas dispuestos a aportar tiempo y conocimiento de forma gratuita en casos prioritarios.',
  },
  {
    titulo: 'Acceso a información jurídica comprensible',
    descripcion:
      'Contenido y herramientas explicadas en lenguaje claro, sin tecnicismos innecesarios, para que cualquier persona pueda entender su situación.',
  },
]

// Áreas de atención jurídica consideradas (v4.5). Derecho Penal se
// excluyó deliberadamente de este listado.
const AREAS_DERECHO = [
  'Derecho Laboral',
  'Derecho Civil',
  'Derecho Familiar',
  'Cobranza abusiva',
  'Fraudes y estafas digitales (orientación básica)',
]

const PRECISIONES = [
  'Es un programa piloto en fase de validación.',
  'La atención puede limitarse o suspenderse en cualquier momento.',
  'No existe representación legal.',
  'No existe relación abogado-cliente.',
  'No existe obligación de aceptar todos los casos que se reciban.',
]

/**
 * Landing institucional, sin formularios ni backend. v4.5: se agregaron
 * las áreas de atención jurídica, las precisiones obligatorias sobre la
 * naturaleza del programa, y el aviso de servicio no urgente. El botón
 * de contacto ahora exige el consentimiento previo (WhatsAppConsentModal)
 * antes de abrir WhatsApp.
 */
export default function ConCausaPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="pt-4 max-w-3xl">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Iniciativa social de ROMANUS
        </p>
        <h1 className="text-4xl font-semibold text-primary">ROMANUS con Causa</h1>
        <p className="text-base text-gray-700 mt-3 max-w-2xl">
          Iniciativa social orientada a acercar orientación jurídica inicial a personas en
          situación vulnerable, mediante herramientas públicas, talleres gratuitos y contenido
          comprensible.
        </p>
      </div>

      <section className="rounded-lg border-2 border-gold bg-white p-6">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Primer taller gratuito en preparación
        </p>
        <h2 className="text-2xl font-semibold text-primary">
          Derechos básicos al terminar una relación laboral
        </h2>
        <p className="text-sm text-gray-700 mt-2 max-w-2xl">
          Una sesión introductoria sobre finiquito, liquidación, documentos que conviene revisar
          antes de firmar y cuándo buscar asesoría profesional. La fecha, modalidad y ponente se
          anunciarán próximamente.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mt-5">
          {['Finiquito y liquidación', 'Documentos antes de firmar', 'Preguntas frecuentes'].map((item) => (
            <div key={item} className="rounded-lg border border-gray-200 bg-ivory px-4 py-3 text-sm text-primary font-medium">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl w-full">
        <h2 className="font-semibold text-primary mb-2">Propósito</h2>
        <p className="text-sm text-gray-700">
          Creemos que el acceso a orientación jurídica básica no debería depender únicamente de la
          capacidad económica de cada persona. ROMANUS con Causa es el compromiso permanente de la
          plataforma con esa idea.
        </p>
      </section>

      <section className="max-w-3xl w-full">
        <h2 className="font-semibold text-primary mb-2">Misión social</h2>
        <p className="text-sm text-gray-700">
          Acercar información y orientación jurídica comprensible a quienes más la necesitan,
          combinando tecnología con la colaboración de profesionistas comprometidos.
        </p>
      </section>

      <section className="max-w-3xl w-full">
        <h2 className="font-semibold text-primary mb-2">Áreas de atención consideradas</h2>
        <p className="text-sm text-gray-700 mb-3">
          Por ahora, ROMANUS con Causa contempla orientación inicial en:
        </p>
        <ul className="flex flex-col gap-2">
          {AREAS_DERECHO.map((area) => (
            <li
              key={area}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700"
            >
              {area}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl w-full">
        <h2 className="font-semibold text-primary mb-2">
          Programa de orientación gratuita <span className="text-stone font-normal">(próximamente)</span>
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Estamos construyendo un programa permanente con tres áreas de enfoque:
        </p>
        <div className="flex flex-col gap-3">
          {AREAS_ENFOQUE.map((area) => (
            <div key={area.titulo} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="font-semibold text-primary mb-1">{area.titulo}</p>
              <p className="text-sm text-gray-600">{area.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl w-full rounded-lg border-2 border-primary bg-white p-5">
        <h2 className="font-semibold text-primary mb-3">Antes de contactarnos, es importante que sepas:</h2>
        <ul className="flex flex-col gap-1.5 text-sm text-gray-700">
          {PRECISIONES.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl w-full rounded-lg border border-amber-300 bg-warning-light p-5">
        <h2 className="font-semibold text-warning mb-2">ROMANUS no es un servicio de emergencia</h2>
        <p className="text-sm text-gray-700">
          Si tu situación involucra violencia activa, una detención, riesgo para tu integridad
          física, una audiencia próxima o un plazo legal en curso, debes acudir inmediatamente a
          la autoridad competente o a un profesional especializado.
        </p>
      </section>

      <div className="text-center flex flex-col items-center gap-4">
        <ContactWhatsAppButton label="Contáctanos" variant="outline" requireConsent />
        <span className="inline-block text-xs font-semibold text-gold-dark uppercase tracking-widest border border-gold rounded-full px-3 py-1">
          Próximamente
        </span>
      </div>
    </div>
  )
}
