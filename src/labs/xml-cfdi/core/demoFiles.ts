const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>'

function standardCfdi(options: {
  uuid: string
  folio: string
  quantity: string
  unitValue: string
  conceptAmount: string
  subtotal: string
  total: string
}): string {
  return `${XML_HEADER}
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="DEMO" Folio="${options.folio}" Fecha="2026-10-10T10:30:00" TipoDeComprobante="I" SubTotal="${options.subtotal}" Total="${options.total}" Moneda="MXN" LugarExpedicion="06000">
  <cfdi:Emisor Rfc="EKU9003173C9" Nombre="EMPRESA DEMOSTRACION SA DE CV" RegimenFiscal="601" />
  <cfdi:Receptor Rfc="XAXX010101000" Nombre="CLIENTE DEMOSTRACION" UsoCFDI="G03" DomicilioFiscalReceptor="06000" RegimenFiscalReceptor="616" />
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="84111506" Cantidad="${options.quantity}" ClaveUnidad="E48" Descripcion="Servicio demostrativo" ValorUnitario="${options.unitValue}" Importe="${options.conceptAmount}" ObjetoImp="01" />
  </cfdi:Conceptos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="${options.uuid}" FechaTimbrado="2026-10-10T10:31:00" />
  </cfdi:Complemento>
</cfdi:Comprobante>`
}

/** Datos completamente ficticios; sirven para conocer el producto sin exponer CFDI reales. */
export function createDemoCfdiFiles(): File[] {
  const duplicatedUuid = '11111111-2222-4333-8444-555555555555'
  return [
    new File([
      standardCfdi({
        uuid: duplicatedUuid,
        folio: '1001',
        quantity: '2',
        unitValue: '500.00',
        conceptAmount: '1000.00',
        subtotal: '1000.00',
        total: '1000.00',
      }),
    ], 'demo-cfdi-correcto.xml', { type: 'application/xml' }),
    new File([
      standardCfdi({
        uuid: duplicatedUuid,
        folio: '1002',
        quantity: '3',
        unitValue: '400.00',
        conceptAmount: '1000.00',
        subtotal: '900.00',
        total: '900.00',
      }),
    ], 'demo-cfdi-con-incidencias.xml', { type: 'application/xml' }),
  ]
}
