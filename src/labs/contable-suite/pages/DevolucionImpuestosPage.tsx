import { useState, type FormEvent } from 'react'
import InputField from '../../../components/InputField'
import SelectField from '../../../components/SelectField'
import Disclaimer from '../../../components/Disclaimer'
import LabsBadge from '../../components/LabsBadge'
import { useNoIndex } from '../../useNoIndex'
import ConceptoLegalCard from '../components/ConceptoLegalCard'
import { calcularDevolucionImpuestos, UMA_ANUAL_2026 } from '../core/devolucionImpuestos'
import type { ColegiaturaCaptura, DevolucionFormData, DevolucionResultado, NivelEducativo } from '../core/types'

const NIVELES: { value: NivelEducativo; label: string }[] = [
  { value: 'preescolar', label: 'Preescolar' },
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'profesional_tecnico', label: 'Profesional técnico' },
  { value: 'bachillerato', label: 'Bachillerato' },
]

interface FormState {
  ingresoAnual: string
  ingresoAcumulableEjercicioAnterior: string
  isrRetenido: string
  tuvoMasDeUnPatron: boolean
  gastosMedicos: string
  colegiaturaNivel: NivelEducativo
  colegiaturaMonto: string
  colegiaturas: ColegiaturaCaptura[]
  donativos: string
  donativosGobierno: string
  interesesRealesHipotecarios: string
  aportacionesRetiroAfore: string
}

const ESTADO_INICIAL: FormState = {
  ingresoAnual: '',
  ingresoAcumulableEjercicioAnterior: '',
  isrRetenido: '',
  tuvoMasDeUnPatron: false,
  gastosMedicos: '',
  colegiaturaNivel: 'primaria',
  colegiaturaMonto: '',
  colegiaturas: [],
  donativos: '',
  donativosGobierno: '',
  interesesRealesHipotecarios: '',
  aportacionesRetiroAfore: '',
}

