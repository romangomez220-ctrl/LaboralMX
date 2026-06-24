import { Link } from 'react-router-dom'
import { EMAIL_PRIVACIDAD } from '../config/contacto'

/**
 * v4.6 — Intake & Privacy Hardening: se agregó "Responsable del
 * tratamiento" y la sección de derechos ARCO. El correo de privacidad
 * NO se publica todavía (corrección explícita) — se usa el texto
 * temporal hasta que el proyecto se formalice. Cuando EMAIL_PRIVACIDAD
 * (en src/config/contacto.ts) tenga un valor real, esta página lo
 * muestra automáticamente sin que haya que tocar este archivo.
 */
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
        <h2 className="font-semibold text-primary mb-2">Responsable del tratamiento</h2>
        <p className="text-sm text-gray-700">
          Mientras ROMANUS se encuentra en fase de validación, el responsable del tratamiento de
          los datos personales es Román Gómez. Esta identificación corresponde únicamente a
          efectos de protección de datos personales, conforme a la legislación aplicable, y no
          implica responsabilidad personal por el uso que los usuarios hagan de las herramientas
          de ROMANUS, por las decisiones que tomen con base en sus resultados, ni por asesoría
          profesional no prestada formalmente.
        </p>
      </section>

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
          con Causa, se muestra un aviso de consentimiento y un formulario breve con información
          relevante sobre la naturaleza del servicio. WhatsApp es un canal operativo general de
          contacto; no es el canal principal para ejercer derechos de privacidad (ver más abajo).
        </p>
      </section>

      <section className="rounded-lg border-2 border-primary bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">
          Ejercicio de derechos ARCO y contacto de privacidad
        </h2>
        {EMAIL_PRIVACIDAD ? (
          <p className="text-sm text-gray-700">
            Para ejercer derechos de acceso, rectificación, cancelación u oposición sobre tus
            datos personales, o para realizar cualquier consulta relacionada con privacidad, puedes
            escribir a: {EMAIL_PRIVACIDAD}.
          </p>
        ) : (
          <div className="text-sm text-gray-700 flex flex-col gap-2">
            <p>
              Los canales oficiales de contacto y privacidad de ROMANUS serán publicados conforme
              avance el proceso de formalización del proyecto.
            </p>
            <p>
              Durante esta etapa de validación, cualquier consulta relacionada con privacidad o
              tratamiento de información podrá realizarse a través de los canales oficiales
              publicados en el sitio web.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Derechos del usuario</h2>
        <p className="text-sm text-gray-700">
          Por encontrarse en fase de validación, ROMANUS no mantiene actualmente una base de datos
          formal de usuarios más allá de la analítica agregada descrita arriba.
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
