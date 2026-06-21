export default function About() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-primary">Acerca de LaboralMX</h1>

      <div className="text-sm text-gray-700 space-y-3">
        <p>
          LaboralMX es una herramienta informativa diseñada para facilitar la estimación de
          finiquitos y liquidaciones conforme a la legislación laboral mexicana.
        </p>
        <p>
          Nuestro objetivo es acercar herramientas jurídicas prácticas a trabajadores, estudiantes
          de Derecho, abogados y profesionales de recursos humanos.
        </p>
        <p>Proyecto fundado por Román Gómez.</p>
        <p>
          Instagram:{' '}
          <a
            href="https://www.instagram.com/GOMZROMAN"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold underline hover:text-primary-light transition"
          >
            @GOMZROMAN
          </a>
        </p>
      </div>

      <p className="text-sm text-gray-500 italic">
        LaboralMX no sustituye asesoría legal profesional.
      </p>
    </div>
  )
}
