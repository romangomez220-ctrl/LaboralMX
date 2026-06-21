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
        className={`rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
