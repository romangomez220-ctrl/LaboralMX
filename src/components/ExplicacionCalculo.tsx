import type { ResultadoCalculo } from '../types/labor'
import { formatCurrency } from '../utils/formatCurrency'

interface DatoCapturado {
  etiqueta: string
  valor: string
}

interface ExplicacionCalculoProps {
  resultado: ResultadoCalculo
  datosCapturados?: DatoCapturado[]
}

/**
 * Sección opcional (colapsada por defecto) para que un abogado o usuario
 * pueda verificar paso a paso de dónde sale cada cifra: datos capturados,
 * fórmula de cada concepto y el salario diario/antigüedad utilizados.
 * No agrega ningún cálculo nuevo: reutiliza los datos que ya vienen en
 * `resultado` (conceptos[].formula/detalle), solo cambia cómo se
 * presentan.
 */
export default function ExplicacionCalculo({ resultado, datosCapturados = [] }: ExplicacionCalculoProps) {
  return (
    <details className="rounded-lg border border-gray-200 bg-white p-4 group">
      <summary className="cursor-pointer font-semibold text-primary list-none flex items-center justify-between">
        ¿Cómo se calculó este resultado?
        <span className="text-gray-400 text-sm group-open:rotate-180 transition">▾</span>
      </summary>

      <div className="mt-4 flex flex-col gap-4 text-sm text-gray-700">
        {datosCapturados.length > 0 && (
          <div>
            <p className="font-semibold text-gray-800 mb-1">Datos capturados</p>
            <ul className="grid sm:grid-cols-2 gap-1 text-gray-600">
              {datosCapturados.map((d) => (
                <li key={d.etiqueta}>
                  <span className="text-gray-500">{d.etiqueta}:</span> {d.valor}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="font-semibold text-gray-800 mb-1">Base del cálculo</p>
          <p className="text-gray-600">
            Salario diario utilizado: {formatCurrency(resultado.salarioDiario)} · Antigüedad
            calculada: {resultado.antiguedadTexto}
          </p>
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-1">Conceptos y fórmulas aplicadas</p>
          <ul className="flex flex-col gap-2">
            {resultado.conceptos.map((c, i) => (
              <li key={i} className="border-l-2 border-gray-200 pl-3">
                <p className="text-gray-800 font-medium">
                  {c.etiqueta} — {formatCurrency(c.monto)}
                </p>
                {c.detalle && <p className="text-xs text-gray-500">{c.detalle}</p>}
                {c.formula && <p className="text-xs text-gray-500 italic">Fórmula: {c.formula}</p>}
              </li>
            ))}
            {resultado.veinteDiasInformativo && (
              <li className="border-l-2 border-amber-300 pl-3">
                <p className="text-gray-800 font-medium">
                  {resultado.veinteDiasInformativo.etiqueta} —{' '}
                  {formatCurrency(resultado.veinteDiasInformativo.monto)}
                </p>
                {resultado.veinteDiasInformativo.formula && (
                  <p className="text-xs text-gray-500 italic">
                    Fórmula: {resultado.veinteDiasInformativo.formula}
                  </p>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </details>
  )
}
