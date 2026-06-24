import { Link } from 'react-router-dom'

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="text-center pt-4">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Documento legal
        </p>
        <h1 className="text-3xl font-semibold text-primary">Aviso de Privacidad</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Información que captura cada herramienta</h2>
        <p className="text-sm text-gray-700">
          Las calculadoras de Laboral Suite y las herramientas de ROMANUS Labs (como el
          Diagnóstico RESICO) procesan los datos que el usuario captura directamente en su propio
          navegador, únicamente para generar el resultado en pantalla. ROMANUS no almacena estos
          datos en ningún servidor.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Analítica de uso</h2>
        <p className="text-sm text-gray-700">
          ROMANUS utiliza Google Analytics 4 para entender, de forma agregada, cómo se usa el
          sitio (páginas visitadas, eventos de interacción). Esta información no identifica a una
          persona en particular y se usa únicamente para mejorar la plataforma.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Contacto por WhatsApp</h2>
        <p className="text-sm text-gray-700">
          Si decides contactar a ROMANUS por WhatsApp, esa conversación se realiza dentro de la
          plataforma de WhatsApp/Meta y queda sujeta a las políticas de privacidad de dicha
          plataforma, que ROMANUS no controla. Antes de continuar al canal de WhatsApp de ROMANUS
          con Causa, se muestra un aviso de consentimiento adicional con información relevante
          sobre la naturaleza del servicio.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Derechos del usuario</h2>
        <p className="text-sm text-gray-700">
          Por encontrarse en fase de validación, ROMANUS no mantiene actualmente una base de datos
          formal de usuarios más allá de la analítica agregada descrita arriba. Si tienes alguna
          duda sobre el tratamiento de tu información, puedes contactarnos por WhatsApp.
        </p>
      </section>

      <p className="text-xs text-stone text-center">
        Consulta también nuestro{' '}
        <Link to="/aviso-legal" className="underline hover:text-primary">
          Aviso Legal
        </Link>{' '}
        y nuestros{' '}
        <Link to="/terminos" className="underline hover:text-primary">
          Términos y Condiciones
        </Link>
        .
      </p>
    </div>
  )
}
