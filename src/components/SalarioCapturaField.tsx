import InputField from './InputField'
import SelectField from './SelectField'
import { aNumero } from '../utils/numericInput'
import type { TipoCapturaSalarial } from '../types/labor'

const OPCIONES_TIPO_SALARIO = [
  { value: 'diario', label: 'Salario diario' },
  { value: 'mensual', label: 'Salario mensual' },
]

interface SalarioCapturaFieldProps {
  tipoSalario: TipoCapturaSalarial
  salarioBase: string
  onTipoSalarioChange: (v: TipoCapturaSalarial) => void
  onSalarioBaseChange: (v: string) => void
  error?: string
}

/**
 * Selector de tipo de salario (diario o mensual) + el campo numérico
 * correspondiente + la conversión visible cuando aplica. Diario es el
 * valor por defecto en todas las calculadoras (feedback de validación
 * profesional: es lo jurídica y contablemente más natural), y mensual se
 * convierte siempre dividiendo entre 30 — la misma regla que ya usaba
 * internamente cada calculadora, ahora explícita para el usuario.
 *
 * Se usa en las 5 calculadoras laborales para no repetir esta lógica de
 * UI cinco veces y mantenerlas consistentes entre sí.
 */
export default function SalarioCapturaField({
  tipoSalario,
  salarioBase,
  onTipoSalarioChange,
  onSalarioBaseChange,
  error,
}: SalarioCapturaFieldProps) {
  const montoValido = salarioBase.trim() !== '' && aNumero(salarioBase) > 0
  const mostrarConversion = tipoSalario === 'mensual' && montoValido

  return (
    <>
      <SelectField
        label="Tipo de salario capturado"
        name="tipoSalario"
        value={tipoSalario}
        options={OPCIONES_TIPO_SALARIO}
        onChange={(v) => onTipoSalarioChange(v as TipoCapturaSalarial)}
        helpText="Puedes capturar tu salario diario (recomendado) o tu salario mensual; la conversión se muestra automáticamente."
      />
      <InputField
        label={tipoSalario === 'diario' ? 'Salario diario (MXN)' : 'Salario mensual (MXN)'}
        name="salarioBase"
        type="number"
        placeholder="0.00"
        value={salarioBase}
        onChange={onSalarioBaseChange}
        error={error}
      />
      {mostrarConversion && (
        <p className="sm:col-span-2 text-xs text-stone -mt-2">
          Equivale a ${(aNumero(salarioBase) / 30).toFixed(2)} de salario diario (salario mensual ÷ 30).
        </p>
      )}
    </>
  )
}
