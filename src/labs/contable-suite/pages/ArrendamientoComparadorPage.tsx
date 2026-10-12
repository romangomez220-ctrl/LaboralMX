import { useState, type FormEvent } from 'react'
import InputField from '../../../components/InputField'
import SelectField from '../../../components/SelectField'
import Disclaimer from '../../../components/Disclaimer'
import LabsBadge from '../../components/LabsBadge'
import { useNoIndex } from '../../useNoIndex'
import ConceptoLegalCard from '../components/ConceptoLegalCard'
import { compararArrendamiento } from '../core/arrendamiento'
import type { ArrendamientoFormData, ArrendamientoResultado } from '../core/types'

interface FormState {
  ingresoAnual: string
  esCopropiedad: boolean
  porcentajeCopropiedad: string
  predialPagado: string
  predial: string
  mantenimiento: string
  primasSeguros: string
  interesesRealesHipotecarios: string
  salariosComisionesHonorarios: string
  contribucionesSobreSalarios: string
  deduccionInversionesConstruccion: string
}

const ESTADO_INICIAL: FormState = {
  ingresoAnual: '',
  esCopropiedad: false,
  porcentajeCopropiedad: '100',
  predialPagado: '',
  predial: '',
  mantenimiento: '',
  primasSeguros: '',
  interesesRealesHipotecarios: '',
  salariosComisionesHonorarios: '',
  contribucionesSobreSalarios: '',
  deduccionInversionesConstruccion: '',
}

function aNumero(v: string): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const RECOMENDACION_TEXTO: Record<string, string> = {
  ciega: 'La deducción ciega produce la menor base gravable estimada',
  real: 'Los gastos reales producen la menor base gravable estimada',
  equivalente: 'Ambas opciones son prácticamente equivalentes',
}

export default function ArrendamientoComparadorPage() {
  useNoIndex()
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL)
  const [resultado, setResultado] = useState<ArrendamientoResultado | null>(null)

  function actualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    const datos: ArrendamientoFormData = {
      ingresoAnual: aNumero(form.ingresoAnual),
      esCopropiedad: form.esCopropiedad,
      porcentajeCopropiedad: aNumero(form.porcentajeCopropiedad),
      predialPagado: aNumero(form.predialPagado),
      gastosReales: {
        predial: aNumero(form.predial),
        mantenimiento: aNumero(form.mantenimiento),
        primasSeguros: aNumero(form.primasSeguros),
        interesesRealesHipotecarios: aNumero(form.interesesRealesHipotecarios),
        salariosComisionesHonorarios: aNumero(form.salariosComisionesHonorarios),
        contribucionesSobreSalarios: aNumero(form.contribucionesSobreSalarios),
        deduccionInversionesConstruccion: aNumero(form.deduccionInversionesConstruccion),
      },
    }
    setResultado(compararArrendamiento(datos))
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs uppercase tracking-wide text-stone">
        Contable Suite <span className="mx-1 text-gray-300">›</span> Arrendamiento
      </p>
      <LabsBadge />

      <div>
        <h1 className="text-2xl font-bold text-primary">Comparador de Arrendamiento</h1>
        <p className="text-sm text-gray-500 mt-1">
          Deducción ciega (35%) vs. gastos reales — la decisión se fija en tu primer pago
          provisional del año.
        </p>
      </div>

      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Ingreso anual por arrendamiento (MXN)"
            name="ingresoAnual"
            type="number"
            placeholder="0.00"
            value={form.ingresoAnual}
            onChange={(v) => actualizar('ingresoAnual', v)}
          />
          <InputField
            label="Predial pagado en el año"
            name="predialPagado"
            type="number"
            placeholder="0.00"
            value={form.predialPagado}
            onChange={(v) => actualizar('predialPagado', v)}
          />
          <SelectField
            label="¿El inmueble es en copropiedad?"
            name="esCopropiedad"
            value={form.esCopropiedad ? 'si' : 'no'}
            options={[{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }]}
            onChange={(v) => actualizar('esCopropiedad', v === 'si')}
          />
          <InputField
            label="Tu porcentaje de copropiedad (%)"
            name="porcentajeCopropiedad"
            type="number"
            placeholder="100"
            value={form.porcentajeCopropiedad}
            onChange={(v) => actualizar('porcentajeCopropiedad', v)}
            disabled={!form.esCopropiedad}
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Gastos reales (con CFDI)</p>
          <p className="mb-3 text-xs text-stone">
            Captura importes efectivamente pagados y, si existe copropiedad, únicamente la parte que te corresponde.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField
              label="Predial (de nuevo, para esta opción)"
              name="predial"
              type="number"
              placeholder="0.00"
              value={form.predial}
              onChange={(v) => actualizar('predial', v)}
            />
            <InputField
              label="Mantenimiento, reparaciones y agua"
              name="mantenimiento"
              type="number"
              placeholder="0.00"
              value={form.mantenimiento}
              onChange={(v) => actualizar('mantenimiento', v)}
            />
            <InputField
              label="Primas de seguros del inmueble"
              name="primasSeguros"
              type="number"
              placeholder="0.00"
              value={form.primasSeguros}
              onChange={(v) => actualizar('primasSeguros', v)}
            />
            <InputField
              label="Intereses reales de crédito hipotecario"
              name="interesesRealesHipotecarios"
              type="number"
              placeholder="0.00"
              value={form.interesesRealesHipotecarios}
              onChange={(v) => actualizar('interesesRealesHipotecarios', v)}
            />
            <InputField
              label="Salarios, comisiones y honorarios pagados"
              name="salariosComisionesHonorarios"
              type="number"
              placeholder="0.00"
              value={form.salariosComisionesHonorarios}
              onChange={(v) => actualizar('salariosComisionesHonorarios', v)}
            />
            <InputField
              label="Impuestos, cuotas y contribuciones sobre salarios"
              name="contribucionesSobreSalarios"
              type="number"
              placeholder="0.00"
              value={form.contribucionesSobreSalarios}
              onChange={(v) => actualizar('contribucionesSobreSalarios', v)}
            />
            <InputField
              label="Deducción de inversiones en construcción"
              name="deduccionInversionesConstruccion"
              type="number"
              placeholder="0.00"
              value={form.deduccionInversionesConstruccion}
              onChange={(v) => actualizar('deduccionInversionesConstruccion', v)}
            />
          </div>
        </div>

        <Disclaimer compact variante="fiscal" />

        <button
          type="submit"
          className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition self-start"
        >
          Comparar opciones
        </button>
      </form>

      {resultado && (
        <div className="flex flex-col gap-3">
          {resultado.conceptos.map((c, i) => (
            <ConceptoLegalCard key={i} concepto={c} />
          ))}

          <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
            <p className="font-semibold text-primary">{RECOMENDACION_TEXTO[resultado.recomendacion]}</p>
            <p className="text-sm text-gray-600 mt-1">
              Diferencia entre ambas bases gravables: ${resultado.diferencia.toLocaleString('es-MX')}
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

        </div>
      )}
    </div>
  )
}
