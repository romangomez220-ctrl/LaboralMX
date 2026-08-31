import { useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { WHATSAPP_NUMBER_LINK } from '../config/contacto'
import { formatCurrency } from '../utils/formatCurrency'
import { trackProfessionalReview } from '../utils/analytics'
import type { TipoCalculo } from '../types/labor'
import InputField from './InputField'
import SelectField from './SelectField'

interface ProfessionalReviewModalProps {
  abierto: boolean
  calculator: TipoCalculo
  totalEstimado?: number
  onCerrar: () => void
}

const UBICACIONES = [
  { value: 'cdmx', label: 'Ciudad de México' },
  { value: 'edomex', label: 'Estado de México' },
  { value: 'otra', label: 'Otro estado' },
]

const SITUACIONES = [
  { value: 'despido', label: 'Me despidieron' },
  { value: 'renuncia', label: 'Renuncié o estoy por renunciar' },
  { value: 'convenio', label: 'Me propusieron un convenio' },
  { value: 'terminacion', label: 'Terminó mi contrato' },
  { value: 'otra', label: 'Otra situación' },
]

const OPCIONES_SI_NO = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
]

const DOCUMENTOS = [
  { value: 'varios', label: 'Contrato, recibos o documento de terminación' },
  { value: 'algunos', label: 'Tengo algunos documentos' },
  { value: 'ninguno', label: 'No tengo documentos' },
]

type Paso = 'formulario' | 'resumen' | 'urgente'

