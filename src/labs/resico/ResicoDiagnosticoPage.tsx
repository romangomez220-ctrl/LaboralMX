import { useEffect, useState, type FormEvent } from 'react'
import InputField from '../../components/InputField'
import SelectField from '../../components/SelectField'
import Disclaimer from '../../components/Disclaimer'
import Modal from '../../components/Modal'
import LabsBadge from '../components/LabsBadge'
import ConfidenceCard from '../components/ConfidenceCard'
import BenefitsCard from '../components/BenefitsCard'
import RiskCard from '../components/RiskCard'
import ValidateWithExpertCard from '../components/ValidateWithExpertCard'
import DisclaimerCard from '../components/DisclaimerCard'
import { useNoIndex } from '../useNoIndex'
import { trackEvent } from '../../utils/analytics'
import { obtenerErroresRegistrados } from '../../utils/errorLogger'
import { formatCurrency } from '../../utils/formatCurrency'
import { aNumero } from '../../utils/numericInput'
import { calcularDiagnosticoResico, RETENCION_PERSONAS_MORALES, TABLA_RESICO_MENSUAL } from './resicoCalculations'
import {
  generarBeneficios,
  generarChecklistValidacion,
  generarExplicacionConfianza,
  generarFactoresEvaluados,
  generarRiesgos,
  TEXTO_IMPORTANTE_RESICO,
} from './resicoContenidoUX'
import type {
  ActividadPrincipal,
  ResicoFormData,
  ResultadoResico,
  SituacionActual,
  SituacionEmpleados,
  SituacionIVA,
  TipoFacturacion,
} from './resicoTypes'

interface FormState {
  ingresoMensual: string
  ingresoAnual: string
  actividad: ActividadPrincipal
  facturacion: TipoFacturacion
  gastosMensuales: string
  empleados: SituacionEmpleados
  iva: SituacionIVA
  situacion: SituacionActual
}

const ESTADO_INICIAL: FormState = {
  ingresoMensual: '',
  ingresoAnual: '',
  actividad: 'servicios_profesionales',
  facturacion: 'personas_fisicas',
  gastosMensuales: '',
  empleados: 'sin_empleados',
  iva: 'no_cobra',
  situacion: 'dado_de_alta',
}

const OPCIONES_ACTIVIDAD = [
  { value: 'servicios_profesionales', label: 'Servicios profesionales' },
  { value: 'actividad_empresarial', label: 'Actividad empresarial' },
  { value: 'comercio', label: 'Comercio' },
  { value: 'arrendamiento', label: 'Arrendamiento' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'otra', label: 'Otra' },
]

const OPCIONES_FACTURACION = [
  { value: 'personas_fisicas', label: 'Facturo a personas físicas' },
  { value: 'personas_morales', label: 'Facturo a personas morales' },
  { value: 'ambas', label: 'Facturo a ambas' },
]

const OPCIONES_EMPLEADOS = [
  { value: 'sin_empleados', label: 'No tengo empleados' },
  { value: 'con_empleados', label: 'Tengo empleados' },
]

const OPCIONES_IVA = [
  { value: 'cobra', label: 'Cobro IVA' },
  { value: 'no_cobra', label: 'No cobro IVA' },
  { value: 'no_seguro', label: 'No estoy seguro' },
]

const OPCIONES_SITUACION = [
  { value: 'dado_de_alta', label: 'Ya estoy dado de alta' },
  { value: 'quiere_alta', label: 'Quiero darme de alta' },
  { value: 'no_seguro', label: 'No estoy seguro' },
]

