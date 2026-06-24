import { useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react'
import { WHATSAPP_NUMBER_LINK } from '../config/contacto'
import InputField from './InputField'
import SelectField from './SelectField'

interface WhatsAppConsentModalProps {
  abierto: boolean
  onCerrar: () => void
}

const PUNTOS_CONSENTIMIENTO = [
  'ROMANUS es un proyecto piloto en fase de validación.',
  'La orientación tiene carácter informativo.',
  'No constituye asesoría legal formal.',
  'No genera relación abogado-cliente.',
  'El servicio es gratuito.',
  'La atención puede ser limitada o suspendida.',
  'No se atienden emergencias ni asuntos urgentes.',
]

const OPCIONES_ESTADO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
].map((nombre) => ({ value: nombre, label: nombre }))

const OPCIONES_AREA = [
  { value: 'familiar', label: 'Familiar' },
  { value: 'laboral', label: 'Laboral' },
  { value: 'civil', label: 'Civil' },
  { value: 'mercantil', label: 'Mercantil' },
  { value: 'administrativa', label: 'Administrativa' },
  { value: 'otra', label: 'Otra' },
]

const OPCIONES_URGENCIA = [
  { value: 'no', label: 'No' },
  { value: 'violencia_activa', label: 'Violencia activa' },
  { value: 'detencion_penal', label: 'Detención o riesgo penal' },
  { value: 'audiencia_plazo', label: 'Audiencia próxima o plazo legal en curso' },
]

// Las 3 situaciones críticas que bloquean el paso a WhatsApp (todas las
// opciones de urgencia salvo "No").
const URGENCIAS_BLOQUEANTES = new Set(['violencia_activa', 'detencion_penal', 'audiencia_plazo'])

type Paso = 'consentimiento' | 'formulario' | 'resumen' | 'bloqueo'

/**
 * Flujo de Con Causa (v4.7): Consentimiento → formulario de triage →
 * si hay urgencia crítica, bloqueo y derivación; si no, resumen de lo
 * capturado con el botón final "Continuar a WhatsApp". No guarda ningún
 * dato: todo vive en el estado de este componente y se limpia al cerrar.
 */
