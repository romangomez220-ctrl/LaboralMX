import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'
import SelectField from '../components/SelectField'
import SalarioCapturaField from '../components/SalarioCapturaField'
import Disclaimer from '../components/Disclaimer'
import FiniquitoVsLiquidacion from '../components/FiniquitoVsLiquidacion'
import { calcularLiquidacion } from '../utils/laborCalculations'
import { aNumero } from '../utils/numericInput'
import { trackCalculatorCompleted } from '../utils/analytics'
import { obtenerFechaHoyInput } from '../utils/dateUtils'
import type {
  LiquidacionFormData,
  TipoCapturaSalarial,
  TipoSalidaLiquidacion,
  ZonaSalarioMinimo,
} from '../types/labor'

// Igual que en FiniquitoCalculator: los campos numéricos se capturan
// como texto y solo se convierten a number al calcular (aNumero), para
// que el campo pueda quedar vacío mientras el usuario escribe.
interface LiquidacionFormState {
  fechaIngreso: string
  fechaSalida: string
  tipoSalario: TipoCapturaSalarial
  salarioBase: string
  diasPendientes: string
  vacacionesDisfrutadas: string
  tipoSalida: TipoSalidaLiquidacion
  incluirPrimaAntiguedad: boolean
  incluir20Dias: boolean
  zonaSalarioMinimo: ZonaSalarioMinimo
}