export default function ResicoDiagnosticoPage() {
  useNoIndex()

  const [form, setForm] = useState<FormState>(ESTADO_INICIAL)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [resultado, setResultado] = useState<ResultadoResico | null>(null)
  const [datosUsados, setDatosUsados] = useState<ResicoFormData | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    trackEvent('resico_page_view')
  }, [])

  function actualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  // Ingreso mensual <-> anual: editar uno recalcula el otro de inmediato.
  function actualizarIngresoMensual(valor: string) {
    setForm((prev) => ({
      ...prev,
      ingresoMensual: valor,
      ingresoAnual: valor.trim() === '' ? '' : String(Math.round(aNumero(valor) * 12 * 100) / 100),
    }))
  }

  function actualizarIngresoAnual(valor: string) {
    setForm((prev) => ({
      ...prev,
      ingresoAnual: valor,
      ingresoMensual: valor.trim() === '' ? '' : String(Math.round((aNumero(valor) / 12) * 100) / 100),
    }))
  }

  function validar(): boolean {
    const e: Record<string, string> = {}
    if (form.ingresoMensual.trim() === '') {
      e.ingresoMensual = 'Indica tu ingreso mensual estimado.'
    } else if (aNumero(form.ingresoMensual) <= 0) {
      e.ingresoMensual = 'El ingreso mensual debe ser mayor a 0.'
    }
    if (form.gastosMensuales.trim() !== '' && aNumero(form.gastosMensuales) < 0) {
      e.gastosMensuales = 'Los gastos no pueden ser negativos.'
    }
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function manejarEnvio(ev: FormEvent) {
    ev.preventDefault()
    trackEvent('resico_calculation_started')
    if (!validar()) return

    const datosParaCalcular: ResicoFormData = {
      ingresoMensual: aNumero(form.ingresoMensual),
      actividad: form.actividad,
      facturacion: form.facturacion,
      gastosMensuales: aNumero(form.gastosMensuales),
      empleados: form.empleados,
      iva: form.iva,
      situacion: form.situacion,
    }

    const nuevoResultado = calcularDiagnosticoResico(datosParaCalcular)
    setResultado(nuevoResultado)
    setDatosUsados(datosParaCalcular)
    trackEvent('resico_calculation_completed', {
      confianza: nuevoResultado.confianza,
      elegible: nuevoResultado.elegible,
    })
  }

  function abrirModalRevision() {
    trackEvent('resico_professional_review_clicked')
    setModalAbierto(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Identificación conceptual (v4.8): RESICO ya no se presenta como
          herramienta aislada, sino como parte de Fiscal Suite dentro de
          Labs. Es solo una etiqueta visual — no cambia rutas ni lógica. */}
      <p className="text-xs uppercase tracking-wide text-stone">
        Fiscal Suite <span className="mx-1 text-gray-300">›</span> RESICO
      </p>

      <LabsBadge />

      <div>
        <h1 className="text-2xl font-bold text-primary">Diagnóstico Inteligente RESICO</h1>
        <p className="text-sm text-gray-500 mt-1">
          Descubre de forma estimada si el Régimen Simplificado de Confianza podría ser adecuado
          para tu situación fiscal y comprende las implicaciones generales antes de tomar
          decisiones.
        </p>
      </div>

      <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Ingreso mensual estimado (MXN)"
            name="ingresoMensual"
            type="number"
            placeholder="0.00"
            value={form.ingresoMensual}
            onChange={actualizarIngresoMensual}
            error={errores.ingresoMensual}
          />
          <InputField
            label="Ingreso anual estimado (MXN)"
            name="ingresoAnual"
            type="number"
            placeholder="0.00"
            value={form.ingresoAnual}
            onChange={actualizarIngresoAnual}
          />
          <SelectField
            label="Actividad principal"
            name="actividad"
            value={form.actividad}
            options={OPCIONES_ACTIVIDAD}
            onChange={(v) => actualizar('actividad', v as ActividadPrincipal)}
          />
          <SelectField
            label="Facturación"
            name="facturacion"
            value={form.facturacion}
            options={OPCIONES_FACTURACION}
            onChange={(v) => actualizar('facturacion', v as TipoFacturacion)}
          />
          <InputField
            label="Gastos aproximados (mensual, MXN)"
            name="gastosMensuales"
            type="number"
            placeholder="0.00"
            value={form.gastosMensuales}
            onChange={(v) => actualizar('gastosMensuales', v)}
            error={errores.gastosMensuales}
          />
          <SelectField
            label="Empleados"
            name="empleados"
            value={form.empleados}
            options={OPCIONES_EMPLEADOS}
            onChange={(v) => actualizar('empleados', v as SituacionEmpleados)}
          />
          <SelectField
            label="IVA"
            name="iva"
            value={form.iva}
            options={OPCIONES_IVA}
            onChange={(v) => actualizar('iva', v as SituacionIVA)}
          />
          <div className="sm:col-span-2 text-xs text-gray-500">
            Esta herramienta se enfoca principalmente en una estimación orientativa relacionada
            con ISR. El IVA tiene implicaciones fiscales independientes y no modifica
            directamente el resultado principal de esta evaluación, pero puede ser relevante para
            una revisión fiscal personalizada. Tu respuesta aquí sí puede influir en el nivel de
            confianza mostrado más abajo (por ejemplo, si no estás seguro de tu situación de IVA).
          </div>
          <SelectField
            label="Situación actual"
            name="situacion"
            value={form.situacion}
            options={OPCIONES_SITUACION}
            onChange={(v) => actualizar('situacion', v as SituacionActual)}
          />
        </div>

        <Disclaimer compact />

        <button
          type="submit"
          className="rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-light transition self-start"
        >
          Generar diagnóstico
        </button>
      </form>

      {resultado && (
        <div className="flex flex-col gap-5">
          {/* Bloque 1 */}
          <div>
            <h2 className="font-semibold text-primary mb-2">ISR estimado</h2>
            <div className="flex flex-col gap-2">
              <div className="rounded-lg border border-gray-200 bg-white p-4 flex justify-between text-sm">
                <span className="text-gray-600">Tasa utilizada</span>
                <span className="font-semibold text-primary">{(resultado.tasa * 100).toFixed(2)}%</span>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 flex justify-between text-sm">
                <span className="text-gray-600">ISR mensual estimado</span>
                <span className="font-semibold text-primary">{formatCurrency(resultado.isrMensual)}</span>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 flex justify-between text-sm">
                <span className="text-gray-600">ISR anual estimado</span>
                <span className="font-semibold text-primary">{formatCurrency(resultado.isrAnual)}</span>
              </div>
            </div>
          </div>

          {/* Bloque 2 */}
          <div>
            <h2 className="font-semibold text-primary mb-2">Ingreso neto estimado</h2>
            <div className="flex flex-col gap-2">
              <div className="rounded-lg border border-gray-200 bg-white p-4 flex justify-between text-sm">
                <span className="text-gray-600">Ingreso bruto mensual</span>
                <span className="font-semibold text-primary">{formatCurrency(resultado.ingresoMensual)}</span>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 flex justify-between text-sm">
                <span className="text-gray-600">ISR estimado</span>
                <span className="font-semibold text-primary">- {formatCurrency(resultado.isrMensual)}</span>
              </div>
              <div className="rounded-lg border border-green-300 bg-success-light p-4 flex justify-between text-sm">
                <span className="font-medium">Ingreso neto aproximado</span>
                <span className="font-bold text-success">{formatCurrency(resultado.ingresoNetoMensual)}</span>
              </div>
            </div>
          </div>

          {/* Bloque 3 */}
          <div>
            <h2 className="font-semibold text-primary mb-2">Diagnóstico ROMANUS</h2>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              {resultado.diagnostico}
            </div>
          </div>

          {datosUsados && (
            <>
              <BenefitsCard
                title="Posibles beneficios de RESICO"
                benefits={generarBeneficios(datosUsados, resultado)}
              />

              <RiskCard
                title="Aspectos que deben revisarse cuidadosamente"
                risks={generarRiesgos(datosUsados, resultado)}
              />
            </>
          )}

          {/* Bloque 4 */}
          <ConfidenceCard
            level={resultado.confianza}
            explanation={generarExplicacionConfianza(resultado.confianza)}
            factorsEvaluated={generarFactoresEvaluados()}
            specificNotes={resultado.factoresConfianza}
          />

          <DisclaimerCard text={TEXTO_IMPORTANTE_RESICO} />

          {/* Bloque 5 */}
          <div>
            <h2 className="font-semibold text-primary mb-2">Recomendaciones</h2>
            <ul className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 list-disc pl-4 space-y-1.5">
              {resultado.recomendaciones.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {resultado.recomendaciones.some((r) => r.includes('retención') || r.includes('acredita')) && (
              <details className="mt-2 text-xs text-gray-600">
                <summary className="cursor-pointer underline text-primary">
                  ¿Qué es un crédito fiscal?
                </summary>
                <p className="mt-1">
                  En esta herramienta, crédito fiscal se refiere a una cantidad que puede
                  disminuir el impuesto estimado a pagar conforme a las reglas aplicables. No debe
                  confundirse con un préstamo o financiamiento.
                </p>
              </details>
            )}
          </div>

          {/* Factores considerados (v4.8) */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-primary mb-2">Factores considerados</h2>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>
                <span className={resultado.elegible ? 'text-success' : 'text-warning'}>
                  {resultado.elegible ? '✓' : '⚠'}
                </span>{' '}
                Ingresos dentro del límite anual permitido.
              </li>
              <li>
                <span className="text-success">✓</span> Compatibilidad preliminar con RESICO
                evaluada.
              </li>
              <li>
                <span className={resultado.confianza === 'alto' ? 'text-success' : 'text-warning'}>
                  {resultado.confianza === 'alto' ? '✓' : '⚠'}
                </span>{' '}
                Restricciones detectadas:{' '}
                {resultado.confianza === 'alto'
                  ? 'ninguna relevante.'
                  : resultado.factoresConfianza.join(' ')}
              </li>
              <li>
                <span className="text-warning">⚠</span> Este resultado es orientativo.
              </li>
              <li>
                <span className="text-warning">⚠</span> Situaciones particulares deben revisarse
                con un contador o asesor fiscal.
              </li>
            </ul>

            {/*
              EASTER EGG TEMPORAL — fase privada de validación (v4.8).
              Agradecimiento informal por feedback de un contador en beta.
              NO es botón, NO lleva datos de contacto, NO presenta a
              Josué como colaborador ni asesor oficial de ROMANUS.
              ELIMINAR antes de cualquier lanzamiento público.
            */}
            <p className="text-xs text-gray-400 italic mt-4">
              Si llegaste hasta aquí, probablemente sea momento de preguntarle a Josué. 😄
            </p>
          </div>

          {datosUsados && (
            <ValidateWithExpertCard items={generarChecklistValidacion(datosUsados, resultado)} />
          )}

          {/* Explicabilidad obligatoria */}
          <details className="rounded-lg border border-gray-200 bg-white p-4 group">
            <summary className="cursor-pointer font-semibold text-primary list-none flex items-center justify-between">
              ¿Cómo llegó ROMANUS a esta conclusión?
              <span className="text-gray-400 text-sm group-open:rotate-180 transition">▾</span>
            </summary>
            <div className="mt-4 text-sm text-gray-700 flex flex-col gap-2">
              <p>
                Se tomó el ingreso mensual capturado ({formatCurrency(resultado.ingresoMensual)}) y se
                multiplicó por 12 para estimar el ingreso anual ({formatCurrency(resultado.ingresoAnual)}).
              </p>
              <p>
                Con ese ingreso mensual se ubicó el tramo correspondiente en la tarifa oficial de
                RESICO (Art. 113-E LISR) para obtener la tasa de {(resultado.tasa * 100).toFixed(2)}%, que
                se aplicó directamente sobre el ingreso mensual para obtener el ISR estimado.
              </p>
              <p>
                Se verificó que el ingreso anual estimado no superara el límite legal de{' '}
                {formatCurrency(3500000)} para permanecer en RESICO.
              </p>
              <p>
                El nivel de confianza se calculó evaluando la completitud y consistencia de las
                respuestas capturadas (actividad, IVA, situación fiscal, empleados, proporción de
                gastos) — el detalle exacto de qué se evaluó está disponible en "Modo contador".
              </p>
            </div>
          </details>

          {/* Modo contador */}
          <details className="rounded-lg border border-gray-200 bg-white p-4 group">
            <summary className="cursor-pointer font-semibold text-primary list-none flex items-center justify-between">
              Ver criterios utilizados (modo contador)
              <span className="text-gray-400 text-sm group-open:rotate-180 transition">▾</span>
            </summary>
            <div className="mt-4 text-sm text-gray-700 flex flex-col gap-3">
              <div>
                <p className="font-semibold text-gray-800">Tarifa aplicable (Art. 113-E LISR, RMF 2026 Anexo 8)</p>
                <table className="w-full text-xs mt-2 border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-1.5 border-b">Ingreso mensual</th>
                      <th className="text-left p-1.5 border-b">Tasa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TABLA_RESICO_MENSUAL.map((t) => (
                      <tr key={t.tasa}>
                        <td className="p-1.5 border-b">
                          {formatCurrency(t.limiteInferior)} —{' '}
                          {t.limiteSuperior === Infinity ? 'en adelante' : formatCurrency(t.limiteSuperior)}
                        </td>
                        <td className="p-1.5 border-b">{(t.tasa * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Supuestos y simplificaciones</p>
                <ul className="list-disc pl-4 space-y-1 mt-1">
                  <li>Se asume que el ingreso mensual capturado es constante durante el año, para ubicar el tramo de la tarifa. En la práctica, RESICO se calcula sobre el ingreso acumulado real desde enero, por lo que el tramo puede cambiar mes a mes según la facturación real.</li>
                  <li>El ingreso capturado se asume sin IVA (RESICO grava ingresos cobrados sin IVA).</li>
                  <li>No se modelan retenciones de personas morales ({(RETENCION_PERSONAS_MORALES * 100).toFixed(2)}%) como crédito contra el ISR calculado; se menciona como recomendación, no como ajuste numérico.</li>
                  <li>No se valida el cumplimiento de todos los requisitos de permanencia en RESICO (solo el límite de ingresos), ni restricciones por tipo de socio, fideicomisos u otras actividades incompatibles.</li>
                  <li>Límite de elegibilidad evaluado: ingreso anual ≤ {formatCurrency(3500000)} (Art. 113-E LISR).</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Reglas de nivel de confianza</p>
                <p className="mt-1">
                  Sistema de puntos transparente (no es un modelo de IA): cada factor de
                  incertidumbre detectado suma puntos. 0 puntos = Alto; 1-2 puntos = Medio; 3+
                  puntos = Bajo. Superar el límite de ingresos anuales fuerza "Bajo"
                  independientemente de los demás puntos.
                </p>
              </div>
            </div>
          </details>

          {resultado.remanenteDespuesDeGastos !== resultado.ingresoNetoMensual && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <p>
                Como referencia adicional (no es parte del cálculo oficial de ISR, ya que RESICO no
                permite deducir gastos): después de tus gastos aproximados, tu remanente mensual
                estimado sería de <span className="font-semibold">{formatCurrency(resultado.remanenteDespuesDeGastos)}</span>.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-primary text-lg mb-2">¿Quieres una revisión más detallada?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Este diagnóstico es una estimación general. Un contador puede revisar tu caso
              específico con mayor profundidad.
            </p>
            <button
              type="button"
              onClick={abrirModalRevision}
              className="rounded-lg bg-primary text-white px-5 py-2.5 font-semibold hover:bg-primary-light transition"
            >
              Solicitar revisión profesional
            </button>
          </div>

          <Disclaimer />
        </div>
      )}

      {/* Sección educativa, siempre visible */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="font-semibold text-primary mb-2">¿Qué es RESICO?</h2>
        <div className="text-sm text-gray-700 flex flex-col gap-2">
          <p>
            El Régimen Simplificado de Confianza (RESICO) es un esquema fiscal para personas
            físicas en México, creado para simplificar el pago de impuestos a quienes prestan
            servicios profesionales, tienen actividad empresarial, comercio, arrendamiento o
            actividades similares.
          </p>
          <p>
            <span className="font-semibold">¿A quién está dirigido?</span> A personas físicas cuyos
            ingresos anuales totales (de todas las fuentes) no superan $3,500,000 MXN.
          </p>
          <p>
            <span className="font-semibold">Beneficios generales:</span> tasas de ISR bajas (entre
            1.00% y 2.50%), cálculo simple sobre el ingreso cobrado, y menos carga administrativa
            que el régimen general.
          </p>
          <p>
            <span className="font-semibold">Limitaciones generales:</span> no permite deducir
            gastos para efectos de ISR, tiene un límite de ingresos para permanecer en el régimen,
            y no todas las personas o actividades pueden tributar en RESICO.
          </p>
          <p>
            <span className="font-semibold">¿Cuándo conviene acudir con un contador?</span> Cuando
            tus ingresos están cerca del límite permitido, cuando tienes varias fuentes de ingreso,
            cuando tienes empleados, o cuando no tienes certeza sobre tu situación fiscal actual.
          </p>
        </div>
      </div>

      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo="Revisión profesional">
        <p>
          Próximamente ROMANUS permitirá conectar usuarios con contadores y especialistas para
          revisar casos específicos.
        </p>
      </Modal>

      {obtenerErroresRegistrados().length > 0 && (
        <details className="rounded-lg border border-red-300 bg-red-50 p-4">
          <summary className="cursor-pointer font-semibold text-red-700">
            🐞 Modo debug — errores registrados en esta sesión ({obtenerErroresRegistrados().length})
          </summary>
          <div className="mt-3 flex flex-col gap-3 text-xs text-gray-700">
            {obtenerErroresRegistrados().map((err, i) => (
              <div key={i} className="border-l-2 border-red-300 pl-3">
                <p>
                  <span className="font-semibold">{err.fechaHora}</span> — componente:{' '}
                  <span className="font-semibold">{err.componente}</span> — ruta: {err.ruta}
                </p>
                <p className="mt-1">{err.mensaje}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
