const TEXTO_AVISO =
  'Esta herramienta ofrece una estimación informativa basada en prestaciones mínimas de la Ley Federal del Trabajo. No sustituye asesoría legal profesional. El resultado puede variar por contrato, prestaciones superiores, salario integrado, comisiones, bonos, sindicatos, convenio, juicio laboral o circunstancias específicas del caso.'

interface DisclaimerProps {
  compact?: boolean
}

export default function Disclaimer({ compact = false }: DisclaimerProps) {
  return (
    <div
      className={`rounded-lg border border-amber-300 bg-warning-light text-warning ${
        compact ? 'text-xs p-3' : 'text-sm p-4'
      }`}
      role="note"
    >
      <p className="font-semibold mb-1">Aviso importante</p>
      <p>{TEXTO_AVISO}</p>
    </div>
  )
}
