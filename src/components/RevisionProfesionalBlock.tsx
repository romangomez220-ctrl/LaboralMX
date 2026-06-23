export default function RevisionProfesionalBlock() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="font-semibold text-primary text-lg mb-2">
        ¿Tu resultado no coincide con la propuesta de tu empresa?
      </h3>
      <p className="text-sm text-gray-600 mb-2">
        Esta herramienta proporciona una estimación basada en la información capturada. Las
        circunstancias particulares de cada relación laboral pueden modificar el resultado final.
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Si consideras que tu caso requiere una revisión más detallada, próximamente podrás
        solicitar orientación profesional a través de ROMANUS.
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          disabled
          className="rounded-lg border-2 border-primary text-primary px-5 py-2.5 font-semibold cursor-not-allowed opacity-90"
        >
          Solicitar revisión profesional
        </button>
        <span className="text-xs font-semibold text-gold-dark uppercase tracking-widest border border-gold rounded-full px-3 py-1">
          Próximamente
        </span>
      </div>
    </div>
  )
}
