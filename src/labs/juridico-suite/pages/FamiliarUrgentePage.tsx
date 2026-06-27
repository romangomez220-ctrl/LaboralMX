import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import SelectField from '../../../components/SelectField'
import LabsBadge from '../../components/LabsBadge'
import Disclaimer from '../../../components/Disclaimer'
import FeedbackModal from '../../../labs-portal/components/FeedbackModal'
import { useValidatorSession } from '../../../labs-portal/auth/useValidatorSession'
import { activityRepository } from '../../../repositories'
import { useNoIndex } from '../../useNoIndex'
import {
  evaluarFamiliarUrgente,
  type FamiliarUrgenteFormData,
  type FamiliarUrgenteResultado,
  type TipoCasoFamiliar,
} from '../core/familiarUrgente'

const TOOL_ID = 'tool_familiar_urgente'
const TOOL_NAME = 'Asistente Familiar Urgente'

const ESTADO_INICIAL: FamiliarUrgenteFormData = {
  tipoCaso: 'alimentos',
  hayMenores: true,
  numeroMenores: 1,
  hayRiesgoViolencia: false,
  hayAmenazasRecientes: false,
  hayIncumplimientoAlimentos: false,
  deudorTieneEmpleoIdentificado: false,
  hayCambioDomicilioORetencion: false,
  existeConvenioOSentencia: false,
  requiereConvivenciaSupervisada: false,
  tieneDocumentosBasicos: false,
  tieneComprobantesGastos: false,
  tienePruebasComunicaciones: false,
}

const OPCIONES_CASO = [
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'guarda_custodia', label: 'Guarda y custodia' },
  { value: 'convivencia', label: 'Convivencia' },
  { value: 'violencia_familiar', label: 'Violencia familiar' },
  { value: 'mixto', label: 'Caso mixto' },
]

const ESTILO_URGENCIA = {
  ordinaria: { titulo: 'Ordinaria', clase: 'bg-success-light text-success border-success/20' },
  prioritaria: { titulo: 'Prioritaria', clase: 'bg-warning-light text-warning border-warning/20' },
  urgente: { titulo: 'Urgente', clase: 'bg-red-50 text-red-700 border-red-200' },
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(ev: ChangeEvent<HTMLInputElement>) => onChange(ev.target.checked)}
        className="mt-0.5"
      />
      <span>{label}</span>
    </label>
  )
}

