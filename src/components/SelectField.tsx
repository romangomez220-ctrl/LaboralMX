interface Option {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  name: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  helpText?: string
}

export default function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  error,
  disabled,
  helpText,
}: SelectFieldProps) {
  const helpId = `${name}-help`
  const errorId = `${name}-error`

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helpText ? helpId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-md border px-3 py-2 text-base bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {helpText && !error && <span id={helpId} className="text-xs text-gray-500">{helpText}</span>}
      {error && <span id={errorId} role="alert" className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
