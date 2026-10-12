import type {
  CfdiParseado,
  IncidenciaCfdi,
  ResumenAuditoriaCfdi,
  SeveridadIncidencia,
} from './types'

const RFC_PATTERN = /^(?:[A-Z&Ñ]{3,4})\d{6}[A-Z0-9]{3}$/i
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MONEY_TOLERANCE = 0.02

function decimal(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function differs(left: number, right: number): boolean {
  return Math.abs(left - right) > MONEY_TOLERANCE
}

function issue(
  counter: { value: number },
  file: string,
  code: string,
  severity: SeveridadIncidencia,
  title: string,
  detail: string,
  field?: string,
): IncidenciaCfdi {
  counter.value += 1
  return {
    id: `${file}:${code}:${counter.value}`,
    codigo: code,
    severidad: severity,
    archivo: file,
    titulo: title,
    detalle: detail,
    campo: field,
  }
}

function validateRequiredFields(result: CfdiParseado, counter: { value: number }): IncidenciaCfdi[] {
  const { archivo, comprobante } = result
  const fields: Array<[string, string]> = [
    ['Version', comprobante.version],
    ['Fecha', comprobante.fecha],
    ['TipoDeComprobante', comprobante.tipoDeComprobante],
    ['SubTotal', comprobante.subTotal],
    ['Total', comprobante.total],
    ['Moneda', comprobante.moneda],
    ['LugarExpedicion', comprobante.lugarExpedicion],
    ['Emisor.Rfc', comprobante.emisorRfc],
    ['Receptor.Rfc', comprobante.receptorRfc],
  ]

  const issues = fields
    .filter(([, value]) => !value.trim())
    .map(([field]) => issue(
      counter,
      archivo,
      'CFDI_CAMPO_REQUERIDO',
      'alta',
      'Campo esencial ausente',
      `No se encontró el atributo ${field}. Revisa el XML contra la documentación aplicable del SAT.`,
      field,
    ))

  if (comprobante.conceptos.length === 0) {
    issues.push(issue(
      counter,
      archivo,
      'CFDI_SIN_CONCEPTOS',
      'alta',
      'CFDI sin conceptos',
      'El comprobante no contiene conceptos reconocibles; puede estar incompleto o usar una estructura no soportada.',
      'Conceptos',
    ))
  }

  return issues
}

function validateIdentity(result: CfdiParseado, counter: { value: number }): IncidenciaCfdi[] {
  const { archivo, comprobante } = result
  const issues: IncidenciaCfdi[] = []

  if (!comprobante.uuid) {
    issues.push(issue(
      counter,
      archivo,
      'CFDI_SIN_UUID',
      'alta',
      'No se encontró UUID fiscal',
      'No se localizó un TimbreFiscalDigital con UUID. El archivo podría no estar timbrado o estar incompleto.',
      'TimbreFiscalDigital.UUID',
    ))
  } else if (!UUID_PATTERN.test(comprobante.uuid)) {
    issues.push(issue(
      counter,
      archivo,
      'CFDI_UUID_FORMATO',
      'alta',
      'UUID con formato inesperado',
      'El identificador encontrado no coincide con el formato UUID esperado.',
      'TimbreFiscalDigital.UUID',
    ))
  }

  if (comprobante.emisorRfc && !RFC_PATTERN.test(comprobante.emisorRfc)) {
    issues.push(issue(
      counter,
      archivo,
      'CFDI_RFC_EMISOR_FORMATO',
      'media',
      'RFC del emisor con formato inesperado',
      'La estructura del RFC del emisor no coincide con el patrón general de persona física o moral.',
      'Emisor.Rfc',
    ))
  }

  if (comprobante.receptorRfc && !RFC_PATTERN.test(comprobante.receptorRfc)) {
    issues.push(issue(
      counter,
      archivo,
      'CFDI_RFC_RECEPTOR_FORMATO',
      'media',
      'RFC del receptor con formato inesperado',
      'La estructura del RFC del receptor no coincide con el patrón general de persona física o moral.',
      'Receptor.Rfc',
    ))
  }

  if (comprobante.version && comprobante.version !== '4.0') {
    issues.push(issue(
      counter,
      archivo,
      'CFDI_VERSION_REVISAR',
      'informativa',
      'Versión distinta de CFDI 4.0',
      `Se detectó la versión ${comprobante.version}. Confirma que corresponda al periodo y uso que estás revisando.`,
      'Version',
    ))
  }

  if (comprobante.fecha && Number.isNaN(Date.parse(comprobante.fecha))) {
    issues.push(issue(
      counter,
      archivo,
      'CFDI_FECHA_INVALIDA',
      'media',
      'Fecha no reconocible',
      'La fecha del comprobante no pudo interpretarse como una fecha válida.',
      'Fecha',
    ))
  }

  return issues
}

function validateAmounts(result: CfdiParseado, counter: { value: number }): IncidenciaCfdi[] {
  const { archivo, comprobante } = result
  const issues: IncidenciaCfdi[] = []
  const subtotal = decimal(comprobante.subTotal)
  const total = decimal(comprobante.total)
  const discount = decimal(comprobante.descuento) ?? 0

  if (subtotal === null || subtotal < 0 || total === null || total < 0 || discount < 0) {
    issues.push(issue(
      counter,
      archivo,
      'CFDI_IMPORTES_INVALIDOS',
      'alta',
      'Importes generales inválidos',
      'Subtotal, descuento o total contienen un valor no numérico o negativo.',
      'SubTotal/Descuento/Total',
    ))
  }

  if (subtotal !== null && discount > subtotal + MONEY_TOLERANCE) {
    issues.push(issue(
      counter,
      archivo,
      'CFDI_DESCUENTO_SUPERA_SUBTOTAL',
      'alta',
      'El descuento supera el subtotal',
      'Revisa los importes generales y los descuentos aplicados a los conceptos.',
      'Descuento',
    ))
  }

  const conceptAmounts: number[] = []
  comprobante.conceptos.forEach((concept, index) => {
    const quantity = decimal(concept.cantidad)
    const unitValue = decimal(concept.valorUnitario)
    const amount = decimal(concept.importe)
    if (quantity === null || unitValue === null || amount === null || quantity < 0 || unitValue < 0 || amount < 0) {
      issues.push(issue(
        counter,
        archivo,
        'CFDI_CONCEPTO_IMPORTE_INVALIDO',
        'alta',
        `Importe inválido en concepto ${index + 1}`,
        'Cantidad, valor unitario o importe no son numéricos o contienen un valor negativo.',
        `Conceptos[${index}]`,
      ))
      return
    }
    conceptAmounts.push(amount)
    if (differs(quantity * unitValue, amount)) {
      issues.push(issue(
        counter,
        archivo,
        'CFDI_CONCEPTO_CALCULO',
        'media',
        `Diferencia aritmética en concepto ${index + 1}`,
        `Cantidad × valor unitario difiere del importe por más de ${MONEY_TOLERANCE.toFixed(2)}.`,
        `Conceptos[${index}].Importe`,
      ))
    }
  })

  if (subtotal !== null && conceptAmounts.length === comprobante.conceptos.length) {
    const conceptTotal = conceptAmounts.reduce((sum, amount) => sum + amount, 0)
    if (differs(conceptTotal, subtotal)) {
      issues.push(issue(
        counter,
        archivo,
        'CFDI_SUBTOTAL_CONCEPTOS',
        'media',
        'El subtotal difiere de la suma de conceptos',
        `La suma de importes de conceptos (${conceptTotal.toFixed(2)}) no coincide con el subtotal (${subtotal.toFixed(2)}).`,
        'SubTotal',
      ))
    }
  }

  return issues
}

function validatePayroll(result: CfdiParseado, counter: { value: number }): IncidenciaCfdi[] {
  if (!result.nomina) return []
  const { archivo, nomina } = result
  const issues: IncidenciaCfdi[] = []

  const totals: Array<[string, string | undefined, number]> = [
    [
      'TotalPercepciones',
      nomina.totalPercepciones,
      nomina.percepciones.reduce(
        (sum, row) => sum + (decimal(row.importeGravado) ?? 0) + (decimal(row.importeExento) ?? 0),
        0,
      ),
    ],
    [
      'TotalDeducciones',
      nomina.totalDeducciones,
      nomina.deducciones.reduce((sum, row) => sum + (decimal(row.importe) ?? 0), 0),
    ],
    [
      'TotalOtrosPagos',
      nomina.totalOtrosPagos,
      nomina.otrosPagos.reduce((sum, row) => sum + (decimal(row.importe) ?? 0), 0),
    ],
  ]

  totals.forEach(([field, declared, calculated]) => {
    const declaredNumber = decimal(declared)
    if (declaredNumber !== null && differs(declaredNumber, calculated)) {
      issues.push(issue(
        counter,
        archivo,
        `NOMINA_${field.toUpperCase()}_DIFERENCIA`,
        'alta',
        `Diferencia en ${field}`,
        `El total declarado (${declaredNumber.toFixed(2)}) difiere de la suma de partidas (${calculated.toFixed(2)}).`,
        `Nomina.${field}`,
      ))
    }
  })

  if (nomina.fechaInicialPago && nomina.fechaFinalPago
    && nomina.fechaInicialPago > nomina.fechaFinalPago) {
    issues.push(issue(
      counter,
      archivo,
      'NOMINA_PERIODO_INVERTIDO',
      'alta',
      'Periodo de nómina invertido',
      'La fecha inicial de pago es posterior a la fecha final.',
      'Nomina.FechaInicialPago/FechaFinalPago',
    ))
  }

  return issues
}

export function validateCfdiBatch(results: CfdiParseado[]): IncidenciaCfdi[] {
  const counter = { value: 0 }
  const issues = results.flatMap((result) => [
    ...validateRequiredFields(result, counter),
    ...validateIdentity(result, counter),
    ...validateAmounts(result, counter),
    ...validatePayroll(result, counter),
  ])

  const filesByUuid = new Map<string, string[]>()
  results.forEach(({ archivo, comprobante }) => {
    if (!comprobante.uuid) return
    const normalized = comprobante.uuid.toUpperCase()
    filesByUuid.set(normalized, [...(filesByUuid.get(normalized) ?? []), archivo])
  })

  filesByUuid.forEach((files, uuid) => {
    if (files.length < 2) return
    files.forEach((file) => {
      issues.push(issue(
        counter,
        file,
        'CFDI_UUID_DUPLICADO',
        'critica',
        'UUID duplicado dentro del lote',
        `El UUID ${uuid} aparece en ${files.length} archivos del lote. Revisa antes de contabilizar o procesar pagos.`,
        'TimbreFiscalDigital.UUID',
      ))
    })
  })

  return issues
}

export function summarizeCfdiAudit(
  results: CfdiParseado[],
  issues: IncidenciaCfdi[],
): ResumenAuditoriaCfdi {
  const filesWithIssues = new Set(issues.map((item) => item.archivo))
  const duplicatedUuids = new Set(
    issues.filter((item) => item.codigo === 'CFDI_UUID_DUPLICADO').map((item) => item.detalle),
  )
  const bySeverity = (severity: SeveridadIncidencia) =>
    issues.filter((item) => item.severidad === severity).length

  return {
    documentos: results.length,
    sinIncidencias: results.filter((item) => !filesWithIssues.has(item.archivo)).length,
    conIncidencias: filesWithIssues.size,
    criticas: bySeverity('critica'),
    altas: bySeverity('alta'),
    medias: bySeverity('media'),
    informativas: bySeverity('informativa'),
    uuidDuplicados: duplicatedUuids.size,
  }
}
