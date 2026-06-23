import { useState, type FormEvent } from 'react'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import Disclaimer from '../components/Disclaimer'
import RevisionProfesionalBlock from '../components/RevisionProfesionalBlock'
import { calcularVacacionesEstimadas } from '../utils/laborCalculations'
import { aNumero } from '../utils/numericInput'
import type { ResultadoVacacionesEstimadas, VacacionesFormData } from '../types/labor'

// Salario mensual y días disfrutados se capturan como texto; se
// convierten a number solo al calcular, para evitar el bug de ceros a
// la izquierda y permitir que el campo quede vacío mientras se escribe.
interface VacacionesFormState {
  fechaIngreso: string
  salarioMensual: string
  diasDisfrutados: string
}

const ESTADO_INICIAL: VacacionesFormState = {
  fechaIngreso: '',
  salarioMensual: '',
  diasDisfrutados: '',
}

export default function VacacionesCalculator() {
  const [form, setForm] = useState<VacacionesFormState>(ESTADO_INICIAL)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [resultado, setResultado] = useState<ResultadoVacacionesEstimadas | null>(null)

  function actualizar<K extends keyof VacacionesFormState>(campo: K, valor: VacacionesFormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (!form.fechaIngreso) e.fechaIngreso = 'Indica la fecha de ingreso.'
    if (form.fechaIngreso && new Date(form.fechaIngreso) > new Date()) {
      e.fechaIngreso = 'La fecha de ingreso no puede ser futura.'
    }
    if (form.salarioMensual.trim() === '') {
      e.salarioMensual = 'Indica el salario mensual.'
    } else if (aNumero(form.salarioMensual) <= 0) {
      e.salarioMensual = 'El salario mensual debe ser mayor a 0.'
    }
    if (form.diasDisfrutados.trim() !== '' && aNumero(form.diasDisfrutados) < 0) {
      e.diasDisfrutados = 'Los días disfrutados no pueden ser negativos.'
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    if (!validar()) return
    const datosParaCalcular: VacacionesFormData = {
      fechaIngreso: form.fechaIngreso,
      salarioMensual: aNumero(form.salarioMensual),
      diasDisfrutados: aNumero(form.diasDisfrutados),
    }
    setResultado(calcularVacacionesEstimadas(datosParaCalcular))
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Vacaciones y prima vacacional</h1>
        <p className="text-sm text-gray-500 mt-1">
          Los días que te corresponden se calculan según tu antigüedad laboral (el año que estás
          cursando desde tu último aniversario), no por año calendario.
        </p>
      </div>

      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Fecha de ingreso"
            name="fechaIngreso"
            type="date"
            value={form.fechaIngreso}
            onChange={(v) => actualizar('fechaIngreso', v)}
            error={errores.fechaIngreso}
          />
          <InputField
            label="Salario mensual (MXN)"
            name="salarioMensual"
            type="number"
            placeholder="0.00"
            value={form.salarioMensual}
            onChange={(v) => actualizar('salarioMensual', v)}
            error={errores.salarioMensual}
          />
          <InputField
            label="Días de vacaciones ya disfrutados"
            name="diasDisfrutados"
            type="number"
            placeholder="0"
            value={form.diasDisfrutados}
            onChange={(v) => actualizar('diasDisfrutados', v)}
            error={errores.diasDisfrutados}
          />
        </div>

        <Disclaimer compact />

        <button
          type="submit"
          className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition self-start"
        >
          Calcular vacaciones
        </button>
      </form>

      {resultado && (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-4">
            <p>
              <span className="font-semibold">Antigüedad laboral:</span> {resultado.antiguedadTexto}
            </p>
          </div>

          <ResultCard etiqueta="Salario diario" monto={resultado.salarioDiario} formula="Salario mensual ÷ 30" />

          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <p>
              Días de vacaciones que te corresponden este año laboral:{' '}
              <span className="font-semibold">{resultado.diasVacacionesCorrespondientes}</span>
            </p>
            <p className="mt-1">
              Días ya disfrutados: <span className="font-semibold">{resultado.diasDisfrutados}</span>
            </p>
            <p className="mt-1 text-primary font-semibold">
              Días pendientes: {resultado.diasPendientes}
            </p>
          </div>

          <ResultCard
            etiqueta="Valor de los días pendientes"
            monto={resultado.valorPendiente}
            formula="Días pendientes × salario diario"
          />
          <ResultCard
            etiqueta="Prima vacacional (25%)"
            monto={resultado.primaVacacional}
            formula="Valor de los días pendientes × 25%"
          />
          <ResultCard etiqueta="Total estimado" monto={resultado.totalEstimado} variant="total" />

          <RevisionProfesionalBlock />

          <Disclaimer />
        </div>
      )}
    </div>
  )
}