export default function WhatsAppConsentModal({ abierto, onCerrar }: WhatsAppConsentModalProps) {
  const [paso, setPaso] = useState<Paso>('consentimiento')
  const [aceptaConsentimiento, setAceptaConsentimiento] = useState(false)
  const [nombre, setNombre] = useState('')
  const [estado, setEstado] = useState(OPCIONES_ESTADO[0].value)
  const [area, setArea] = useState('familiar')
  const [descripcion, setDescripcion] = useState('')
  const [urgencia, setUrgencia] = useState('no')
  const [aceptaFormulario, setAceptaFormulario] = useState(false)

  if (!abierto) return null

  function reiniciarYCerrar() {
    setPaso('consentimiento')
    setAceptaConsentimiento(false)
    setNombre('')
    setEstado(OPCIONES_ESTADO[0].value)
    setArea('familiar')
    setDescripcion('')
    setUrgencia('no')
    setAceptaFormulario(false)
    onCerrar()
  }

  function avanzarAFormulario() {
    if (!aceptaConsentimiento) return
    setPaso('formulario')
  }

  function manejarEnvioFormulario(ev: FormEvent) {
    ev.preventDefault()
    if (!aceptaFormulario) return
    setPaso(URGENCIAS_BLOQUEANTES.has(urgencia) ? 'bloqueo' : 'resumen')
  }

  function continuarAWhatsApp() {
    const areaLabel = OPCIONES_AREA.find((o) => o.value === area)?.label ?? area

    const mensaje = [
      'Hola, ROMANUS. Quiero solicitar orientación informativa de ROMANUS Con Causa.',
      '',
      'Nombre:',
      nombre.trim() || 'No proporcionado',
      '',
      'Estado:',
      estado,
      '',
      'Área principal:',
      areaLabel,
      '',
      'Descripción breve:',
      descripcion.trim() || 'No proporcionada',
      '',
      'Confirmo que entiendo que ROMANUS Con Causa es un programa piloto, gratuito e informativo, y que no constituye representación legal ni relación abogado-cliente.',
    ].join('\n')

    const url = `${WHATSAPP_NUMBER_LINK}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    reiniciarYCerrar()
  }

  function detenerPropagacion(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation()
  }

  const areaLabelResumen = OPCIONES_AREA.find((o) => o.value === area)?.label ?? area

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-consent-titulo"
      onClick={reiniciarYCerrar}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={detenerPropagacion}
      >
        <h3 id="whatsapp-consent-titulo" className="text-lg font-semibold text-primary mb-1">
          Antes de continuar
        </h3>

        {paso === 'consentimiento' && (
          <>
            <ul className="flex flex-col gap-1.5 text-sm text-gray-700 mb-4 mt-3">
              {PUNTOS_CONSENTIMIENTO.map((punto) => (
                <li key={punto} className="flex gap-2">
                  <span className="text-success font-semibold">✓</span>
                  <span>{punto}</span>
                </li>
              ))}
            </ul>

            <label className="flex items-start gap-2 text-sm text-gray-800 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={aceptaConsentimiento}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAceptaConsentimiento(e.target.checked)}
                className="mt-0.5"
              />
              He leído y comprendido esta información y deseo continuar.
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={!aceptaConsentimiento}
                onClick={avanzarAFormulario}
                className={`rounded-lg px-5 py-2.5 font-semibold transition ${
                  aceptaConsentimiento
                    ? 'bg-primary text-white hover:bg-primary-light'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={reiniciarYCerrar}
                className="rounded-lg border-2 border-gray-300 text-gray-600 px-5 py-2.5 font-semibold hover:border-primary hover:text-primary transition"
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {paso === 'formulario' && (
          <form onSubmit={manejarEnvioFormulario} className="flex flex-col gap-4 mt-3">
            <p className="text-sm text-gray-600">
              Para saber si tu solicitud puede ser atendida dentro del alcance actual de ROMANUS
              con Causa, responde estas preguntas breves.
            </p>

            <InputField
              label="Nombre (opcional)"
              name="nombre"
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={setNombre}
            />

            <SelectField
              label="Estado de la República"
              name="estado"
              value={estado}
              options={OPCIONES_ESTADO}
              onChange={setEstado}
            />

            <SelectField
              label="Área principal"
              name="area"
              value={area}
              options={OPCIONES_AREA}
              onChange={setArea}
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                Descripción breve del asunto
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescripcion(e.target.value)}
                placeholder="Describe brevemente tu situación sin compartir documentos ni datos sensibles todavía."
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <SelectField
              label="¿Existe alguna situación urgente?"
              name="urgencia"
              value={urgencia}
              options={OPCIONES_URGENCIA}
              onChange={setUrgencia}
            />

            <label className="flex items-start gap-2 text-sm text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={aceptaFormulario}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAceptaFormulario(e.target.checked)}
                className="mt-0.5"
              />
              He leído y entiendo que ROMANUS con Causa es un programa piloto de orientación
              informativa, no representa legalmente a usuarios y no atiende emergencias.
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!aceptaFormulario}
                className={`rounded-lg px-5 py-2.5 font-semibold transition ${
                  aceptaFormulario
                    ? 'bg-primary text-white hover:bg-primary-light'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={reiniciarYCerrar}
                className="rounded-lg border-2 border-gray-300 text-gray-600 px-5 py-2.5 font-semibold hover:border-primary hover:text-primary transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {paso === 'resumen' && (
          <div className="flex flex-col gap-4 mt-3">
            <p className="text-sm text-gray-600">Revisa la información antes de continuar:</p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 flex flex-col gap-1.5">
              <p><span className="font-semibold">Nombre:</span> {nombre.trim() || 'No proporcionado'}</p>
              <p><span className="font-semibold">Estado:</span> {estado}</p>
              <p><span className="font-semibold">Área principal:</span> {areaLabelResumen}</p>
              <p><span className="font-semibold">Descripción:</span> {descripcion.trim() || 'No proporcionada'}</p>
              <p><span className="font-semibold">Urgencia:</span> No</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={continuarAWhatsApp}
                className="rounded-lg bg-primary text-white px-5 py-2.5 font-semibold hover:bg-primary-light transition"
              >
                Continuar a WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setPaso('formulario')}
                className="rounded-lg border-2 border-gray-300 text-gray-600 px-5 py-2.5 font-semibold hover:border-primary hover:text-primary transition"
              >
                Editar
              </button>
            </div>
          </div>
        )}

        {paso === 'bloqueo' && (
          <div className="flex flex-col gap-4 mt-3">
            <div className="rounded-lg border border-amber-300 bg-warning-light text-warning text-sm p-4">
              Por la naturaleza urgente o sensible de tu situación, ROMANUS con Causa no puede
              atender este asunto por WhatsApp dentro de su etapa piloto. Te recomendamos acudir
              de inmediato a la autoridad competente, a una defensoría pública, a un abogado
              titulado o a una institución especializada.
            </div>
            <button
              type="button"
              onClick={reiniciarYCerrar}
              className="rounded-lg bg-primary text-white px-5 py-2.5 font-semibold hover:bg-primary-light transition self-start"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
