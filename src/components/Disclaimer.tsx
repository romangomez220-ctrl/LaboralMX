import { LABOR_DISCLAIMER } from '../reports/legalContent'

const AVISOS = {
  laboral: LABOR_DISCLAIMER,
  juridico:
    'Importante: Los resultados mostrados son orientativos y dependen de los datos proporcionados por el usuario, la autoridad competente, la legislación aplicable, criterios judiciales vigentes y circunstancias particulares del caso concreto. Esta herramienta no sustituye la revisión profesional de un abogado ni la consulta directa de expedientes, acuerdos, notificaciones o calendarios oficiales.',
  fiscal:
    'Importante: Los resultados son estimaciones informativas basadas en los datos proporcionados y las disposiciones fiscales indicadas en cada herramienta. Pueden variar por CFDI, retenciones, acreditamientos, estímulos, reglas vigentes y circunstancias del contribuyente. Verifica la información precargada por el SAT y consulta a un profesional antes de presentar o corregir una declaración.',
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