export default function ProfessionalReviewModal({
  abierto,
  calculator,
  totalEstimado,
  onCerrar,
}: ProfessionalReviewModalProps) {
  const [paso, setPaso] = useState<Paso>('formulario')
  const [nombre, setNombre] = useState('')
  const [ubicacion, setUbicacion] = useState('cdmx')
  const [situacion, setSituacion] = useState(calculator === 'liquidacion' ? 'despido' : 'renuncia')
  const [fechaTerminacion, setFechaTerminacion] = useState('')
  const [cantidadOfrecida, setCantidadOfrecida] = useState('')
  const [firmoDocumento, setFirmoDocumento] = useState('no')
  const [documentos, setDocumentos] = useState('algunos')
  const [urgencia, setUrgencia] = useState('no')
  const [aceptaCanalizacion, setAceptaCanalizacion] = useState(false)

  if (!abierto) return null

  function reiniciarYCerrar() {
    setPaso('formulario')
    setNombre('')
    setUbicacion('cdmx')
    setSituacion(calculator === 'liquidacion' ? 'despido' : 'renuncia')
    setFechaTerminacion('')
    setCantidadOfrecida('')
    setFirmoDocumento('no')
    setDocumentos('algunos')
    setUrgencia('no')
    setAceptaCanalizacion(false)
    onCerrar()
  }

  function enviarFormulario(event: FormEvent) {
    event.preventDefault()
    if (!aceptaCanalizacion || !fechaTerminacion) return
    if (urgencia === 'si') {
      trackProfessionalReview(calculator, 'blocked_urgent')
      setPaso('urgente')
      return
    }
    trackProfessionalReview(calculator, 'submitted')
    setPaso('resumen')
  }

  function continuarAWhatsApp() {
    const ubicacionLabel = UBICACIONES.find((item) => item.value === ubicacion)?.label ?? ubicacion
    const situacionLabel = SITUACIONES.find((item) => item.value === situacion)?.label ?? situacion
    const documentosLabel = DOCUMENTOS.find((item) => item.value === documentos)?.label ?? documentos
    const mensaje = [
      'Hola, ROMANUS. Solicito revisar si mi situación laboral puede canalizarse con un abogado participante.',
      '',
      `Herramienta utilizada: ${calculator === 'finiquito' ? 'Finiquito' : 'Liquidación'}`,
      ...(typeof totalEstimado === 'number'
        ? [`Estimación generada por ROMANUS: ${formatCurrency(totalEstimado)}`]
        : []),
      `Nombre: ${nombre.trim() || 'No proporcionado'}`,
      `Ubicación: ${ubicacionLabel}`,
      `Situación: ${situacionLabel}`,
      `Fecha de terminación: ${fechaTerminacion}`,
      `Cantidad ofrecida: ${cantidadOfrecida.trim() ? `$${cantidadOfrecida.trim()} MXN` : 'No proporcionada'}`,
      `¿Firmó un documento?: ${firmoDocumento === 'si' ? 'Sí' : 'No'}`,
      `Documentos disponibles: ${documentosLabel}`,
      '',
      'Autorizo a ROMANUS a usar esta información para revisar la solicitud y, si confirma conmigo la canalización, compartirla con un abogado participante. Entiendo que enviar la solicitud no crea una relación abogado-cliente ni garantiza atención.',
    ].join('\n')

    trackProfessionalReview(calculator, 'whatsapp_continued')
    window.open(`${WHATSAPP_NUMBER_LINK}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer')
    reiniciarYCerrar()
  }

  function detenerPropagacion(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="professional-review-title"
      onClick={reiniciarYCerrar}
    >
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={detenerPropagacion}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Piloto de canalización laboral</p>
        <h2 id="professional-review-title" className="mt-1 text-xl font-semibold text-primary">
          Solicitar revisión de mi situación
        </h2>

        {paso === 'formulario' && (
          <form onSubmit={enviarFormulario} className="mt-5 flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Estas preguntas ayudan a ROMANUS a ordenar tu solicitud. No sustituyen una consulta y todavía no se comparten con un abogado.
            </p>
            <InputField label="Nombre (opcional)" name="review-name" type="text" value={nombre} onChange={setNombre} />
            <SelectField label="¿Dónde ocurrió la relación laboral?" name="review-location" value={ubicacion} options={UBICACIONES} onChange={setUbicacion} />
            <SelectField label="¿Cuál es tu situación principal?" name="review-situation" value={situacion} options={SITUACIONES} onChange={setSituacion} />
            <InputField label="Fecha de terminación o despido" name="review-end-date" type="date" value={fechaTerminacion} onChange={setFechaTerminacion} />
            <InputField label="Cantidad ofrecida por el empleador (opcional)" name="review-offer" type="number" placeholder="0.00" value={cantidadOfrecida} onChange={setCantidadOfrecida} />
            <SelectField label="¿Ya firmaste un convenio, renuncia o recibo?" name="review-signed" value={firmoDocumento} options={OPCIONES_SI_NO} onChange={setFirmoDocumento} />
            <SelectField label="¿Qué documentos tienes?" name="review-documents" value={documentos} options={DOCUMENTOS} onChange={setDocumentos} />
            <SelectField label="¿Tienes audiencia, citatorio o plazo en los próximos 3 días?" name="review-urgent" value={urgencia} options={OPCIONES_SI_NO} onChange={setUrgencia} />

            {ubicacion === 'otra' && (
              <p className="rounded-lg border border-amber-300 bg-warning-light p-3 text-sm text-warning">
                El piloto comienza en Ciudad de México y Estado de México. Puedes enviar tu solicitud, pero quizá aún no exista un abogado participante en tu estado.
              </p>
            )}

            <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={aceptaCanalizacion}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setAceptaCanalizacion(event.target.checked)}
                className="mt-1"
              />
              <span>
                Acepto que ROMANUS use esta información para revisar mi solicitud y me contacte por WhatsApp. Si posteriormente confirmo la canalización, podrá compartirla con un abogado participante conforme al{' '}
                <Link to="/privacidad" target="_blank" className="underline hover:text-primary">Aviso de Privacidad</Link>.
              </span>
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!aceptaCanalizacion || !fechaTerminacion}
                className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Revisar solicitud
              </button>
              <button type="button" onClick={reiniciarYCerrar} className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-600 hover:border-primary hover:text-primary">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {paso === 'resumen' && (
          <div className="mt-5 flex flex-col gap-4">
            <div className="rounded-lg border border-gold/50 bg-ivory p-4 text-sm text-gray-700">
              <p className="font-semibold text-primary">Tu solicitud está lista para enviarse</p>
              <p className="mt-2">ROMANUS confirmará contigo el alcance y la disponibilidad antes de compartir información con un abogado. El abogado decidirá de manera independiente si puede atender el asunto.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={continuarAWhatsApp} className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-light">
                Enviar por WhatsApp
              </button>
              <button type="button" onClick={() => setPaso('formulario')} className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-600 hover:border-primary hover:text-primary">
                Editar
              </button>
            </div>
          </div>
        )}

        {paso === 'urgente' && (
          <div className="mt-5 flex flex-col gap-4">
            <div className="rounded-lg border border-amber-300 bg-warning-light p-4 text-sm text-warning">
              ROMANUS no es un servicio de emergencia ni puede asegurar atención antes de un plazo próximo. Busca de inmediato a un abogado laboralista, a la autoridad laboral o a la Procuraduría de la Defensa del Trabajo correspondiente.
            </div>
            <button type="button" onClick={reiniciarYCerrar} className="self-start rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-light">
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
