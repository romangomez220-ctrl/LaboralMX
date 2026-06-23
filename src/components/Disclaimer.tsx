const TEXTO_AVISO =
  'Importante: Los resultados mostrados son estimaciones informativas calculadas con base en los datos proporcionados por el usuario y la legislación laboral vigente aplicable. Los importes pueden variar dependiendo de impuestos, retenciones, cuotas de seguridad social, prestaciones contractuales, convenios, políticas internas de la empresa u otras circunstancias particulares del caso concreto. Esta herramienta no sustituye asesoría jurídica profesional.'

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
