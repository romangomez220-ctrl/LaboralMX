import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import InputField from '../../../components/InputField'
import SelectField from '../../../components/SelectField'
import Disclaimer from '../../../components/Disclaimer'
import LabsBadge from '../../components/LabsBadge'
import FeedbackModal from '../../../labs-portal/components/FeedbackModal'
import { useValidatorSession } from '../../../labs-portal/auth/useValidatorSession'
import { activityRepository } from '../../../repositories'
import { useNoIndex } from '../../useNoIndex'
import {
  REGLAS_TERMINOS,
  calcularTerminoProcesal,
  obtenerReglaTermino,
  type AjusteInicioTermino,
  type TerminosProcesalesResultado,
  type TipoDiasTermino,
} from '../core/terminosProcesales'

interface FormState {
  reglaId: string
  fechaBase: string
  diasPersonalizados: string
  tipoDiasPersonalizado: TipoDiasTermino
  ajusteInicio: AjusteInicioTermino
  diasInhabilesTexto: string
  prorrogarSiVenceInhabil: boolean
}

const TOOL_ID = 'tool_terminos_procesales'
const TOOL_NAME = 'ROMANUS Términos'

const hoy = new Date().toISOString().slice(0, 10)

const ESTADO_INICIAL: FormState = {
  reglaId: 'amparo_regla_general_15',
  fechaBase: hoy,
  diasPersonalizados: '15',
  tipoDiasPersonalizado: 'habiles',
  ajusteInicio: 'dia_siguiente',
  diasInhabilesTexto: '',
  prorrogarSiVenceInhabil: true,
}

const OPCIONES_REGLA = REGLAS_TERMINOS.map((regla) => ({ value: regla.id, label: regla.nombre }))

const OPCIONES_TIPO_DIAS = [
  { value: 'habiles', label: 'Días hábiles' },
  { value: 'naturales', label: 'Días naturales' },
]

const OPCIONES_AJUSTE_INICIO = [
  { value: 'dia_siguiente', label: 'Contar desde el día siguiente' },
  { value: 'misma_fecha', label: 'Contar desde la misma fecha' },
]

function fechaLegible(fecha: string) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-MX', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function normalizarInhabiles(texto: string): string[] {
  return texto
    .split(/\n|,/)
    .map((valor) => valor.trim())
    .filter(Boolean)
}

