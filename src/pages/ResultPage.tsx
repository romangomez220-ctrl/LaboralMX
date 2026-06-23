import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import ResultCard from '../components/ResultCard'
import Disclaimer from '../components/Disclaimer'
import RevisionProfesionalBlock from '../components/RevisionProfesionalBlock'
import ExplicacionCalculo from '../components/ExplicacionCalculo'
import { generarPDF, type DatoCapturado } from '../utils/pdfGenerator'
import { formatCurrency } from '../utils/formatCurrency'
import type { ResultadoCalculo } from '../types/labor'

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const estadoNavegacion = location.state as { resultado?: ResultadoCalculo; datosCapturados?: DatoCapturado[] } | null
  const resultado = estadoNavegacion?.resultado
  const datosCapturados = estadoNavegacion?.datosCapturados ?? []
  const [copiado, setCopiado] = useState(false)

  if (!resultado) {
    return (
      <div className="flex flex-col gap-4 items-start">
        <p className="text-gray-700">No hay un resultado para mostrar. Realiza un cálculo primero.</p>
        <Link
          to="/productos/laboralmx"
          className="rounded-lg bg-primary text-white px-5 py-2 font-semibold hover:bg-primary-light transition"
        >
          Ir al inicio
        </Link>
      </div>
    )
  }

  function copiarResultado() {
    if (!resultado) return
    const lineas = [
      `Laboral Suite — ${resultado.tipo === 'finiquito' ? 'Finiquito' : 'Liquidación'} estimado`,
      `Salario diario: ${formatCurrency(resultado.salarioDiario)}`,
      `Antigüedad: ${resultado.antiguedadTexto}`,
      ...resultado.conceptos.map((c) => `${c.etiqueta}: ${formatCurrency(c.monto)}`),
      `Total estimado: ${formatCurrency(resultado.totalEstimado)}`,
    ]
    if (resultado.veinteDiasInformativo) {
      lineas.push(
        `${resultado.veinteDiasInformativo.etiqueta}: ${formatCurrency(resultado.veinteDiasInformativo.monto)}`,
      )
    }
    lineas.push('Estimación informativa, no asesoría legal.')

    navigator.clipboard.writeText(lineas.join('\n')).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-primary">
        Resultado {resultado.tipo === 'finiquito' ? 'de Finiquito' : 'de Liquidación'}
      </h1>

      <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-4">
        <p>
          <span className="font-semibold">Salario diario:</span>{' '}
          {formatCurrency(resultado.salarioDiario)}
        </p>
        <p>
          <span className="font-semibold">Antigüedad:</span> {resultado.antiguedadTexto}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {resultado.conceptos.map((c, i) => (
          <ResultCard key={i} etiqueta={c.etiqueta} monto={c.monto} detalle={c.detalle} formula={c.formula} />
        ))}
        <ResultCard etiqueta="Total estimado" monto={resultado.totalEstimado} variant="total" />
      </div>

      {resultado.veinteDiasInformativo && (
        <div className="flex flex-col gap-3">
          <ResultCard
            etiqueta={resultado.veinteDiasInformativo.etiqueta}
            monto={resultado.veinteDiasInformativo.monto}
            formula={resultado.veinteDiasInformativo.formula}
            variant="info"
          />
          {resultado.totalConEscenarioInformativo !== undefined && (
            <ResultCard
              etiqueta="Total con escenario informativo"
              monto={resultado.totalConEscenarioInformativo}
              variant="info"
            />
          )}
        </div>
      )}

      {resultado.notas.length > 0 && (
        <div className="flex flex-col gap-2">
          {resultado.notas.map((n, i) => (
            <div
              key={i}
              className="rounded-lg border border-amber-300 bg-warning-light text-warning text-sm p-3"
            >
              {n}
            </div>
          ))}
        </div>
      )}

      <ExplicacionCalculo resultado={resultado} datosCapturados={datosCapturados} />

      <Disclaimer />

      <div className="flex flex-wrap gap-3">
        <button
          onClick={copiarResultado}
          className="rounded-lg border-2 border-primary text-primary px-5 py-2 font-semibold hover:bg-primary hover:text-white transition"
        >
          {copiado ? 'Copiado ✓' : 'Copiar resultado'}
        </button>
        <button
          onClick={() => generarPDF(resultado, datosCapturados)}
          className="rounded-lg border-2 border-primary text-primary px-5 py-2 font-semibold hover:bg-primary hover:text-white transition"
        >
          Descargar PDF
        </button>
        <button
          onClick={() =>
            navigate(
              resultado.tipo === 'finiquito'
                ? '/productos/laboralmx/finiquito'
                : '/productos/laboralmx/liquidacion',
            )
          }
          className="rounded-lg bg-primary text-white px-5 py-2 font-semibold hover:bg-primary-light transition"
        >
          Nuevo cálculo
        </button>
      </div>

      <RevisionProfesionalBlock />
    </div>
  )
}
