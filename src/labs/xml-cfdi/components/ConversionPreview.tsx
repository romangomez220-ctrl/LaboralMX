/**
 * components/ConversionPreview.tsx
 * -----------------------------------------------------------------------------
 * Vista de revisión antes de exportar. Solo lee del estado en memoria que ya
 * tiene el orquestador — no vuelve a tocar archivos ni hace parseo adicional.
 * -----------------------------------------------------------------------------
 */

import type { CfdiParseado } from '../core/types'

interface ConversionPreviewProps {
  resultados: CfdiParseado[]
  erroresCount: number
  onExport: () => void
}

export function ConversionPreview({ resultados, erroresCount, onExport }: ConversionPreviewProps) {
  const totalAcumulado = resultados.reduce((sum, r) => sum + (Number(r.comprobante.total) || 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-success-light px-3 py-1 text-success font-medium">
          {resultados.length} procesados correctamente
        </span>
        {erroresCount > 0 && (
          <span className="rounded-full bg-red-50 px-3 py-1 text-red-700 font-medium">
            {erroresCount} con error — ver pestaña de Errores
          </span>
        )}
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 font-medium">
          Total acumulado: ${totalAcumulado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="max-h-96 overflow-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 text-left">
            <tr>
              <th className="p-2 text-primary">Archivo</th>
              <th className="p-2 text-primary">Tipo</th>
              <th className="p-2 text-primary">Emisor</th>
              <th className="p-2 text-primary">Receptor</th>
              <th className="p-2 text-right text-primary">Total</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((r, i) => (
              <tr key={`${r.archivo}-${i}`} className="border-t border-gray-100">
                <td className="p-2 text-gray-700">{r.archivo}</td>
                <td className="p-2 text-gray-700">{r.nomina ? 'Nómina' : r.comprobante.tipoDeComprobante}</td>
                <td className="p-2 text-gray-700">{r.comprobante.emisorRfc}</td>
                <td className="p-2 text-gray-700">{r.comprobante.receptorRfc}</td>
                <td className="p-2 text-right text-gray-700">
                  ${(Number(r.comprobante.total) || 0).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onExport}
        disabled={resultados.length === 0}
        className="self-start rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Exportar a Excel
      </button>
    </div>
  )
}
