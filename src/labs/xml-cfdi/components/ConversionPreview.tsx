import type { CfdiParseado, IncidenciaCfdi, ResumenAuditoriaCfdi } from '../core/types'

interface ConversionPreviewProps {
  resultados: CfdiParseado[]
  erroresCount: number
  incidencias: IncidenciaCfdi[]
  resumen: ResumenAuditoriaCfdi
  onExport: () => void
  pilotExportEnabled: boolean
}

const SEVERITY_STYLES = {
  critica: 'border-red-300 bg-red-50 text-red-800',
  alta: 'border-orange-300 bg-orange-50 text-orange-800',
  media: 'border-amber-300 bg-amber-50 text-amber-800',
  informativa: 'border-blue-200 bg-blue-50 text-blue-800',
} as const

function MetricCard({ label, value, tone = 'text-primary' }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className={`text-2xl font-bold ${tone}`}>{value.toLocaleString('es-MX')}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-stone">{label}</p>
    </div>
  )
}

export function ConversionPreview({
  resultados,
  erroresCount,
  incidencias,
  resumen,
  onExport,
  pilotExportEnabled,
}: ConversionPreviewProps) {
  const totalAcumulado = resultados.reduce((sum, r) => sum + (Number(r.comprobante.total) || 0), 0)
  const visibleIssues = incidencias.slice(0, 100)

  return (
    <section className="flex flex-col gap-6" aria-labelledby="audit-results-title">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Diagnóstico del lote</p>
        <h2 id="audit-results-title" className="mt-1 text-xl font-semibold text-primary">
          Documentos que requieren revisión
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Las alertas son comprobaciones automatizadas de estructura y consistencia. No sustituyen una
          validación oficial ante el SAT ni el criterio de un profesional fiscal.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Procesados" value={resumen.documentos} />
        <MetricCard label="Sin alertas" value={resumen.sinIncidencias} tone="text-success" />
        <MetricCard label="Con alertas" value={resumen.conIncidencias} tone="text-warning" />
        <MetricCard label="Críticas" value={resumen.criticas} tone="text-red-700" />
        <MetricCard label="Altas" value={resumen.altas} tone="text-orange-700" />
        <MetricCard label="UUID repetidos" value={resumen.uuidDuplicados} tone="text-red-700" />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {erroresCount > 0 && (
          <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">
            {erroresCount} archivo(s) no procesados
          </span>
        )}
        <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
          Importe acumulado: ${totalAcumulado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </span>
        <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-800">
          {resumen.medias} medias · {resumen.informativas} informativas
        </span>
      </div>

      {incidencias.length === 0 ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          No se detectaron incidencias con las reglas disponibles. Esto no acredita por sí solo la
          vigencia, cancelación o validez fiscal de los comprobantes.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <p className="font-semibold text-primary">Incidencias detectadas ({incidencias.length})</p>
            {incidencias.length > visibleIssues.length && (
              <p className="mt-1 text-xs text-stone">Se muestran las primeras {visibleIssues.length}; el reporte incluye todas.</p>
            )}
          </div>
          <div className="max-h-[32rem] divide-y divide-gray-100 overflow-auto">
            {visibleIssues.map((item) => (
              <article key={item.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLES[item.severidad]}`}>
                    {item.severidad}
                  </span>
                  <span className="font-semibold text-primary">{item.titulo}</span>
                  <code className="text-xs text-stone">{item.codigo}</code>
                </div>
                <p className="mt-1 break-all text-xs font-medium text-gray-600">{item.archivo}</p>
                <p className="mt-1 text-sm text-gray-700">{item.detalle}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gold/40 bg-ivory p-5">
        <h3 className="font-semibold text-primary">Reporte detallado del lote</h3>
        <p className="mt-1 text-sm text-gray-600">
          Incluye resumen, conceptos, nómina, archivos no procesados y todas las incidencias con su nivel de atención.
        </p>
        {pilotExportEnabled ? (
          <>
            <button
              type="button"
              onClick={onExport}
              disabled={resultados.length === 0}
              className="mt-4 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              Descargar reporte de validación
            </button>
            <p className="mt-2 text-xs text-stone">
              Descarga incluida únicamente para validadores de ROMANUS Labs. La versión pública tendrá diagnóstico gratuito y reporte completo de pago.
            </p>
          </>
        ) : (
          <p className="mt-4 rounded-lg bg-white p-3 text-sm font-medium text-primary">
            La descarga completa estará disponible mediante pago cuando finalice la validación del producto.
          </p>
        )}
      </div>
    </section>
  )
}
