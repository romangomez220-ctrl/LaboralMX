const AREAS = [
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

/**
 * Landing institucional, sin formularios ni backend. Pensada para
 * sentirse como una iniciativa seria y permanente de ROMANUS, no como
 * una campaña temporal — aunque el programa de orientación en sí
 * todavía esté en desarrollo.
 */
export default function ConCausaPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="text-center pt-4 max-w-xl mx-auto">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Iniciativa social de ROMANUS
        </p>
        <h1 className="text-3xl font-semibold text-primary">ROMANUS con Causa</h1>
        <p className="text-sm text-gray-700 mt-3">
          Iniciativa social orientada a acercar orientación jurídica inicial a personas en
          situación vulnerable.
        </p>
      </div>

      <section className="max-w-xl mx-auto w-full">
        <h2 className="font-semibold text-primary mb-2">Propósito</h2>
        <p className="text-sm text-gray-700">
          Creemos que el acceso a orientación jurídica básica no debería depender únicamente de la
          capacidad económica de cada persona. ROMANUS con Causa es el compromiso permanente de la
          plataforma con esa idea.
        </p>
      </section>

      <section className="max-w-xl mx-auto w-full">
        <h2 className="font-semibold text-primary mb-2">Misión social</h2>
        <p className="text-sm text-gray-700">
          Acercar información y orientación jurídica comprensible a quienes más la necesitan,
          combinando tecnología con la colaboración de profesionistas comprometidos.
        </p>
      </section>

      <section className="max-w-xl mx-auto w-full">
        <h2 className="font-semibold text-primary mb-2">
          Programa de orientación gratuita <span className="text-stone font-normal">(próximamente)</span>
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Estamos construyendo un programa permanente con tres áreas de enfoque:
        </p>
        <div className="flex flex-col gap-3">
          {AREAS.map((area) => (
            <div key={area.titulo} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="font-semibold text-primary mb-1">{area.titulo}</p>
              <p className="text-sm text-gray-600">{area.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center">
        <span className="inline-block text-xs font-semibold text-gold-dark uppercase tracking-widest border border-gold rounded-full px-3 py-1">
          Próximamente
        </span>
      </div>
    </div>
  )
}
