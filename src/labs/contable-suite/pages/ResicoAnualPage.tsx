import { useState, type FormEvent } from 'react'
import SelectField from '../../../components/SelectField'
import Disclaimer from '../../../components/Disclaimer'
import LabsBadge from '../../components/LabsBadge'
import { useNoIndex } from '../../useNoIndex'
import { evaluarObligacionResicoAnual } from '../core/resicoAnual'
import type { ResicoAnualFormData, ResicoAnualResultado } from '../core/types'

interface FormState {
  pagosMensualesCompletos: boolean
  permanecioTodoElAnoEnResico: boolean
  noExcedioTopeAnual: boolean
  sinIngresosFueraDeResico: boolean
  tieneIngresosEnCopropiedad: boolean
  esAgapes: boolean
  tuvoSuspensionActividades: boolean
  fueExcluidoAMitadDeAno: boolean
}

const ESTADO_INICIAL: FormState = {
  pagosMensualesCompletos: true,
  permanecioTodoElAnoEnResico: true,
  noExcedioTopeAnual: true,
  sinIngresosFueraDeResico: true,
  tieneIngresosEnCopropiedad: false,
  esAgapes: false,
  tuvoSuspensionActividades: false,
  fueExcluidoAMitadDeAno: false,
}

const SI_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
]

const ESTILO_RESULTADO: Record<string, { bg: string; text: string; titulo: string }> = {
  no_obligado: { bg: 'bg-success-light', text: 'text-success', titulo: 'No estás obligado a presentar declaración anual' },
  obligado: { bg: 'bg-red-50', text: 'text-red-700', titulo: 'Sí estás obligado a presentar declaración anual' },
  zona_gris: { bg: 'bg-warning-light', text: 'text-warning', titulo: 'Tu caso no tiene una respuesta cierta — zona gris' },
}

export default function ResicoAnualPage() {
  useNoIndex()
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL)
  const [resultado, setResultado] = useState<ResicoAnualResultado | null>(null)

  function actualizar<K extends keyof FormState>(campo: K, valor: boolean) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    const datos: ResicoAnualFormData = { ...form }
    setResultado(evaluarObligacionResicoAnual(datos))
  }

  function campoSiNo(label: string, campo: keyof FormState, helpText?: string) {
    return (
      <SelectField
        label={label}
        name={campo}
        value={form[campo] ? 'si' : 'no'}
        options={SI_NO}
        onChange={(v) => actualizar(campo, v === 'si')}
        helpText={helpText}
      />
    )
  }

  const estilo = resultado ? ESTILO_RESULTADO[resultado.resultado] : null

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs uppercase tracking-wide text-stone">
        Contable Suite <span className="mx-1 text-gray-300">›</span> Declaración Anual RESICO
      </p>
      <LabsBadge />

      <div>
        <h1 className="text-2xl font-bold text-primary">¿Debo presentar declaración anual en RESICO?</h1>
        <p className="text-sm text-gray-500 mt-1">
          Responde sobre tu ejercicio fiscal para saber si la liberación de declarar te aplica.
        </p>
      </div>

      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          {campoSiNo('¿Presentaste todos tus pagos mensuales del ejercicio (incluso en ceros)?', 'pagosMensualesCompletos')}
          {campoSiNo('¿Permaneciste todo el ejercicio en RESICO, sin cambiar de régimen?', 'permanecioTodoElAnoEnResico')}
          {campoSiNo('¿NO excediste el tope anual de $3,500,000?', 'noExcedioTopeAnual')}
          {campoSiNo(
            '¿NO tuviste ingresos fuera de RESICO (salarios, intereses, etc.)?',
            'sinIngresosFueraDeResico',
          )}
          {campoSiNo(
            '¿Tienes ingresos en copropiedad con otra persona?',
            'tieneIngresosEnCopropiedad',
            'Genera obligación de declarar, según las reglas específicas de la RMF.',
          )}
          {campoSiNo('¿Tributas en el régimen de AGAPES (agrícola, ganadero, pesquero, silvícola)?', 'esAgapes')}
          {campoSiNo('¿Tuviste un periodo de suspensión de actividades durante el ejercicio?', 'tuvoSuspensionActividades')}
          {campoSiNo('¿El SAT te excluyó de RESICO a mitad de año?', 'fueExcluidoAMitadDeAno')}
        </div>

        <Disclaimer compact />

        <button
          type="submit"
          className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition self-start"
        >
          Evaluar mi caso
        </button>
      </form>

      {resultado && estilo && (
        <div className="flex flex-col gap-3">
          <div className={`rounded-lg border p-4 ${estilo.bg}`}>
            <p className={`font-semibold ${estilo.text}`}>{estilo.titulo}</p>
            <p className="text-sm text-gray-700 mt-2">{resultado.explicacion}</p>
            <p className="text-xs text-gray-500 mt-3 border-t border-gray-200 pt-2">
              <span className="font-semibold">Fundamento: </span>
              {resultado.fundamento}
            </p>
          </div>

          {resultado.notas.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Notas</p>
              <ul className="text-sm text-gray-700 flex flex-col gap-2 list-disc pl-4">
                {resultado.notas.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          <Disclaimer />
        </div>
      )}
    </div>
  )
}
