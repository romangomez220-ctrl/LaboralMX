import { Link } from 'react-router-dom'

export default function TerminosPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="text-center pt-4">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Documento legal
        </p>
        <h1 className="text-3xl font-semibold text-primary">Términos y Condiciones</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Aceptación</h2>
        <p className="text-sm text-gray-700">
          Al usar este sitio y sus herramientas, aceptas estos Términos y Condiciones, así como el{' '}
          <Link to="/aviso-legal" className="underline hover:text-primary-light">
            Aviso Legal
          </Link>{' '}
          y el{' '}
          <Link to="/privacidad" className="underline hover:text-primary-light">
            Aviso de Privacidad
          </Link>{' '}
          de ROMANUS.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Naturaleza del proyecto</h2>
        <p className="text-sm text-gray-700">
          ROMANUS es un proyecto jurídico y tecnológico en fase de validación. ROMANUS no es
          actualmente un despacho jurídico ni una sociedad constituida.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Uso de las herramientas</h2>
        <p className="text-sm text-gray-700">
          Laboral Suite, el Diagnóstico RESICO y cualquier otra herramienta de ROMANUS generan
          estimaciones informativas con base en los datos que el propio usuario captura. Estas
          herramientas no sustituyen la asesoría profesional individualizada de un abogado
          titulado o un contador.
        </p>
      </section>

      <section className="rounded-lg border-2 border-primary bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Protección de colaboradores</h2>
        <p className="text-sm text-gray-700">
          Ningún colaborador está autorizado para recibir pagos, celebrar contratos, asumir
          representación legal o comprometer a ROMANUS frente a terceros. Los colaboradores
          participan conforme a los lineamientos internos vigentes del programa.
        </p>
      </section>

      <section className="rounded-lg border-2 border-primary bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Limitación de responsabilidad</h2>
        <p className="text-sm text-gray-700 mb-2">
          La información proporcionada por ROMANUS y sus colaboradores tiene carácter
          exclusivamente informativo y orientativo. El usuario reconoce que cualquier decisión
          tomada con base en dicha información será de su exclusiva responsabilidad.
        </p>
        <p className="text-sm text-gray-700">
          ROMANUS no garantiza resultados específicos ni sustituye la asesoría profesional
          individualizada de un abogado titulado.
        </p>
      </section>

      <section className="rounded-lg border-2 border-primary bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Derecho a rechazar, suspender o derivar solicitudes</h2>
        <p className="text-sm text-gray-700">
          ROMANUS se reserva el derecho de rechazar, suspender o derivar cualquier solicitud
          cuando considere que el asunto excede el alcance del proyecto, implica urgencia,
          requiere representación formal, involucra riesgos elevados o no puede ser atendido
          responsablemente dentro de la etapa actual de validación.
        </p>
      </section>

      <section className="rounded-lg border-2 border-primary bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Capacidad operativa limitada</h2>
        <p className="text-sm text-gray-700">
          ROMANUS podrá limitar temporalmente la recepción de solicitudes cuando la capacidad
          operativa del proyecto no permita atenderlas adecuadamente.
        </p>
      </section>

      <section className="rounded-lg border-2 border-primary bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Programa piloto</h2>
        <p className="text-sm text-gray-700">
          Debido a que ROMANUS con Causa es un programa piloto en fase de validación, la
          recepción y atención de solicitudes podrá limitarse, suspenderse o cerrarse
          temporalmente en cualquier momento.
        </p>
      </section>

      <section className="rounded-lg border border-amber-300 bg-warning-light p-5">
        <h2 className="font-semibold text-warning mb-2">ROMANUS no es un servicio de emergencia</h2>
        <p className="text-sm text-gray-700">
          Si tu situación involucra violencia activa, una detención, riesgo para tu integridad
          física, una audiencia próxima o un plazo legal en curso, debes acudir inmediatamente a
          la autoridad competente o a un profesional especializado.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Modificaciones a estos términos</h2>
        <p className="text-sm text-gray-700">
          ROMANUS puede actualizar estos Términos y Condiciones en cualquier momento, conforme el
          proyecto evolucione durante su fase de validación. El uso continuado del sitio implica
          la aceptación de la versión vigente.
        </p>
      </section>
    </div>
  )
}
