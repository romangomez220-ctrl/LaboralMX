import Disclaimer from '../components/Disclaimer'

export default function LegalNotice() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-primary">Aviso legal</h1>

      <Disclaimer />

      <div className="text-sm text-gray-700 space-y-3">
        <p>
          Laboral Suite es una herramienta de cálculo informativo. Los resultados que genera se basan
          únicamente en las prestaciones mínimas establecidas por la Ley Federal del Trabajo (LFT)
          vigente en México, utilizando los datos que tú proporcionas.
        </p>
        <p>Esta herramienta no considera, entre otros factores:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Condiciones particulares de tu contrato individual o colectivo de trabajo.</li>
          <li>Prestaciones superiores a las mínimas de ley.</li>
          <li>
            Comisiones, bonos, prestaciones en especie u otros componentes del salario integrado
            cuando el usuario no capture su salario integrado real.
          </li>
          <li>Convenios sindicales o disposiciones internas de la empresa.</li>
          <li>Criterios de tribunales laborales o resoluciones judiciales sobre tu caso particular.</li>
          <li>Salarios caídos, horas extra, PTU u otras prestaciones no incluidas en esta versión.</li>
        </ul>
        <p>
          Metodología revisada con la Ley Federal del Trabajo vigente, última reforma publicada en
          el Diario Oficial de la Federación el 14 de mayo de 2026. Los salarios mínimos utilizados
          corresponden a los vigentes desde el 1 de enero de 2026.
        </p>
        <p>
          El resultado mostrado no constituye una asesoría legal ni un dictamen vinculante. Antes
          de tomar decisiones legales, financieras o laborales, te recomendamos consultar con un
          abogado laboral o con la autoridad correspondiente (como la Procuraduría Federal de la
          Defensa del Trabajo).
        </p>
        <p>
          Laboral Suite no almacena tus datos: todos los cálculos se realizan en tu navegador y no se
          envían a ningún servidor.
        </p>
      </div>
    </div>
  )
}
