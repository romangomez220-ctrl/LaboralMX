import { Link } from 'react-router-dom'

/**
 * Aviso Legal de ROMANUS como plataforma. Distinto del aviso legal de
 * Laboral Suite (en /productos/laboralmx/aviso-legal, sobre metodología
 * de cálculo), que no se tocó. Este cubre la naturaleza del proyecto en
 * su conjunto, conforme a ROMANUS v4.5.
 */
export default function AvisoLegalPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="text-center pt-4">
        <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest mb-2">
          Documento legal
        </p>
        <h1 className="text-3xl font-semibold text-primary">Aviso Legal</h1>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Naturaleza del proyecto</h2>
        <p className="text-sm text-gray-700">
          ROMANUS es un proyecto jurídico y tecnológico en fase de validación. ROMANUS no es
          actualmente un despacho jurídico ni una sociedad constituida. La información, las
          herramientas y los contenidos de este sitio tienen fines exclusivamente informativos y
          educativos.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">
          Sin asesoría legal ni relación abogado-cliente
        </h2>
        <p className="text-sm text-gray-700">
          Nada de lo publicado en este sitio constituye asesoría legal, representación legal ni
          genera relación abogado-cliente. Las estimaciones generadas por las herramientas de
          ROMANUS (incluyendo Laboral Suite y las herramientas en validación de ROMANUS Labs) se
          calculan con base en la información que el propio usuario proporciona y pueden variar
          según las circunstancias particulares de cada caso.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Colaboradores del programa</h2>
        <p className="text-sm text-gray-700">
          Los colaboradores participan conforme a los lineamientos internos vigentes del
          programa. Ningún colaborador está autorizado para recibir pagos, celebrar contratos,
          asumir representación legal o comprometer a ROMANUS frente a terceros.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-primary mb-2">Modificaciones</h2>
        <p className="text-sm text-gray-700">
          Por encontrarse en fase de validación, ROMANUS puede modificar, limitar o suspender
          contenidos, herramientas o secciones de este sitio en cualquier momento, sin previo
          aviso.
        </p>
      </section>

      <p className="text-xs text-stone text-center">
        Consulta también nuestro{' '}
        <Link to="/privacidad" className="underline hover:text-primary">
          Aviso de Privacidad
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
