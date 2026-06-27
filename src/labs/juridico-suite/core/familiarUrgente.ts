export type TipoCasoFamiliar = 'alimentos' | 'guarda_custodia' | 'convivencia' | 'violencia_familiar' | 'mixto'
export type NivelUrgenciaFamiliar = 'ordinaria' | 'prioritaria' | 'urgente'

export interface FamiliarUrgenteFormData {
  tipoCaso: TipoCasoFamiliar
  hayMenores: boolean
  numeroMenores: number
  hayRiesgoViolencia: boolean
  hayAmenazasRecientes: boolean
  hayIncumplimientoAlimentos: boolean
  deudorTieneEmpleoIdentificado: boolean
  hayCambioDomicilioORetencion: boolean
  existeConvenioOSentencia: boolean
  requiereConvivenciaSupervisada: boolean
  tieneDocumentosBasicos: boolean
  tieneComprobantesGastos: boolean
  tienePruebasComunicaciones: boolean
}

export interface FamiliarUrgenteResultado {
  urgencia: NivelUrgenciaFamiliar
  titulo: string
  resumenCaso: string
  medidasProvisionales: string[]
  checklistPruebas: string[]
  omisionesCriticas: string[]
  siguientesPasos: string[]
  fundamentos: string[]
  advertencias: string[]
}

function agregarSi(lista: string[], condicion: boolean, texto: string) {
  if (condicion) lista.push(texto)
}

