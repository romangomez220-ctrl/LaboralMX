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
const PRECISIONES = [
  'Es un programa piloto y la disponibilidad es limitada.',
  'El contacto inicial no crea una relación abogado-cliente ni implica representación legal.',
  'Cada solicitud se revisa antes de confirmar si puede recibir orientación.',
]

const PREPARATE_TALLER = [
  'Ten a la mano fechas aproximadas de ingreso y salida.',
  'Reúne recibos, contrato, cartas, mensajes o documentos firmados.',
  'Anota tus preguntas antes de la sesión para aprovechar mejor el taller.',
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
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <div className="max-w-3xl pt-4">
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

      <section className="rounded-xl border border-gold/60 bg-white p-6 shadow-sm sm:p-8">
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
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
          <ContactWhatsAppButton label="Quiero recibir aviso del taller" variant="solid" requireConsent />
          <p className="text-xs text-stone">
            El contacto es informativo y no implica asesoría personalizada ni representación legal.
          </p>
        </div>
      </section>

      <section className="w-full">
        <h2 className="font-semibold text-primary mb-2">Cómo prepararte para el taller</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {PREPARATE_TALLER.map((item) => (
            <div key={item} className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="w-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Nuestro enfoque</p>
        <h2 className="mt-2 text-2xl font-semibold text-primary">Información clara y apoyo responsable</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {AREAS_ENFOQUE.map((area) => (
            <div key={area.titulo} className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="font-semibold text-primary mb-1">{area.titulo}</p>
              <p className="text-sm text-gray-600">{area.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full rounded-xl border border-gray-200 bg-ivory p-6">
        <h2 className="font-semibold text-primary mb-3">Alcance del programa</h2>
        <ul className="grid gap-2 text-sm text-gray-700 md:grid-cols-3">
          {PRECISIONES.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="w-full rounded-lg border border-amber-300 bg-warning-light p-5">
        <h2 className="font-semibold text-warning mb-2">ROMANUS no es un servicio de emergencia</h2>
        <p className="text-sm text-gray-700">
          Si tu situación involucra violencia activa, una detención, riesgo para tu integridad
          física, una audiencia próxima o un plazo legal en curso, debes acudir inmediatamente a
          la autoridad competente o a un profesional especializado.
        </p>
      </section>

    </div>
  )
}
