import type { ChangeEvent, FocusEvent } from 'react'
import { limpiarEntradaNumerica } from '../utils/numericInput'

interface InputFieldProps {
  label: string
  name: string
  type?: 'text' | 'number' | 'date'
  value: string | number
  onChange: (value: string) => void
  error?: string
  min?: number | string
  max?: number | string
  step?: number
  placeholder?: string
  disabled?: boolean
  helpText?: string
}

export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  min,
  max,
  step,
  placeholder,
  disabled = false,
  helpText,
}: InputFieldProps) {
  const esNumerico = type === 'number'
  const helpId = `${name}-help`
  const errorId = `${name}-error`

  // Al enfocar un campo numérico que ya tiene contenido, seleccionamos
  // todo el texto para que el usuario pueda escribir directamente encima
  // sin tener que borrarlo manualmente (ej. evitar "0666").
  function manejarFoco(e: FocusEvent<HTMLInputElement>) {
    if (esNumerico && value !== '') {
      e.target.select()
    }
  }

  // Los campos numéricos se renderizan como texto (ver más abajo) para
  // evitar inconsistencias del input nativo type="number" en distintos
  // navegadores móviles. Aquí filtramos cualquier caracter no numérico y
  // quitamos ceros a la izquierda antes de notificar al formulario.
  function manejarCambio(e: ChangeEvent<HTMLInputElement>) {
    onChange(esNumerico ? limpiarEntradaNumerica(e.target.value) : e.target.value)
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={esNumerico ? 'text' : type}
        inputMode={esNumerico ? 'decimal' : undefined}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onChange={manejarCambio}
        onFocus={manejarFoco}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helpText ? helpId : undefined}
        className={`w-full rounded-md border px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
          type === 'date' ? '[&::-webkit-date-and-time-value]:text-left' : ''
        } ${error ? 'border-red-400' : 'border-gray-300'}`}
      />
      {helpText && !error && <span id={helpId} className="text-xs text-gray-500">{helpText}</span>}
      {error && <span id={errorId} role="alert" className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
