import { describe, expect, it } from 'vitest'
import type { CfdiParseado } from './types'
import { buildWorkbook } from './buildWorkbook'
import { summarizeCfdiAudit, validateCfdiBatch } from './validateCfdi'

function cfdi(file: string, uuid: string, overrides: Partial<CfdiParseado['comprobante']> = {}): CfdiParseado {
  return {
    archivo: file,
    comprobante: {
      uuid,
      version: '4.0',
      fecha: '2026-10-10T10:30:00',
      tipoDeComprobante: 'I',
      subTotal: '1000.00',
      total: '1000.00',
      moneda: 'MXN',
      lugarExpedicion: '06000',
      emisorRfc: 'EKU9003173C9',
      receptorRfc: 'XAXX010101000',
      conceptos: [{
        claveProdServ: '84111506',
        cantidad: '2',
        claveUnidad: 'E48',
        descripcion: 'Servicio',
        valorUnitario: '500.00',
        importe: '1000.00',
        impuestos: [],
      }],
      ...overrides,
    },
  }
}

describe('Auditor CFDI', () => {
  it('no crea alertas para un CFDI estructuralmente consistente', () => {
    const issues = validateCfdiBatch([
      cfdi('correcto.xml', '11111111-2222-4333-8444-555555555555'),
    ])
    expect(issues).toEqual([])
  })

  it('detecta UUID repetidos en todos los archivos afectados', () => {
    const uuid = '11111111-2222-4333-8444-555555555555'
    const issues = validateCfdiBatch([cfdi('uno.xml', uuid), cfdi('dos.xml', uuid)])
    const duplicates = issues.filter((item) => item.codigo === 'CFDI_UUID_DUPLICADO')
    expect(duplicates).toHaveLength(2)
    expect(duplicates.every((item) => item.severidad === 'critica')).toBe(true)
  })

  it('señala diferencias de concepto y subtotal sin dictaminar validez fiscal', () => {
    const item = cfdi('diferencias.xml', 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', {
      subTotal: '900.00',
      conceptos: [{
        claveProdServ: '84111506',
        cantidad: '3',
        claveUnidad: 'E48',
        descripcion: 'Servicio',
        valorUnitario: '400.00',
        importe: '1000.00',
        impuestos: [],
      }],
    })
    const codes = validateCfdiBatch([item]).map((issue) => issue.codigo)
    expect(codes).toContain('CFDI_CONCEPTO_CALCULO')
    expect(codes).toContain('CFDI_SUBTOTAL_CONCEPTOS')
  })

  it('resume documentos afectados y severidades', () => {
    const uuid = '11111111-2222-4333-8444-555555555555'
    const results = [cfdi('uno.xml', uuid), cfdi('dos.xml', uuid)]
    const issues = validateCfdiBatch(results)
    expect(summarizeCfdiAudit(results, issues)).toMatchObject({
      documentos: 2,
      sinIncidencias: 0,
      conIncidencias: 2,
      criticas: 2,
      uuidDuplicados: 1,
    })
  })

  it('genera un archivo XLSX sin utilizar el lector vulnerable anterior', async () => {
    const result = cfdi('correcto.xml', '11111111-2222-4333-8444-555555555555')
    const blob = await buildWorkbook([result], [], [], true)
    const signature = new Uint8Array(await blob.slice(0, 2).arrayBuffer())
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(Array.from(signature)).toEqual([0x50, 0x4b])
  })
})