function aNumero(v: string): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function DevolucionImpuestosPage() {
  useNoIndex()
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL)
  const [resultado, setResultado] = useState<DevolucionResultado | null>(null)

  function actualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function agregarColegiatura() {
    if (aNumero(form.colegiaturaMonto) <= 0) return
    actualizar('colegiaturas', [
      ...form.colegiaturas,
      { nivel: form.colegiaturaNivel, monto: aNumero(form.colegiaturaMonto) },
    ])
    actualizar('colegiaturaMonto', '')
  }

  function quitarColegiatura(idx: number) {
    actualizar('colegiaturas', form.colegiaturas.filter((_, i) => i !== idx))
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    const datos: DevolucionFormData = {
      ingresoAnual: aNumero(form.ingresoAnual),
      ingresoAcumulableEjercicioAnterior: aNumero(form.ingresoAcumulableEjercicioAnterior),
      isrRetenido: aNumero(form.isrRetenido),
      tuvoMasDeUnPatron: form.tuvoMasDeUnPatron,
      gastosMedicos: aNumero(form.gastosMedicos),
      colegiaturas: form.colegiaturas,
      donativos: aNumero(form.donativos),
      donativosGobierno: aNumero(form.donativosGobierno),
      interesesRealesHipotecarios: aNumero(form.interesesRealesHipotecarios),
      aportacionesRetiroAfore: aNumero(form.aportacionesRetiroAfore),
    }
    setResultado(calcularDevolucionImpuestos(datos))
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs uppercase tracking-wide text-stone">
        Contable Suite <span className="mx-1 text-gray-300">›</span> Devolución de Impuestos
      </p>
      <LabsBadge />

      <div>
        <h1 className="text-2xl font-bold text-primary">Calculadora de Devolución de Impuestos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Para trabajadores asalariados. Estima deducciones, ISR anual y posible saldo a favor o a cargo.
        </p>
      </div>

      <div className="rounded-lg border border-amber-300 bg-warning-light text-warning text-sm p-3">
        La estimación usa la tarifa anual 2026 publicada en el Anexo 8 de la RMF. No sustituye la declaración
        precargada del SAT ni contempla todos los posibles ingresos, estímulos o acreditamientos.
      </div>

      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Ingreso gravable anual según constancias (MXN)"
            name="ingresoAnual"
            type="number"
            placeholder="0.00"
            value={form.ingresoAnual}
            onChange={(v) => actualizar('ingresoAnual', v)}
          />
          <InputField
            label="Ingreso acumulable del ejercicio anterior (para donativos)"
            name="ingresoAcumulableEjercicioAnterior"
            type="number"
            placeholder="0.00"
            value={form.ingresoAcumulableEjercicioAnterior}
            onChange={(v) => actualizar('ingresoAcumulableEjercicioAnterior', v)}
            helpText="El artículo 151 usa este dato para los límites de 7% y 4%."
          />
          <InputField
            label="ISR retenido en el año (de tu constancia)"
            name="isrRetenido"
            type="number"
            placeholder="0.00"
            value={form.isrRetenido}
            onChange={(v) => actualizar('isrRetenido', v)}
          />
          <SelectField
            label="¿Tuviste más de un patrón en el año?"
            name="tuvoMasDeUnPatron"
            value={form.tuvoMasDeUnPatron ? 'si' : 'no'}
            options={[{ value: 'no', label: 'No' }, { value: 'si', label: 'Sí' }]}
            onChange={(v) => actualizar('tuvoMasDeUnPatron', v === 'si')}
          />
          <InputField
            label="Gastos médicos, dentales y hospitalarios (con CFDI)"
            name="gastosMedicos"
            type="number"
            placeholder="0.00"
            value={form.gastosMedicos}
            onChange={(v) => actualizar('gastosMedicos', v)}
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
            label="Donativos a otras instituciones autorizadas"
            name="donativos"
            type="number"
            placeholder="0.00"
            value={form.donativos}
            onChange={(v) => actualizar('donativos', v)}
          />
          <InputField
            label="Donativos a Federación, entidades o municipios"
            name="donativosGobierno"
            type="number"
            placeholder="0.00"
            value={form.donativosGobierno}
            onChange={(v) => actualizar('donativosGobierno', v)}
          />
          <InputField
            label="Aportaciones voluntarias de retiro (Afore)"
            name="aportacionesRetiroAfore"
            type="number"
            placeholder="0.00"
            value={form.aportacionesRetiroAfore}
            onChange={(v) => actualizar('aportacionesRetiroAfore', v)}
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Colegiaturas (opcional, una por nivel)</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <SelectField
              label="Nivel educativo"
              name="colegiaturaNivel"
              value={form.colegiaturaNivel}
              options={NIVELES}
              onChange={(v) => actualizar('colegiaturaNivel', v as NivelEducativo)}
            />
            <InputField
              label="Monto pagado en el año"
              name="colegiaturaMonto"
              type="number"
              placeholder="0.00"
              value={form.colegiaturaMonto}
              onChange={(v) => actualizar('colegiaturaMonto', v)}
            />
            <button
              type="button"
              onClick={agregarColegiatura}
              className="self-end rounded-lg border border-primary text-primary px-4 py-2.5 text-sm font-semibold hover:bg-primary hover:text-white transition"
            >
              Agregar
            </button>
          </div>
          {form.colegiaturas.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-gray-700">
              {form.colegiaturas.map((c, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>{NIVELES.find((n) => n.value === c.nivel)?.label}: ${c.monto.toLocaleString('es-MX')}</span>
                  <button type="button" onClick={() => quitarColegiatura(i)} className="text-red-600 text-xs underline">
                    quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Disclaimer compact variante="fiscal" />

        <button
          type="submit"
          className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition self-start"
        >
          Calcular deducciones
        </button>
      </form>

      {resultado && (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <p>
              Tope global aplicable: <strong>${resultado.topeGlobalAplicable.toLocaleString('es-MX')}</strong>{' '}
              ({resultado.topeGlobalCriterio === '15%_ingreso' ? '15% de tu ingreso' : `5 UMA anuales ($${(5 * UMA_ANUAL_2026).toLocaleString('es-MX')})`})
            </p>
          </div>

          {resultado.conceptos.map((c, i) => (
            <ConceptoLegalCard key={i} concepto={c} />
          ))}

          <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-primary">Total de deducciones personales</p>
              <p className="text-xl font-bold text-primary">
                ${resultado.totalDeduccionesPersonales.toLocaleString('es-MX')}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Ingreso anual: ${resultado.ingresoAnual.toLocaleString('es-MX')} − Deducciones: $
              {resultado.totalDeduccionesPersonales.toLocaleString('es-MX')} = Base gravable: $
              {resultado.baseGravableDespuesDeducciones.toLocaleString('es-MX')}
            </p>
            <div className="mt-4 border-t border-primary/15 pt-3">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-primary">ISR anual estimado</p>
                <p className="font-bold text-primary">${resultado.isrCausadoEstimado.toLocaleString('es-MX')}</p>
              </div>
              <div className="flex items-center justify-between gap-4 mt-1">
                <p className="font-semibold text-primary">
                  {resultado.tipoSaldo === 'a_favor' ? 'Posible saldo a favor' : resultado.tipoSaldo === 'a_cargo' ? 'Posible saldo a cargo' : 'Saldo estimado'}
                </p>
                <p className="text-xl font-bold text-primary">
                  ${Math.abs(resultado.saldoEstimado).toLocaleString('es-MX')}
                </p>
              </div>
              <p className="text-xs text-stone mt-1">
                ISR retenido ${resultado.isrRetenidoTotal.toLocaleString('es-MX')} − ISR anual estimado ${resultado.isrCausadoEstimado.toLocaleString('es-MX')}.
              </p>
            </div>
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
