interface DraftRecoveryNoticeProps {
  recovered: boolean
  onClear: () => void
}

export default function DraftRecoveryNotice({ recovered, onClear }: DraftRecoveryNoticeProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-ivory p-3 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
      <p>
        <strong className="text-primary">{recovered ? 'Recuperamos tu avance.' : 'Avance protegido.'}</strong>{' '}
        Se guarda únicamente en este dispositivo durante un máximo de 24 horas.
      </p>
      <button type="button" onClick={onClear} className="shrink-0 font-semibold text-primary underline decoration-gold underline-offset-4">
        Borrar datos guardados
      </button>
    </div>
  )
}
