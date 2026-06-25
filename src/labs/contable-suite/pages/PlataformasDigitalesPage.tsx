import { useState, type FormEvent } from 'react'
import InputField from '../../../components/InputField'
import SelectField from '../../../components/SelectField'
import Disclaimer from '../../../components/Disclaimer'
import LabsBadge from '../../components/LabsBadge'
import { useNoIndex } from '../../useNoIndex'
import ConceptoLegalCard from '../components/ConceptoLegalCard'
import { calcularRetencionPlataformas } from '../core/plataformasDigitales'
import type {
  PlataformasFormData,
  PlataformasResultado,
  TipoActividadPlataforma,
  TipoContribuyentePlataforma,
} from '../core/types'

const ACTIVIDADES: { value: TipoActividadPlataforma; label: string }[] = [
  { value: 'transporte_entrega', label: 'Transporte de pasajeros / entrega de bienes (Uber, DiDi, Rappi)' },
  { value: 'hospedaje', label: 'Hospedaje (Airbnb y similares)' },
  { value: 'venta_servicios_general', label: 'Venta de bienes o servicios en general (Mercado Libre, Amazon, freelance)' },
]

const TIPOS_CONTRIBUYENTE: { value: TipoContribuyentePlataforma; label: string }[] = [
  { value: 'persona_fisica', label: 'Persona física' },
  { value: 'persona_moral', label: 'Persona moral' },
]

interface FormState {
  tipoActividad: TipoActividadPlataforma
  tipoContribuyente: TipoContribuyentePlataforma
  tieneRfcRegistrado: boolean
  ingresosBrutosMes: string
  ingresosAcumuladosAnio: string
  facturaAdicionalFueraDePlataforma: boolean
}

const ESTADO_INICIAL: FormState = {
  tipoActividad: 'venta_servicios_general',
  tipoContribuyente: 'persona_fisica',
  tieneRfcRegistrado: true,
  ingresosBrutosMes: '',
  ingresosAcumuladosAnio: '',
  facturaAdicionalFueraDePlataforma: false,
}

function aNumero(v: string): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function PlataformasDigitalesPage() {
  useNoIndex()
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL)
  const [resultado, setResultado] = useState<PlataformasResultado | null>(null)

  function actualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    const datos: PlataformasFormData = {
      tipoActividad: form.tipoActividad,
      tipoContribuyente: form.tipoContribuyente,
      tieneRfcRegistrado: form.tieneRfcRegistrado,
      ingresosBrutosMes: aNumero(form.ingresosBrutosMes),
      ingresosAcumuladosAnio: aNumero(form.ingresosAcumuladosAnio),
      facturaAdicionalFueraDePlataforma: form.facturaAdicionalFueraDePlataforma,
    }
    setResultado(calcularRetencionPlataformas(datos))
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs uppercase tracking-wide text-stone">
        Contable Suite <span className="mx-1 text-gray-300">›</span> Plataformas Digitales 2026
      </p>
      <LabsBadge />

      <div>
        <h1 className="text-2xl font-bold text-primary">Retenciones por Plataformas Digitales 2026</h1>
        <p className="text-sm text-gray-500 mt-1">
          Para quienes venden bienes o prestan servicios vía Uber, DiDi, Rappi, Airbnb, Mercado
          Libre, Amazon u otras plataformas.
        </p>
      </div>

      <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm p-3">
        <strong>Punto de mayor riesgo de esta herramienta:</strong> el texto vigente de la ley señala 1% para
        "venta de bienes o servicios en general", pero esta calculadora usa 2.5% porque es la cifra que reportan
        las fuentes posteriores a enero de 2026 (vía Ley de Ingresos de la Federación). Al menos una fuente
        especializada señala esto como jurídicamente cuestionable. Verifica el texto exacto vigente antes de
        confiar en esta tasa para una decisión real.
      </div>

      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <SelectField
            label="Tipo de actividad"
            name="tipoActividad"
            value={form.tipoActividad}
            options={ACTIVIDADES}
            onChange={(v) => actualizar('tipoActividad', v as TipoActividadPlataforma)}
          />
          <SelectField
            label="Tipo de contribuyente"
            name="tipoContribuyente"
            value={form.tipoContribuyente}
            options={TIPOS_CONTRIBUYENTE}
            onChange={(v) => actualizar('tipoContribuyente', v as TipoContribuyentePlataforma)}
          />
          <SelectField
            label="¿Tienes tu RFC registrado ante la plataforma?"
            name="tieneRfcRegistrado"
            value={form.tieneRfcRegistrado ? 'si' : 'no'}
            options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }]}
            onChange={(v) => actualizar('tieneRfcRegistrado', v === 'si')}
            helpText="No registrarlo eleva la retención significativamente."
          />
          <InputField
            label="Ingresos brutos del mes (MXN)"
            name="ingresosBrutosMes"
            type="number"
            placeholder="0.00"
            value={form.ingresosBrutosMes}
            onChange={(v) => actualizar('ingresosBrutosMes', v)}
          />
          <InputField
            label="Ingresos acumulados en el año (todas las plataformas)"
            name="ingresosAcumuladosAnio"
            type="number"
            placeholder="0.00"
            value={form.ingresosAcumuladosAnio}
            onChange={(v) => actualizar('ingresosAcumuladosAnio', v)}
          />
          <SelectField
            label="¿Facturas también fuera de la plataforma?"
            name="facturaAdicionalFueraDePlataforma"
            value={form.facturaAdicionalFueraDePlataforma ? 'si' : 'no'}
            options={[{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }]}
            onChange={(v) => actualizar('facturaAdicionalFueraDePlataforma', v === 'si')}
          />
        </div>

        <Disclaimer compact />

        <button
          type="submit"
          className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition self-start"
        >
          Calcular retención
        </button>
      </form>

      {resultado && (
        <div className="flex flex-col gap-3">
          {resultado.conceptos.map((c, i) => (
            <ConceptoLegalCard key={i} concepto={c} />
          ))}

          <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
            <p className="font-semibold text-primary">
              Neto a recibir: ${resultado.netoARecibir.toLocaleString('es-MX')}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {resultado.posibleConsiderarPagoDefinitivo
                ? 'Tus ingresos acumulados están dentro del umbral de referencia para considerar la retención como posible pago definitivo — verifica tu caso exacto (ver nota abajo).'
                : 'Tus ingresos acumulados superan el umbral de referencia — probablemente debas presentar pagos provisionales adicionales, no solo la retención.'}
            </p>
          </div>

          {resultado.notas.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-warning-light p-4">
              <p className="text-sm font-semibold text-warning mb-2">Notas importantes</p>
              <ul className="text-sm text-warning flex flex-col gap-2 list-disc pl-4">
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
