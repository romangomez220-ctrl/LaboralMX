export default function About() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-primary">Acerca de Laboral Suite</h1>

      <div className="text-sm text-gray-700 space-y-3">
        <p>
          Laboral Suite es una herramienta informativa diseñada para facilitar la estimación de
          finiquitos y liquidaciones conforme a la legislación laboral mexicana.
        </p>
        <p>
          Nuestro objetivo es acercar herramientas jurídicas prácticas a trabajadores, estudiantes
          de Derecho, abogados y profesionales de recursos humanos.
        </p>
        <p>ROMANUS es un proyecto fundado y dirigido por Román Gómez.</p>
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
        Esta identificación tiene fines de transparencia institucional. Ni ROMANUS ni su
        responsable asumen responsabilidad por el uso que los usuarios hagan de los resultados,
        por decisiones tomadas con base en ellos, por interpretarlos como definitivos, ni por
        asesoría profesional no prestada formalmente. Laboral Suite ofrece estimaciones
        orientativas y no sustituye asesoría legal profesional.
      </p>
    </div>
  )
}
