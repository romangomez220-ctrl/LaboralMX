const AVISOS = {
  laboral:
    'Importante: Los resultados mostrados son estimaciones informativas calculadas con base en los datos proporcionados por el usuario y la legislación laboral vigente aplicable. Los importes pueden variar dependiendo de impuestos, retenciones, cuotas de seguridad social, prestaciones contractuales, convenios, políticas internas de la empresa u otras circunstancias particulares del caso concreto. Esta herramienta no sustituye asesoría jurídica profesional.',
  juridico:
    'Importante: Los resultados mostrados son orientativos y dependen de los datos proporcionados por el usuario, la autoridad competente, la legislación aplicable, criterios judiciales vigentes y circunstancias particulares del caso concreto. Esta herramienta no sustituye la revisión profesional de un abogado ni la consulta directa de expedientes, acuerdos, notificaciones o calendarios oficiales.',
}

interface DisclaimerProps {
  compact?: boolean
  variante?: keyof typeof AVISOS
}

export default function Disclaimer({ compact = false, variante = 'laboral' }: DisclaimerProps) {
  return (
    <div
      className={`rounded-lg border border-amber-300 bg-warning-light text-warning ${
        compact ? 'text-xs p-3' : 'text-sm p-4'
      }`}
      role="note"
    >
      <p className="font-semibold mb-1">Aviso importante</p>
      <p>{AVISOS[variante]}</p>
    </div>
  )
}
