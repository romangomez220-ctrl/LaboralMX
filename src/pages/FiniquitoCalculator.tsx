import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import SelectField from '../components/SelectField'
import SalarioCapturaField from '../components/SalarioCapturaField'
import Disclaimer from '../components/Disclaimer'
import FiniquitoVsLiquidacion from '../components/FiniquitoVsLiquidacion'
import { calcularFiniquito } from '../utils/laborCalculations'
import { aNumero } from '../utils/numericInput'
import type { FiniquitoFormData, TipoCapturaSalarial, ZonaSalarioMinimo } from '../types/labor'

// Estado de captura del formulario: los campos numéricos se manejan como
// texto mientras el usuario escribe (nunca como number), para que el
// campo pueda quedar vacío temporalmente y no aparezcan ceros a la
// izquierda como "0666". Solo se convierten a number al calcular, con
// aNumero(), justo antes de llamar a calcularFiniquito.
interface FiniquitoFormState {
  fechaIngreso: string
  fechaSalida: string
  tipoSalario: TipoCapturaSalarial
  salarioBase: string
  diasPendientes: string
  vacacionesDisfrutadas: string
  renunciaVoluntaria: boolean
  incluirPrimaAntiguedad: boolean
  zonaSalarioMinimo: ZonaSalarioMinimo
}

const ESTADO_INICIAL: FiniquitoFormState = {
  fechaIngreso: '',
  fechaSalida: '',
  tipoSalario: 'diario',
  salarioBase: '',
  diasPendientes: '',
  vacacionesDisfrutadas: '',
  renunciaVoluntaria: true,
  incluirPrimaAntiguedad: true,
  zonaSalarioMinimo: 'general',
}

const SI_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
]

const ZONAS_SALARIO_MINIMO = [
  { value: 'general', label: 'Resto del país' },
  { value: 'frontera_norte', label: 'Zona Libre de la Frontera Norte' },
]