export default function TerminosProcesalesPage() {
  useNoIndex()
  const { validador } = useValidatorSession()
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL)
  const [resultado, setResultado] = useState<TerminosProcesalesResultado | null>(null)
  const [error, setError] = useState('')
  const [feedbackAbierto, setFeedbackAbierto] = useState(false)

  useEffect(() => {
    if (!validador) return
    activityRepository.registrar({
      validadorId: validador.id,
      tipo: 'herramienta_abierta',
      herramientaId: TOOL_ID,
      duracionAproxSegundos: null,
    })
  }, [validador])

  const reglaSeleccionada = obtenerReglaTermino(form.reglaId)
  const esPersonalizado = reglaSeleccionada.id === 'personalizado'

  function actualizarRegla(reglaId: string) {
    const regla = obtenerReglaTermino(reglaId)
    setForm((prev) => ({
      ...prev,
      reglaId,
      ajusteInicio: regla.ajusteInicioDefault,
      tipoDiasPersonalizado: regla.tipoDias,
      diasPersonalizados: String(regla.dias),
    }))
    setResultado(null)
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    setError('')

    if (!form.fechaBase) {
      setError('Captura la fecha base del cómputo.')
      return
    }

    const diasPersonalizados = Number(form.diasPersonalizados)
    if (esPersonalizado && (!Number.isFinite(diasPersonalizados) || diasPersonalizados < 1)) {
      setError('El plazo personalizado debe ser de al menos 1 día.')
      return
    }

    setResultado(
      calcularTerminoProcesal({
        reglaId: form.reglaId,
        fechaBase: form.fechaBase,
        diasPersonalizados,
        tipoDiasPersonalizado: form.tipoDiasPersonalizado,
        ajusteInicio: form.ajusteInicio,
        diasInhabilesAdicionales: normalizarInhabiles(form.diasInhabilesTexto),
        prorrogarSiVenceInhabil: form.prorrogarSiVenceInhabil,
      }),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs uppercase tracking-wide text-stone">
        Jurídico Suite <span className="mx-1 text-gray-300">›</span> Términos procesales
      </p>
      <LabsBadge />

      <div>
        <h1 className="text-2xl font-bold text-primary">ROMANUS Términos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Calcula vencimientos base y deja visibles las hipótesis que el abogado debe validar.
        </p>
      </div>

      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="grid lg:grid-cols-2 gap-4">
          <SelectField
            label="Tipo de plazo"
            name="reglaId"
            value={form.reglaId}
            options={OPCIONES_REGLA}
            onChange={actualizarRegla}
          />
          <InputField
            label="Fecha base"
            name="fechaBase"
            type="date"
            value={form.fechaBase}
            onChange={(value) => setForm((prev) => ({ ...prev, fechaBase: value }))}
          />
          <SelectField
            label="Inicio del cómputo"
            name="ajusteInicio"
            value={form.ajusteInicio}
            options={OPCIONES_AJUSTE_INICIO}
            onChange={(value) => setForm((prev) => ({ ...prev, ajusteInicio: value as AjusteInicioTermino }))}
          />
          <SelectField
            label="Tipo de días"
            name="tipoDias"
            value={esPersonalizado ? form.tipoDiasPersonalizado : reglaSeleccionada.tipoDias}
            options={OPCIONES_TIPO_DIAS}
            disabled={!esPersonalizado}
            onChange={(value) => setForm((prev) => ({ ...prev, tipoDiasPersonalizado: value as TipoDiasTermino }))}
            helpText={esPersonalizado ? 'Define si el plazo corre en días hábiles o naturales.' : 'Definido por la regla seleccionada.'}
          />
          <InputField
            label="Días del plazo"
            name="diasPersonalizados"
            type="number"
            value={esPersonalizado ? form.diasPersonalizados : reglaSeleccionada.dias}
            disabled={!esPersonalizado}
            onChange={(value) => setForm((prev) => ({ ...prev, diasPersonalizados: value }))}
          />
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.prorrogarSiVenceInhabil}
              onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, prorrogarSiVenceInhabil: ev.target.checked }))
              }
            />
            Recorrer vencimiento si cae en día inhábil
          </label>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <label className="text-sm font-medium text-gray-700">Días inhábiles adicionales</label>
          <textarea
            value={form.diasInhabilesTexto}
            onChange={(ev: ChangeEvent<HTMLTextAreaElement>) => setForm((prev) => ({ ...prev, diasInhabilesTexto: ev.target.value }))}
            rows={3}
            className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="2026-07-16, 2026-09-16"
          />
          <p className="text-xs text-stone mt-1">Usa formato AAAA-MM-DD, separado por coma o por renglón.</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-700">Base jurídica capturada</p>
          <p className="text-sm text-gray-600 mt-1">{reglaSeleccionada.baseComputo}</p>
          <p className="text-xs text-stone mt-2">{reglaSeleccionada.fundamento}</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition"
          >
            Calcular término
          </button>
          {validador && (
            <button
              type="button"
              onClick={() => setFeedbackAbierto(true)}
              className="rounded-lg border border-gold text-gold-dark px-6 py-3 font-semibold hover:bg-warning-light transition"
            >
              Enviar feedback
            </button>
          )}
        </div>
      </form>

      {resultado && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-gold bg-warning-light p-5">
            <p className="text-sm uppercase tracking-wide text-warning">Vencimiento estimado</p>
            <p className="text-3xl font-bold text-primary mt-1">{fechaLegible(resultado.fechaVencimiento)}</p>
            <p className="text-sm text-gray-700 mt-2">{resultado.resumen}</p>
            {resultado.fechaVencimiento !== resultado.fechaVencimientoOriginal && (
              <p className="text-xs text-warning mt-2">
                Vencimiento original: {fechaLegible(resultado.fechaVencimientoOriginal)}.
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Línea de cómputo</p>
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-stone">
                    <tr>
                      <th className="py-2">Fecha</th>
                      <th className="py-2">Día</th>
                      <th className="py-2">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.diasComputados.map((dia) => (
                      <tr key={dia.fecha} className="border-t border-gray-100">
                        <td className="py-2 text-gray-700">{fechaLegible(dia.fecha)}</td>
                        <td className="py-2 text-gray-700">{dia.numeroDiaComputable ?? '-'}</td>
                        <td className={dia.cuenta ? 'py-2 text-success' : 'py-2 text-stone'}>{dia.razon}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-700">Fundamento y controles</p>
              <p className="text-sm text-gray-600 mt-2">{resultado.fundamento}</p>
              <ul className="text-sm text-gray-700 flex flex-col gap-2 list-disc pl-4 mt-3">
                {resultado.advertencias.map((advertencia) => (
                  <li key={advertencia}>{advertencia}</li>
                ))}
              </ul>
            </div>
          </div>

          <Disclaimer />
        </div>
      )}

      {validador && (
        <FeedbackModal
          abierto={feedbackAbierto}
          onCerrar={() => setFeedbackAbierto(false)}
          herramientaId={TOOL_ID}
          herramientaNombre={TOOL_NAME}
          validadorId={validador.id}
        />
      )}
    </div>
  )
}
