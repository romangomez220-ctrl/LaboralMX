import type { FocusEvent } from 'react'

interface InputFieldProps {
  label: string
  name: string
  type?: 'text' | 'number' | 'date'
  value: string | number
  onChange: (value: string) => void
  error?: string
  min?: number
  step?: number
  placeholder?: string
}

export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  min,
  step,
  placeholder,
}: InputFieldProps) {
  // Al enfocar un campo numérico que solo contiene "0", seleccionamos todo
  // el contenido para que el usuario pueda escribir directamente encima
  // sin tener que borrar el cero manualmente (ej. evitar "025000").
  function manejarFoco(e: FocusEvent<HTMLInputElement>) {
    if (type === 'number' && (value === 0 || value === '0')) {
      e.target.select()
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={manejarFoco}
        className={`w-full rounded-md border px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
          type === 'date' ? '[&::-webkit-date-and-time-value]:text-left' : ''
        } ${error ? 'border-red-400' : 'border-gray-300'}`}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