export default function FiniquitoCalculator() {
  const [form, setForm] = useState<FiniquitoFormState>(ESTADO_INICIAL)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  function actualizar<K extends keyof FiniquitoFormState>(campo: K, valor: FiniquitoFormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function validar(): boolean {
    const e: Record<string, string> = {}

    if (!form.fechaIngreso) e.fechaIngreso = 'Indica la fecha de ingreso.'
    if (!form.fechaSalida) e.fechaSalida = 'Indica la fecha de salida.'
    if (
      form.fechaIngreso &&
      form.fechaSalida &&
      new Date(form.fechaSalida) < new Date(form.fechaIngreso)
    ) {
      e.fechaSalida = 'La fecha de salida no puede ser anterior a la fecha de ingreso.'
    }

    if (form.salarioBase.trim() === '') {
      e.salarioBase = form.tipoSalario === 'diario' ? 'Indica el salario diario.' : 'Indica el salario mensual.'
    } else if (aNumero(form.salarioBase) <= 0) {
      e.salarioBase = 'El salario debe ser mayor a 0.'
    }

    if (form.diasPendientes.trim() !== '' && aNumero(form.diasPendientes) < 0) {
      e.diasPendientes = 'Los días pendientes no pueden ser negativos.'
    }
    if (form.vacacionesDisfrutadas.trim() !== '' && aNumero(form.vacacionesDisfrutadas) < 0) {
      e.vacacionesDisfrutadas = 'Las vacaciones disfrutadas no pueden ser negativas.'
    }

    setErrores(e)
    return Object.keys(e).length === 0
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    if (!validar()) return

    const datosParaCalcular: FiniquitoFormData = {
      fechaIngreso: form.fechaIngreso,
      fechaSalida: form.fechaSalida,
      salarioBase: aNumero(form.salarioBase),
      tipoSalario: form.tipoSalario,
      diasPendientes: aNumero(form.diasPendientes),
      vacacionesDisfrutadas: aNumero(form.vacacionesDisfrutadas),
      renunciaVoluntaria: form.renunciaVoluntaria,
      incluirPrimaAntiguedad: form.incluirPrimaAntiguedad,
      zonaSalarioMinimo: form.zonaSalarioMinimo,
    }

    const resultado = calcularFiniquito(datosParaCalcular)

    const datosCapturados = [
      { etiqueta: 'Fecha de ingreso', valor: form.fechaIngreso },
      { etiqueta: 'Fecha de salida', valor: form.fechaSalida },
      {
        etiqueta: 'Salario capturado',
        valor: `$${form.salarioBase} MXN (${form.tipoSalario === 'diario' ? 'diario' : 'mensual'})`,
      },
      { etiqueta: 'Días pendientes de pago', valor: form.diasPendientes || '0' },
      { etiqueta: 'Vacaciones disfrutadas', valor: form.vacacionesDisfrutadas || '0' },
      { etiqueta: '¿Renuncia voluntaria?', valor: form.renunciaVoluntaria ? 'Sí' : 'No' },
    ]

    navigate('/productos/laboralmx/resultado', { state: { resultado, datosCapturados } })
  }

  return (
    <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Calculadora de Finiquito</h1>
        <p className="text-sm text-gray-500 mt-1">
          Captura los datos de tu relación laboral para obtener una estimación.
        </p>
      </div>

      <FiniquitoVsLiquidacion />

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
          label="Fecha de salida"
          name="fechaSalida"
          type="date"
          value={form.fechaSalida}
          onChange={(v) => actualizar('fechaSalida', v)}
          error={errores.fechaSalida}
        />
        <SalarioCapturaField
          tipoSalario={form.tipoSalario}
          salarioBase={form.salarioBase}
          onTipoSalarioChange={(v) => actualizar('tipoSalario', v)}
          onSalarioBaseChange={(v) => actualizar('salarioBase', v)}
          error={errores.salarioBase}
        />
        <InputField
          label="Días trabajados pendientes de pago"
          name="diasPendientes"
          type="number"
          placeholder="0"
          value={form.diasPendientes}
          onChange={(v) => actualizar('diasPendientes', v)}
          error={errores.diasPendientes}
        />
        <InputField
          label="Días de vacaciones disfrutados este año"
          name="vacacionesDisfrutadas"
          type="number"
          placeholder="0"
          value={form.vacacionesDisfrutadas}
          onChange={(v) => actualizar('vacacionesDisfrutadas', v)}
          error={errores.vacacionesDisfrutadas}
        />
        <SelectField
          label="¿Renuncia voluntaria?"
          name="renunciaVoluntaria"
          value={form.renunciaVoluntaria ? 'si' : 'no'}
          options={SI_NO}
          onChange={(v) => actualizar('renunciaVoluntaria', v === 'si')}
          helpText="Si tu antigüedad calculada es menor a 15 años, la ley no exige prima de antigüedad en caso de renuncia."
        />
        <SelectField
          label="¿Incluir prima de antigüedad si aplica?"
          name="incluirPrimaAntiguedad"
          value={form.incluirPrimaAntiguedad ? 'si' : 'no'}
          options={SI_NO}
          onChange={(v) => actualizar('incluirPrimaAntiguedad', v === 'si')}
        />
        <SelectField
          label="Zona del salario mínimo"
          name="zonaSalarioMinimo"
          value={form.zonaSalarioMinimo}
          options={ZONAS_SALARIO_MINIMO}
          onChange={(v) => actualizar('zonaSalarioMinimo', v as ZonaSalarioMinimo)}
          disabled={!form.incluirPrimaAntiguedad}
          helpText="Se usa para aplicar el tope legal de la prima de antigüedad (Art. 162 LFT)."
        />
      </div>

      <Disclaimer compact />

      <button
        type="submit"
        className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition self-start"
      >
        Calcular finiquito
      </button>
    </form>
  )
}
