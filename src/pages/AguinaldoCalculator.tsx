import { useState, type FormEvent } from 'react'
import InputField from '../components/InputField'
import ResultCard from '../components/ResultCard'
import Disclaimer from '../components/Disclaimer'
import { calcularAguinaldoEstimado } from '../utils/laborCalculations'
import type { AguinaldoFormData, ResultadoAguinaldoEstimado } from '../types/labor'

const ESTADO_INICIAL: AguinaldoFormData = {
  fechaIngreso: '',
  salarioMensual: 0,
}

export default function AguinaldoCalculator() {
  const [form, setForm] = useState<AguinaldoFormData>(ESTADO_INICIAL)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [resultado, setResultado] = useState<ResultadoAguinaldoEstimado | null>(null)

  function actualizar<K extends keyof AguinaldoFormData>(campo: K, valor: AguinaldoFormData[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (!form.fechaIngreso) e.fechaIngreso = 'Indica la fecha de ingreso.'
    if (form.fechaIngreso && new Date(form.fechaIngreso) > new Date()) {
      e.fechaIngreso = 'La fecha de ingreso no puede ser futura.'
    }
    if (!form.salarioMensual || form.salarioMensual <= 0) {
      e.salarioMensual = 'El salario mensual debe ser mayor a 0.'
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    if (!validar()) return
    setResultado(calcularAguinaldoEstimado(form))
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Calculadora de Aguinaldo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Captura tu fecha de ingreso y salario para estimar tu aguinaldo.
        </p>
      </div>

      <div className="rounded-lg border border-amber-300 bg-warning-light text-warning text-sm p-3">
        Este resultado es una <span className="font-semibold">proyección al 31 de diciembre del
        año en curso</span>, asumiendo que sigues laborando hasta esa fecha. No es el aguinaldo ya
        generado a la fecha de hoy.
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
            min={0}
            step={0.01}
            value={form.salarioMensual}
            onChange={(v) => actualizar('salarioMensual', Number(v))}
            error={errores.salarioMensual}
          />
        </div>

        <Disclaimer compact />

        <button
          type="submit"
          className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition self-start"
        >
          Calcular aguinaldo
        </button>
      </form>

      {resultado && (
        <div className="flex flex-col gap-3">
          <ResultCard etiqueta="Salario diario" monto={resultado.salarioDiario} formula="Salario mensual ÷ 30" />
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <p>
              Días computados para el aguinaldo:{' '}
              <span className="font-semibold">{resultado.diasComputados}</span>
            </p>
            <p className="mt-1 text-gray-500">Proyección al {resultado.fechaCorte}</p>
          </div>
          <ResultCard
            etiqueta="Aguinaldo estimado"
            monto={resultado.aguinaldoEstimado}
            variant="total"
            detalle={`Proyectado al ${resultado.fechaCorte}, si continúas laborando hasta esa fecha`}
            formula="15 días × salario diario × (días computados ÷ 365)"
          />
        </div>
      )}
    </div>
  )
}