function ListaResultado({ titulo, items }: { titulo: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-700 mb-2">{titulo}</p>
      {items.length === 0 ? (
        <p className="text-sm text-stone">Sin elementos detectados con la captura actual.</p>
      ) : (
        <ul className="text-sm text-gray-700 flex flex-col gap-2 list-disc pl-4">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface FamiliarUrgentePageProps {
  publicMode?: boolean
}

export default function FamiliarUrgentePage({ publicMode = false }: FamiliarUrgentePageProps) {
  useNoIndex(!publicMode)
  const { validador } = useValidatorSession()
  const [form, setForm] = useState<FamiliarUrgenteFormData>(ESTADO_INICIAL)
  const [resultado, setResultado] = useState<FamiliarUrgenteResultado | null>(null)
  const [feedbackAbierto, setFeedbackAbierto] = useState(false)

  useEffect(() => {
    if (!validador) return
    activityRepository.registrar({
      validadorId: validador.id,
      tipo: 'herramienta_abierta',
      herramientaId: TOOL_ID,
      duracionAproxSegundos: null,
    })
  }, [validador])

  function actualizar<K extends keyof FamiliarUrgenteFormData>(campo: K, valor: FamiliarUrgenteFormData[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setResultado(null)
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    setResultado(evaluarFamiliarUrgente(form))
  }

  const estilo = resultado ? ESTILO_URGENCIA[resultado.urgencia] : null

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs uppercase tracking-wide text-stone">
        Jurídico Suite <span className="mx-1 text-gray-300">›</span> Familiar urgente
      </p>
      {publicMode ? (
        <div className="rounded-lg border border-gold bg-white p-3 text-sm text-gray-700">
          <p className="font-semibold text-primary">Herramienta pública validada por ROMANUS Labs</p>
          <p className="mt-1">
            Organiza una primera revisión del caso. En situaciones de violencia o riesgo, acude
            de inmediato a la autoridad competente.
          </p>
        </div>
      ) : (
        <LabsBadge />
      )}

      <div>
        <h1 className="text-2xl font-bold text-primary">Asistente Familiar Urgente</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ordena hechos, pruebas y medidas provisionales para asuntos familiares sensibles.
        </p>
      </div>

      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="grid lg:grid-cols-2 gap-4">
          <SelectField
            label="Tipo de caso"
            name="tipoCaso"
            value={form.tipoCaso}
            options={OPCIONES_CASO}
            onChange={(value) => actualizar('tipoCaso', value as TipoCasoFamiliar)}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="numeroMenores" className="text-sm font-medium text-gray-700">
              Número de menores
            </label>
            <input
              id="numeroMenores"
              type="number"
              min={0}
              value={form.numeroMenores}
              onChange={(ev: ChangeEvent<HTMLInputElement>) => actualizar('numeroMenores', Number(ev.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-3">
          <CheckField label="Hay niñas, niños o adolescentes involucrados" checked={form.hayMenores} onChange={(v) => actualizar('hayMenores', v)} />
          <CheckField label="Existe riesgo de violencia familiar" checked={form.hayRiesgoViolencia} onChange={(v) => actualizar('hayRiesgoViolencia', v)} />
          <CheckField label="Hay amenazas recientes o escalamiento del conflicto" checked={form.hayAmenazasRecientes} onChange={(v) => actualizar('hayAmenazasRecientes', v)} />
          <CheckField label="Hay incumplimiento de alimentos" checked={form.hayIncumplimientoAlimentos} onChange={(v) => actualizar('hayIncumplimientoAlimentos', v)} />
          <CheckField label="Se conoce empleo o fuente de ingresos del deudor" checked={form.deudorTieneEmpleoIdentificado} onChange={(v) => actualizar('deudorTieneEmpleoIdentificado', v)} />
          <CheckField label="Hay riesgo de cambio de domicilio, retención u ocultamiento" checked={form.hayCambioDomicilioORetencion} onChange={(v) => actualizar('hayCambioDomicilioORetencion', v)} />
          <CheckField label="Existe convenio, sentencia o expediente previo" checked={form.existeConvenioOSentencia} onChange={(v) => actualizar('existeConvenioOSentencia', v)} />
          <CheckField label="Podría requerirse convivencia supervisada" checked={form.requiereConvivenciaSupervisada} onChange={(v) => actualizar('requiereConvivenciaSupervisada', v)} />
          <CheckField label="Ya se tienen documentos básicos" checked={form.tieneDocumentosBasicos} onChange={(v) => actualizar('tieneDocumentosBasicos', v)} />
          <CheckField label="Ya se tienen comprobantes de gastos" checked={form.tieneComprobantesGastos} onChange={(v) => actualizar('tieneComprobantesGastos', v)} />
          <CheckField label="Ya se tienen mensajes, audios u otras comunicaciones" checked={form.tienePruebasComunicaciones} onChange={(v) => actualizar('tienePruebasComunicaciones', v)} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition"
          >
            Generar matriz
          </button>
          {validador && (
            <button
              type="button"
              onClick={() => setFeedbackAbierto(true)}
              className="rounded-lg border border-gold text-gold-dark px-6 py-3 font-semibold hover:bg-warning-light transition"
            >
              Enviar feedback
            </button>
          )}
        </div>
      </form>

      {resultado && estilo && (
        <div className="flex flex-col gap-4">
          <div className={`rounded-lg border p-5 ${estilo.clase}`}>
            <p className="text-sm uppercase tracking-wide">Nivel de atención</p>
            <p className="text-2xl font-bold mt-1">{estilo.titulo}</p>
            <p className="text-sm mt-2">{resultado.titulo}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-700">Resumen para expediente</p>
            <p className="text-sm text-gray-700 mt-2">{resultado.resumenCaso}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <ListaResultado titulo="Medidas provisionales a valorar" items={resultado.medidasProvisionales} />
            <ListaResultado titulo="Checklist probatorio" items={resultado.checklistPruebas} />
            <ListaResultado titulo="Omisiones críticas" items={resultado.omisionesCriticas} />
            <ListaResultado titulo="Siguientes pasos" items={resultado.siguientesPasos} />
          </div>

          <ListaResultado titulo="Fundamentos base" items={resultado.fundamentos} />
          <ListaResultado titulo="Advertencias de validación" items={resultado.advertencias} />
          <Disclaimer variante="juridico" />
        </div>
      )}

      {validador && (
        <FeedbackModal
          abierto={feedbackAbierto}
          onCerrar={() => setFeedbackAbierto(false)}
          herramientaId={TOOL_ID}
          herramientaNombre={TOOL_NAME}
          validadorId={validador.id}
        />
      )}
    </div>
  )
}
