import { useState, type FormEvent } from 'react'
import InputField from '../components/InputField'
import SalarioCapturaField from '../components/SalarioCapturaField'
import ResultCard from '../components/ResultCard'
import Disclaimer from '../components/Disclaimer'
import RevisionProfesionalBlock from '../components/RevisionProfesionalBlock'
import { calcularSDI } from '../utils/laborCalculations'
import { aNumero } from '../utils/numericInput'
import type { ResultadoSDI, SDIFormData, TipoCapturaSalarial } from '../types/labor'

// Salario se captura como texto (no number) para que el campo pueda
// quedar vacío mientras el usuario escribe y no muestre ceros a la
// izquierda. Se convierte a number solo al calcular.
interface SDIFormState {
  fechaIngreso: string
  tipoSalario: TipoCapturaSalarial
  salarioBase: string
}

const ESTADO_INICIAL: SDIFormState = {
  fechaIngreso: '',
  tipoSalario: 'diario',
  salarioBase: '',
}

export default function SDICalculator() {
  const [form, setForm] = useState<SDIFormState>(ESTADO_INICIAL)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [resultado, setResultado] = useState<ResultadoSDI | null>(null)

  function actualizar<K extends keyof SDIFormState>(campo: K, valor: SDIFormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (!form.fechaIngreso) e.fechaIngreso = 'Indica la fecha de ingreso.'
    if (form.fechaIngreso && new Date(form.fechaIngreso) > new Date()) {
      e.fechaIngreso = 'La fecha de ingreso no puede ser futura.'
    }
    if (form.salarioBase.trim() === '') {
      e.salarioBase = form.tipoSalario === 'diario' ? 'Indica el salario diario.' : 'Indica el salario mensual.'
    } else if (aNumero(form.salarioBase) <= 0) {
      e.salarioBase = 'El salario debe ser mayor a 0.'
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    if (!validar()) return
    const datosParaCalcular: SDIFormData = {
      fechaIngreso: form.fechaIngreso,
      salarioBase: aNumero(form.salarioBase),
      tipoSalario: form.tipoSalario,
    }
    setResultado(calcularSDI(datosParaCalcular))
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Salario Diario Integrado (SDI)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Estimación con prestaciones mínimas de ley, calculada a la fecha de hoy.
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
          <SalarioCapturaField
            tipoSalario={form.tipoSalario}
            salarioBase={form.salarioBase}
            onTipoSalarioChange={(v) => actualizar('tipoSalario', v)}
            onSalarioBaseChange={(v) => actualizar('salarioBase', v)}
            error={errores.salarioBase}
          />
        </div>

        <Disclaimer compact />

        <button
          type="submit"
          className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition self-start"
        >
          Calcular SDI
        </button>
      </form>

      {resultado && (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-4">
            <p>
              <span className="font-semibold">Antigüedad:</span> {resultado.antiguedadTexto}
            </p>
          </div>

          <ResultCard
            etiqueta="Salario diario usado"
            monto={resultado.salarioDiario}
            detalle={
              resultado.tipoSalario === 'diario'
                ? 'Capturado directamente como salario diario'
                : `Convertido desde $${resultado.salarioBase} mensual ÷ 30`
            }
            formula={resultado.tipoSalario === 'diario' ? 'Salario diario capturado' : 'Salario mensual ÷ 30'}
          />
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <p>
              Días de vacaciones aplicados (según tu antigüedad ya cumplida):{' '}
              <span className="font-semibold">{resultado.diasVacacionesAplicados}</span>
            </p>
            <p className="mt-1">
              Factor de integración: <span className="font-semibold">{resultado.factorIntegracion.toFixed(4)}</span>
            </p>
          </div>
          <ResultCard
            etiqueta="Salario Diario Integrado (SDI)"
            monto={resultado.sdi}
            variant="total"
            formula="Salario diario × factor de integración"
          />

          <div className="rounded-lg border border-amber-300 bg-warning-light text-warning text-sm p-3">
            Este SDI es una estimación con prestaciones mínimas de ley. No incluye bonos,
            comisiones u otras percepciones variables, y no aplica el tope de 25 UMA del salario
            base de cotización.
          </div>

          <RevisionProfesionalBlock />

          <Disclaimer />
        </div>
      )}
    </div>
  )
}