export function evaluarFamiliarUrgente(datos: FamiliarUrgenteFormData): FamiliarUrgenteResultado {
  const medidas: string[] = []
  const pruebas: string[] = []
  const omisiones: string[] = []
  const pasos: string[] = []
  const fundamentos = [
    'Código Nacional de Procedimientos Civiles y Familiares, artículo 569: medidas provisionales en materia familiar.',
    'Código Nacional de Procedimientos Civiles y Familiares, artículo 568: comunicación al empleador e inscripción por incumplimiento alimentario, cuando proceda.',
    'Ley General de Acceso de las Mujeres a una Vida Libre de Violencia, artículos 28 a 31: órdenes de protección de urgente aplicación.',
    'Principio de interés superior de niñas, niños y adolescentes como eje de decisión judicial.',
  ]

  const casoIncluyeAlimentos = datos.tipoCaso === 'alimentos' || datos.tipoCaso === 'mixto'
  const casoIncluyeGuarda = datos.tipoCaso === 'guarda_custodia' || datos.tipoCaso === 'mixto'
  const casoIncluyeConvivencia = datos.tipoCaso === 'convivencia' || datos.tipoCaso === 'mixto'
  const casoIncluyeViolencia = datos.tipoCaso === 'violencia_familiar' || datos.tipoCaso === 'mixto' || datos.hayRiesgoViolencia

  agregarSi(medidas, casoIncluyeAlimentos, 'Solicitar alimentos provisionales con desglose de necesidades ordinarias y extraordinarias.')
  agregarSi(medidas, casoIncluyeAlimentos && datos.deudorTieneEmpleoIdentificado, 'Pedir oficio al centro de trabajo para descuento directo de alimentos.')
  agregarSi(medidas, casoIncluyeAlimentos && datos.hayIncumplimientoAlimentos, 'Solicitar apercibimientos y medidas por incumplimiento de obligaciones alimentarias.')
  agregarSi(medidas, casoIncluyeGuarda, 'Pedir guarda y custodia provisional precisando domicilio, red de apoyo y rutina de los menores.')
  agregarSi(medidas, casoIncluyeConvivencia, 'Proponer régimen provisional de convivencias con días, horarios, entregas y canales de comunicación.')
  agregarSi(medidas, datos.requiereConvivenciaSupervisada, 'Solicitar convivencias supervisadas o en centro de convivencia por riesgo o conflicto alto.')
  agregarSi(medidas, casoIncluyeViolencia, 'Solicitar órdenes de protección y medidas para impedir intimidación, acercamiento o comunicación abusiva.')
  agregarSi(medidas, datos.hayCambioDomicilioORetencion, 'Pedir medidas para evitar sustracción, retención u ocultamiento de niñas, niños o adolescentes.')

  pruebas.push('Actas de nacimiento de niñas, niños o adolescentes y documentos de identidad de las partes.')
  agregarSi(pruebas, casoIncluyeAlimentos, 'Comprobantes de gastos: escuela, salud, alimentos, transporte, vivienda, vestido y actividades ordinarias.')
  agregarSi(pruebas, casoIncluyeAlimentos, 'Datos del empleo, actividad económica, RFC, recibos, transferencias o indicios de capacidad económica del deudor.')
  agregarSi(pruebas, casoIncluyeGuarda || casoIncluyeConvivencia, 'Evidencia de cuidados cotidianos: horarios, escuela, médicos, red familiar, vivienda y comunicaciones relevantes.')
  agregarSi(pruebas, casoIncluyeViolencia, 'Mensajes, audios, fotografías, certificados médicos, reportes policiales, testigos y antecedentes de violencia.')
  agregarSi(pruebas, datos.existeConvenioOSentencia, 'Convenio, sentencia o expediente previo, incluyendo constancias de incumplimiento.')

  agregarSi(omisiones, datos.hayMenores && datos.numeroMenores <= 0, 'Se indicó que hay menores, pero no se capturó cuántos.')
  agregarSi(omisiones, !datos.tieneDocumentosBasicos, 'Faltan documentos base de identidad, parentesco o representación.')
  agregarSi(omisiones, casoIncluyeAlimentos && !datos.tieneComprobantesGastos, 'Faltan comprobantes de gastos para sostener monto de alimentos provisionales.')
  agregarSi(omisiones, casoIncluyeViolencia && !datos.tienePruebasComunicaciones, 'Faltan evidencias inmediatas de riesgo, amenazas o comunicaciones.')
  agregarSi(omisiones, casoIncluyeAlimentos && !datos.deudorTieneEmpleoIdentificado, 'No hay empleador identificado; conviene reunir indicios de ingresos o actividad económica.')

  pasos.push('Separar hechos por fecha, persona involucrada, prueba disponible y efecto en niñas, niños o adolescentes.')
  pasos.push('Preparar una petición breve de medidas provisionales antes de redactar la historia completa del conflicto.')
  agregarSi(pasos, casoIncluyeViolencia, 'Valorar canal urgente para orden de protección antes de promover pretensiones patrimoniales o de convivencia.')
  agregarSi(pasos, casoIncluyeAlimentos, 'Armar tabla mensual de necesidades y capacidad económica para justificar alimentos provisionales.')
  agregarSi(pasos, casoIncluyeConvivencia, 'Proponer un esquema de convivencia viable y verificable, evitando peticiones abiertas o ambiguas.')

  let urgencia: NivelUrgenciaFamiliar = 'ordinaria'
  if (datos.hayRiesgoViolencia || datos.hayAmenazasRecientes || datos.hayCambioDomicilioORetencion) {
    urgencia = 'urgente'
  } else if (datos.hayMenores || datos.hayIncumplimientoAlimentos || datos.requiereConvivenciaSupervisada) {
    urgencia = 'prioritaria'
  }

  const titulo = urgencia === 'urgente'
    ? 'Atención urgente: priorizar medidas de protección'
    : urgencia === 'prioritaria'
      ? 'Atención prioritaria: preparar medidas provisionales'
      : 'Atención ordinaria: ordenar expediente y pretensiones'

  const resumenCaso = [
    `Tipo de asunto: ${datos.tipoCaso.replace('_', ' ')}.`,
    datos.hayMenores ? `Involucra ${datos.numeroMenores || 'uno o más'} menor(es).` : 'No se capturaron menores involucrados.',
    datos.hayRiesgoViolencia ? 'Se reporta riesgo de violencia.' : 'No se reportó riesgo de violencia en la captura.',
    datos.existeConvenioOSentencia ? 'Existe antecedente de convenio, sentencia o expediente.' : 'No se indicó antecedente judicial o convenio previo.',
  ].join(' ')

  return {
    urgencia,
    titulo,
    resumenCaso,
    medidasProvisionales: medidas,
    checklistPruebas: pruebas,
    omisionesCriticas: omisiones,
    siguientesPasos: pasos,
    fundamentos,
    advertencias: [
      'Esta matriz no redacta una demanda final; ordena insumos para revisión profesional.',
      'En casos de violencia o riesgo para menores, verifica rutas de protección local y canales urgentes disponibles.',
      'Ajusta medidas y pruebas al código, lineamientos y criterios del órgano que conozca del asunto.',
    ],
  }
}
