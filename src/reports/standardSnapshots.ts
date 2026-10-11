import type {
  AguinaldoFormData,
  FiniquitoFormData,
  ResultadoAguinaldoEstimado,
  ResultadoCalculo,
  ResultadoSDI,
  ResultadoVacacionesEstimadas,
  SDIFormData,
  VacacionesFormData,
} from '../types/labor'
import { formatCurrency } from '../utils/formatCurrency'
import type { StandardLaborReportSnapshot } from './types'

const DISCLAIMER = 'Estimación informativa elaborada con los datos capturados. No constituye asesoría legal, fiscal o de seguridad social ni sustituye la revisión de documentos y circunstancias particulares.'
const COMMON_CHECKLIST = [
  'Confirmar que las fechas capturadas coincidan con recibos, contrato y constancias disponibles.',
  'Verificar que el salario incluya la base que corresponda al concepto analizado.',
  'Conservar recibos, comprobantes y comunicaciones relacionados con el cálculo.',
  'Solicitar revisión profesional si existe una diferencia, prestación superior o situación especial.',
]

function salarioCapturado(base: number, tipo: 'diario' | 'mensual'): string {
  return `${formatCurrency(base)} (${tipo === 'diario' ? 'diario' : 'mensual'})`
}

export function buildFiniquitoReportSnapshot(
  input: FiniquitoFormData,
  result: ResultadoCalculo,
): StandardLaborReportSnapshot {
  return {
    calculatorType: 'finiquito',
    title: 'Reporte de estimación de finiquito',
    description: 'Documento organizado con los datos, conceptos y supuestos utilizados en la estimación de finiquito.',
    captured: [
      { label: 'Fecha de ingreso', value: input.fechaIngreso },
      { label: 'Fecha de salida', value: input.fechaSalida },
      { label: 'Salario capturado', value: salarioCapturado(input.salarioBase, input.tipoSalario) },
      { label: 'Días pendientes de pago', value: String(input.diasPendientes) },
      { label: 'Vacaciones disfrutadas o pagadas', value: String(input.vacacionesDisfrutadas) },
      { label: 'Supuesto de salida', value: input.renunciaVoluntaria ? 'Renuncia voluntaria' : 'Otro supuesto' },
    ],
    results: result.conceptos.map((item) => ({
      label: item.etiqueta,
      value: formatCurrency(item.monto),
      detail: item.formula ?? item.detalle,
    })),
    summary: { label: 'Total estimado de finiquito', value: formatCurrency(result.totalEstimado) },
    checklist: [...COMMON_CHECKLIST, 'Revisar si existen bonos, comisiones, horas extra u otras prestaciones pendientes.'],
    methodology: [
      'El reporte conserva los importes producidos por el motor de cálculo de ROMANUS; no ejecuta un segundo cálculo.',
      'El desglose considera los conceptos mostrados en pantalla y los supuestos capturados por el usuario.',
    ],
    disclaimer: DISCLAIMER,
  }
}

export function buildAguinaldoReportSnapshot(
  input: AguinaldoFormData,
  result: ResultadoAguinaldoEstimado,
): StandardLaborReportSnapshot {
  return {
    calculatorType: 'aguinaldo',
    title: 'Reporte de estimación de aguinaldo',
    description: 'Proyección documentada del aguinaldo con el periodo y salario utilizados.',
    captured: [
      { label: 'Fecha de ingreso', value: input.fechaIngreso },
      { label: 'Salario capturado', value: salarioCapturado(input.salarioBase, input.tipoSalario) },
      { label: 'Fecha de corte', value: result.fechaCorte },
    ],
    results: [
      { label: 'Salario diario utilizado', value: formatCurrency(result.salarioDiario) },
      { label: 'Días computados', value: String(result.diasComputados) },
      { label: 'Aguinaldo proyectado', value: formatCurrency(result.aguinaldoEstimado), detail: '15 días × salario diario × proporción del periodo' },
    ],
    summary: { label: 'Aguinaldo estimado', value: formatCurrency(result.aguinaldoEstimado) },
    checklist: [...COMMON_CHECKLIST, 'Confirmar si el contrato o política interna concede más de 15 días de aguinaldo.'],
    methodology: ['La cifra es una proyección al cierre indicado y supone continuidad laboral hasta esa fecha.'],
    disclaimer: DISCLAIMER,
  }
}

export function buildVacacionesReportSnapshot(
  input: VacacionesFormData,
  result: ResultadoVacacionesEstimadas,
): StandardLaborReportSnapshot {
  return {
    calculatorType: 'vacaciones',
    title: 'Reporte de vacaciones y prima vacacional',
    description: 'Resumen documentado de días correspondientes, días pendientes y valor económico estimado.',
    captured: [
      { label: 'Fecha de ingreso', value: input.fechaIngreso },
      { label: 'Salario capturado', value: salarioCapturado(input.salarioBase, input.tipoSalario) },
      { label: 'Días ya disfrutados', value: String(input.diasDisfrutados) },
    ],
    results: [
      { label: 'Antigüedad', value: result.antiguedadTexto },
      { label: 'Días correspondientes', value: String(result.diasVacacionesCorrespondientes) },
      { label: 'Días pendientes', value: String(result.diasPendientes) },
      { label: 'Valor de vacaciones pendientes', value: formatCurrency(result.valorPendiente) },
      { label: 'Prima vacacional estimada', value: formatCurrency(result.primaVacacional) },
    ],
    summary: { label: 'Total estimado', value: formatCurrency(result.totalEstimado) },
    checklist: [...COMMON_CHECKLIST, 'Contrastar los días disfrutados con controles de asistencia y autorizaciones de vacaciones.'],
    methodology: ['Los días se determinan por antigüedad laboral y se descuentan los días capturados como disfrutados.'],
    disclaimer: DISCLAIMER,
  }
}

export function buildSdiReportSnapshot(
  input: SDIFormData,
  result: ResultadoSDI,
): StandardLaborReportSnapshot {
  return {
    calculatorType: 'sdi',
    title: 'Reporte de Salario Diario Integrado',
    description: 'Documento con la base salarial, factor de integración y SDI estimado.',
    captured: [
      { label: 'Fecha de ingreso', value: input.fechaIngreso },
      { label: 'Salario capturado', value: salarioCapturado(input.salarioBase, input.tipoSalario) },
    ],
    results: [
      { label: 'Antigüedad', value: result.antiguedadTexto },
      { label: 'Salario diario', value: formatCurrency(result.salarioDiario) },
      { label: 'Días de vacaciones aplicados', value: String(result.diasVacacionesAplicados) },
      { label: 'Factor de integración', value: result.factorIntegracion.toFixed(4) },
      { label: 'SDI estimado', value: formatCurrency(result.sdi), detail: 'Salario diario × factor de integración' },
    ],
    summary: { label: 'Salario Diario Integrado estimado', value: formatCurrency(result.sdi) },
    checklist: [...COMMON_CHECKLIST, 'Agregar bonos, comisiones u otras percepciones variables cuando resulten aplicables.'],
    methodology: ['La estimación utiliza prestaciones mínimas de ley y no aplica el tope de 25 UMA del salario base de cotización.'],
    disclaimer: DISCLAIMER,
  }
}
