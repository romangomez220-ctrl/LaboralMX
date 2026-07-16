import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import ResultCard from '../components/ResultCard'
import Disclaimer from '../components/Disclaimer'
import RevisionProfesionalBlock from '../components/RevisionProfesionalBlock'
import ExplicacionCalculo from '../components/ExplicacionCalculo'
import ResultConfidenceStamp from '../components/ResultConfidenceStamp'
import ResultFeedback from '../components/ResultFeedback'
import { generarPDF, type DatoCapturado } from '../utils/pdfGenerator'
import { registrarError } from '../utils/errorLogger'
import { formatCurrency } from '../utils/formatCurrency'
import { trackResultAction, trackResultViewed } from '../utils/analytics'
import { WHATSAPP_BUSINESS_LINK } from '../config/contacto'
import type { ResultadoCalculo } from '../types/labor'

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const estadoNavegacion = location.state as { resultado?: ResultadoCalculo; datosCapturados?: DatoCapturado[] } | null
  const resultado = estadoNavegacion?.resultado
  const datosCapturados = estadoNavegacion?.datosCapturados ?? []
  const [copiado, setCopiado] = useState(false)
  const [errorCopiar, setErrorCopiar] = useState(false)
  const [errorPDF, setErrorPDF] = useState(false)
  const [errorCompartir, setErrorCompartir] = useState(false)
  const [fechaGeneracion] = useState(() => new Date())

  useEffect(() => {
    if (resultado) trackResultViewed(resultado.tipo)
  }, [resultado])

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

  async function copiarResultado() {
    if (!resultado) return
    const lineas = [
      `Laboral Suite — ${resultado.tipo === 'finiquito' ? 'Finiquito' : 'Liquidación'} estimado`,
      `Salario capturado: ${formatCurrency(resultado.salarioBase)} (${resultado.tipoSalario === 'diario' ? 'diario' : 'mensual'})`,
      `Salario diario usado: ${formatCurrency(resultado.salarioDiario)}`,
      `Antigüedad: ${resultado.antiguedadTexto}`,
      ...resultado.conceptos.map((c) => `${c.etiqueta}: ${formatCurrency(c.monto)}`),
      `Total estimado: ${formatCurrency(resultado.totalEstimado)}`,
    ]
    if (resultado.primaAntiguedadInformativa) {
      lineas.push(
        `${resultado.primaAntiguedadInformativa.etiqueta} (informativo, no incluido en el total): ${formatCurrency(resultado.primaAntiguedadInformativa.monto)}`,
      )
    }
    if (resultado.veinteDiasInformativo) {
      lineas.push(
        `${resultado.veinteDiasInformativo.etiqueta}: ${formatCurrency(resultado.veinteDiasInformativo.monto)}`,
      )
    }
    lineas.push('Estimación informativa, no asesoría legal.')

    try {
      setErrorCopiar(false)
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(lineas.join('\n'))
      trackResultAction(resultado.tipo, 'copy')
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (error) {
      registrarError(error as Error, 'copiarResultado')
      setErrorCopiar(true)
    }
  }

  async function compartirResultado() {
    if (!resultado) return
    const texto = `Mi ${resultado.tipo} estimado en ROMANUS es ${formatCurrency(resultado.totalEstimado)}. Estimación informativa con metodología visible.`
    try {
      setErrorCompartir(false)
      if (navigator.share) {
        await navigator.share({
          title: `Resultado de ${resultado.tipo} — ROMANUS`,
          text: texto,
          url: resultado.tipo === 'finiquito'
            ? `${window.location.origin}/calcular-finiquito`
            : `${window.location.origin}/calcular-liquidacion`,
        })
      } else {
        if (!navigator.clipboard) throw new Error('Share and clipboard APIs unavailable')
        await navigator.clipboard.writeText(texto)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      }
      trackResultAction(resultado.tipo, 'share')
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        registrarError(error as Error, 'compartirResultado')
        setErrorCompartir(true)
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="overflow-hidden rounded-2xl border border-gold/60 bg-gradient-to-br from-white via-ivory to-success-light p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Tu resultado</p>
            <h1 className="mt-1 text-2xl font-bold text-primary sm:text-3xl">
              {resultado.tipo === 'finiquito' ? 'Finiquito estimado' : 'Liquidación estimada'}
            </h1>
            <p className="mt-4 text-4xl font-bold tracking-tight text-success sm:text-5xl" aria-label={`Total estimado ${formatCurrency(resultado.totalEstimado)}`}>
              {formatCurrency(resultado.totalEstimado)}
            </p>
            <p className="mt-2 max-w-xl text-sm text-gray-600">
              Esta cantidad se calculó con los datos que capturaste. Revisa el desglose y los supuestos antes de tomar una decisión.
            </p>
          </div>
          <ResultConfidenceStamp generatedAt={fechaGeneracion} />
        </div>
        <div className="romanus-result-rule mt-5" aria-hidden="true" />
      </section>

      <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-4">
        <p>
          <span className="font-semibold">Salario capturado:</span>{' '}
          {formatCurrency(resultado.salarioBase)} ({resultado.tipoSalario === 'diario' ? 'diario' : 'mensual'})
        </p>
        <p>
          <span className="font-semibold">Salario diario usado:</span>{' '}
          {formatCurrency(resultado.salarioDiario)}
          {resultado.tipoSalario === 'mensual' && ' (mensual ÷ 30)'}
        </p>
        <p>
          <span className="font-semibold">Antigüedad:</span> {resultado.antiguedadTexto}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {resultado.conceptos.map((c, i) => (
          <ResultCard key={i} etiqueta={c.etiqueta} monto={c.monto} detalle={c.detalle} formula={c.formula} />
        ))}
      </div>

      {resultado.primaAntiguedadInformativa && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-stone uppercase tracking-wide">
            Concepto informativo — no incluido en el total principal
          </p>
          <ResultCard
            etiqueta={resultado.primaAntiguedadInformativa.etiqueta}
            monto={resultado.primaAntiguedadInformativa.monto}
            formula={resultado.primaAntiguedadInformativa.formula}
            variant="info"
          />
        </div>
      )}

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

      {errorPDF && (
        <div className="rounded-lg border border-amber-300 bg-warning-light text-warning text-sm p-3">
          No se pudo generar el PDF en este momento. Puedes usar "Copiar resultado" mientras
          tanto; el equipo de ROMANUS ya quedó notificado de este error.
        </div>
      )}

      {errorCopiar && (
        <div role="alert" className="rounded-lg border border-amber-300 bg-warning-light text-warning text-sm p-3">
          Tu navegador no permitió copiar automáticamente. Puedes descargar el PDF o mantener
          presionado el texto del resultado para copiarlo manualmente.
        </div>
      )}

      {errorCompartir && (
        <div role="alert" className="rounded-lg border border-amber-300 bg-warning-light p-3 text-sm text-warning">
          Tu navegador no permitió compartir. Puedes usar “Copiar resultado” o descargar el PDF.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={compartirResultado}
          className="min-h-12 rounded-lg bg-primary px-5 py-2 font-semibold text-white transition hover:bg-primary-light"
        >
          Compartir resultado
        </button>
        <button
          onClick={copiarResultado}
          className="min-h-12 rounded-lg border-2 border-primary px-5 py-2 font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          {copiado ? 'Copiado ✓' : 'Copiar resultado'}
        </button>
        <button
          onClick={() => {
            // generarPDF() es una llamada imperativa desde un event handler:
            // un Error Boundary NO puede capturar errores aquí (solo
            // captura errores de render), así que necesita su propio
            // try/catch para no dejar un error sin registrar ni mostrar.
            try {
              setErrorPDF(false)
              generarPDF(resultado, datosCapturados)
              trackResultAction(resultado.tipo, 'download_pdf')
            } catch (error) {
              registrarError(error as Error, 'pdfGenerator')
              setErrorPDF(true)
            }
          }}
          className="min-h-12 rounded-lg border-2 border-primary px-5 py-2 font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          Descargar PDF
        </button>
        <button
          onClick={() => {
            trackResultAction(resultado.tipo, 'new_calculation')
            navigate(
              resultado.tipo === 'finiquito'
                ? '/productos/laboralmx/finiquito'
                : '/productos/laboralmx/liquidacion',
            )
          }}
          className="min-h-12 rounded-lg border border-gray-300 bg-white px-5 py-2 font-semibold text-primary transition hover:border-primary"
        >
          Nuevo cálculo
        </button>
      </div>

      <RevisionProfesionalBlock calculator={resultado.tipo} />

      <ResultFeedback calculator={resultado.tipo} />

      <aside className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <p className="font-semibold text-primary">¿Detectaste un dato extraño o un problema técnico?</p>
        <p className="mt-1">Repórtalo sin compartir información sensible. Tu comentario nos ayuda a mejorar ROMANUS.</p>
        <a
          href={WHATSAPP_BUSINESS_LINK}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackResultAction(resultado.tipo, 'report_problem')}
          className="mt-3 inline-block font-semibold text-primary underline decoration-gold underline-offset-4"
        >
          Reportar un problema
        </a>
      </aside>
    </div>
  )
}
