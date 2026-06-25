/**
 * ConceptoLegalCard.tsx
 * -----------------------------------------------------------------------------
 * Muestra un concepto calculado (etiqueta + monto) junto con su fórmula Y su
 * fundamento legal explícito (artículo, regla RMF, decreto). Requisito de
 * esta ronda: ningún resultado debe mostrar solo el monto sin su base legal,
 * dado que esta área será revisada por contadores, fiscalistas, abogados y
 * un secretario de tribunal colegiado.
 * -----------------------------------------------------------------------------
 */

import type { ConceptoConFundamento } from '../core/types'

function formatCurrency(n: number): string {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

export default function ConceptoLegalCard({ concepto }: { concepto: ConceptoConFundamento }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-gray-800">{concepto.etiqueta}</p>
        <p className="text-lg font-semibold text-primary whitespace-nowrap">{formatCurrency(concepto.monto)}</p>
      </div>
      <p className="text-xs text-gray-500 mt-1">{concepto.formula}</p>
      <p className="text-xs text-gold-dark mt-2 border-t border-gray-100 pt-2">
        <span className="font-semibold">Fundamento: </span>
        {concepto.fundamento}
      </p>
    </div>
  )
}