const ESTADO_INICIAL: LiquidacionFormState = {
  fechaIngreso: '',
  fechaSalida: '',
  tipoSalario: 'diario',
  salarioBase: '',
  diasPendientes: '',
  vacacionesDisfrutadas: '',
  tipoSalida: 'despido_injustificado',
  incluirPrimaAntiguedad: true,
  incluir20Dias: false,
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

// v4.9.2 — feedback de validación profesional: se agregan mutuo acuerdo,
// fallecimiento e incapacidad como supuestos de terminación propios,
// cada uno con su propio tratamiento de prima de antigüedad (ver
// laborCalculations.ts → evaluarPrimaAntiguedad).
const TIPOS_SALIDA: { value: TipoSalidaLiquidacion; label: string }[] = [
  { value: 'despido_injustificado', label: 'Despido injustificado' },
  { value: 'despido_justificado', label: 'Despido justificado' },
  { value: 'renuncia', label: 'Renuncia' },
  { value: 'mutuo_acuerdo', label: 'Mutuo acuerdo' },
  { value: 'fallecimiento', label: 'Fallecimiento del trabajador' },
  { value: 'incapacidad', label: 'Incapacidad' },
]

const TIPOS_SALIDA_LABEL: Record<string, string> = {
  despido_injustificado: 'Despido injustificado',
  despido_justificado: 'Despido justificado',
  renuncia: 'Renuncia',
  mutuo_acuerdo: 'Mutuo acuerdo',
  fallecimiento: 'Fallecimiento del trabajador',
  incapacidad: 'Incapacidad',
}

interface LiquidacionCalculatorProps {
  headingLevel?: 'h1' | 'h2'
}

export default function LiquidacionCalculator({ headingLevel = 'h1' }: LiquidacionCalculatorProps) {
  const [form, setForm] = useState<LiquidacionFormState>(ESTADO_INICIAL)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const fechaHoy = obtenerFechaHoyInput()
  const Heading = headingLevel

  function actualizar<K extends keyof LiquidacionFormState>(
    campo: K,
    valor: LiquidacionFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function validar(): boolean {
    const e: Record<string, string> = {}

    if (!form.fechaIngreso) e.fechaIngreso = 'Indica la fecha de ingreso.'
    if (!form.fechaSalida) e.fechaSalida = 'Indica la fecha de salida.'
    if (form.fechaIngreso && form.fechaIngreso > fechaHoy) {
      e.fechaIngreso = 'La fecha de ingreso no puede estar en el futuro.'
    }
    if (form.fechaSalida && form.fechaSalida > fechaHoy) {
      e.fechaSalida = 'La fecha de salida no puede estar en el futuro.'
    }
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

    const datosParaCalcular: LiquidacionFormData = {
      fechaIngreso: form.fechaIngreso,
      fechaSalida: form.fechaSalida,
      salarioBase: aNumero(form.salarioBase),
      tipoSalario: form.tipoSalario,
      diasPendientes: aNumero(form.diasPendientes),
      vacacionesDisfrutadas: aNumero(form.vacacionesDisfrutadas),
      tipoSalida: form.tipoSalida,
      incluirPrimaAntiguedad: form.incluirPrimaAntiguedad,
      incluir20Dias: form.incluir20Dias,
      zonaSalarioMinimo: form.zonaSalarioMinimo,
    }

    const resultado = calcularLiquidacion(datosParaCalcular)
    trackCalculatorCompleted('liquidacion')

    const datosCapturados = [
      { etiqueta: 'Fecha de ingreso', valor: form.fechaIngreso },
      { etiqueta: 'Fecha de salida', valor: form.fechaSalida },
      {
        etiqueta: 'Salario capturado',
        valor: `$${form.salarioBase} MXN (${form.tipoSalario === 'diario' ? 'diario' : 'mensual'})`,
      },
      { etiqueta: 'Días pendientes de pago', valor: form.diasPendientes || '0' },
      { etiqueta: 'Vacaciones disfrutadas', valor: form.vacacionesDisfrutadas || '0' },
      { etiqueta: 'Tipo de salida', valor: TIPOS_SALIDA_LABEL[form.tipoSalida] ?? form.tipoSalida },
    ]

    navigate('/productos/laboralmx/resultado', { state: { resultado, datosCapturados } })
  }

  const veinteDiasDisponible = form.tipoSalida === 'despido_injustificado'

  return (
    <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
      <div>
        <Heading className="text-2xl font-bold text-primary">Calculadora de Liquidación</Heading>
        <p className="text-sm text-gray-500 mt-1">
          Incluye el finiquito más, en su caso, la indemnización por despido injustificado.
        </p>
      </div>

      <FiniquitoVsLiquidacion />

      <div className="grid sm:grid-cols-2 gap-4">
        <InputField
          label="Fecha de ingreso"
          name="fechaIngreso"
          type="date"
          max={form.fechaSalida || fechaHoy}
          value={form.fechaIngreso}
          onChange={(v) => actualizar('fechaIngreso', v)}
          error={errores.fechaIngreso}
        />
        <InputField
          label="Fecha de salida"
          name="fechaSalida"
          type="date"
          min={form.fechaIngreso || undefined}
          max={fechaHoy}
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
          label="Vacaciones disfrutadas del periodo en curso"
          name="vacacionesDisfrutadas"
          type="number"
          placeholder="0"
          value={form.vacacionesDisfrutadas}
          onChange={(v) => actualizar('vacacionesDisfrutadas', v)}
          error={errores.vacacionesDisfrutadas}
          helpText="Captura solo los días correspondientes al periodo iniciado en tu último aniversario laboral."
        />
        <SelectField
          label="Tipo de salida"
          name="tipoSalida"
          value={form.tipoSalida}
          options={TIPOS_SALIDA}
          onChange={(v) => {
            const tipo = v as TipoSalidaLiquidacion
            actualizar('tipoSalida', tipo)
            if (tipo !== 'despido_injustificado') {
              actualizar('incluir20Dias', false)
            }
          }}
        />
        <SelectField
          label="¿Incluir prima de antigüedad?"
          name="incluirPrimaAntiguedad"
          value={form.incluirPrimaAntiguedad ? 'si' : 'no'}
          options={SI_NO}
          onChange={(v) => actualizar('incluirPrimaAntiguedad', v === 'si')}
          helpText="En mutuo acuerdo e incapacidad, el monto se mostrará por separado del total, como referencia informativa."
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
        <SelectField
          label="¿Incluir 20 días por año como escenario informativo?"
          name="incluir20Dias"
          value={form.incluir20Dias ? 'si' : 'no'}
          options={SI_NO}
          onChange={(v) => actualizar('incluir20Dias', v === 'si')}
          disabled={!veinteDiasDisponible}
          helpText={
            veinteDiasDisponible
              ? 'Se mostrará por separado, no se suma al total legal.'
              : 'Disponible solo para despido injustificado.'
          }
        />
      </div>

      <Disclaimer compact />

      <button
        type="submit"
        className="w-full sm:w-auto rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition self-stretch sm:self-start"
      >
        Calcular liquidación
      </button>
    </form>
  )
}
