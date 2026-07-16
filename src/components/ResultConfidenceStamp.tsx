interface ResultConfidenceStampProps {
  generatedAt: Date
}

export default function ResultConfidenceStamp({ generatedAt }: ResultConfidenceStampProps) {
  const fecha = generatedAt.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="inline-flex max-w-full items-center gap-3 rounded-lg border border-primary/30 bg-white/80 px-3 py-2 text-left text-primary">
      <span className="font-display text-base font-semibold tracking-widest" aria-hidden="true">R</span>
      <span className="h-7 w-px bg-primary/20" aria-hidden="true" />
      <span>
        <span className="block text-[10px] font-bold uppercase tracking-widest">Cálculo estimado</span>
        <span className="block text-[10px] text-gray-500">Metodología visible · {fecha}</span>
      </span>
    </div>
  )
}
