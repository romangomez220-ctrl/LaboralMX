/**
 * ConverterPage.tsx
 * -----------------------------------------------------------------------------
 * Orquestador del módulo. Monta en /labs/xml-cfdi (oculta de navegación
 * pública vía useNoIndex, igual que el resto de Labs).
 *
 * RECORDATORIO DE ARQUITECTURA (no borrar este bloque):
 *   - Ningún archivo de este módulo hace fetch/XHR con contenido del XML.
 *   - Ningún archivo de este módulo escribe en localStorage/sessionStorage/IndexedDB.
 *   - El único contacto con analytics es trackXmlConverterEvent(), que no
 *     acepta payload. Ver analytics/xmlConverterAnalytics.ts.
 *   - El estado de esta página vive en memoria de React. Al desmontar el
 *     componente (cambiar de ruta), React libera ese estado; no hay nada que
 *     limpiar manualmente más allá de eso.
 * -----------------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from 'react'
import { converterConfig } from './config'
import { detectTipo, tryParseXml } from './core/detectTipo'
import { parseCfdi } from './core/parseCfdi'
import { parseNomina } from './core/parseNomina'
import { buildWorkbook } from './core/buildWorkbook'
import { summarizeCfdiAudit, validateCfdiBatch } from './core/validateCfdi'
import type { ArchivoConError, CfdiParseado } from './core/types'
import { trackXmlConverterEvent } from './analytics/xmlConverterAnalytics'
import { ConsentGate } from './components/ConsentGate'
import { XmlUploadZone } from './components/XmlUploadZone'
import { ConversionPreview } from './components/ConversionPreview'
import { ErrorPanel } from './components/ErrorPanel'
import { NominaToggleGate } from './components/nomina/NominaToggleGate'
import LabsBadge from '../components/LabsBadge'
import { useNoIndex } from '../useNoIndex'

async function leerArchivo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

async function procesarArchivo(
  file: File,
): Promise<{ ok: true; data: CfdiParseado } | { ok: false; error: ArchivoConError }> {
  if (file.size > converterConfig.maxFileBytes) {
    return { ok: false, error: { archivo: file.name, motivo: 'El archivo supera el límite de 5 MB.' } }
  }

  let texto: string
  try {
    texto = await leerArchivo(file)
  } catch {
    return { ok: false, error: { archivo: file.name, motivo: 'No fue posible leer el archivo.' } }
  }
  const xmlDoc = tryParseXml(texto)

  if (!xmlDoc) {
    return { ok: false, error: { archivo: file.name, motivo: 'XML mal formado.' } }
  }

  const tipo = detectTipo(xmlDoc)

  if (tipo === 'no-cfdi') {
    return {
      ok: false,
      error: { archivo: file.name, motivo: 'No se reconoce como CFDI (falta cfdi:Comprobante).' },
    }
  }

  if (tipo === 'cfdi-nomina' && !converterConfig.nominaEnabled) {
    return {
      ok: false,
      error: { archivo: file.name, motivo: 'CFDI de Nómina — no soportado en esta versión.' },
    }
  }

  try {
    const comprobante = parseCfdi(xmlDoc, file.name)
    const nomina = tipo === 'cfdi-nomina' ? parseNomina(xmlDoc) : undefined
    return { ok: true, data: { archivo: file.name, comprobante, nomina } }
  } catch (err) {
    return {
      ok: false,
      error: { archivo: file.name, motivo: err instanceof Error ? err.message : 'Error de parseo.' },
    }
  }
}

export default function ConverterPage() {
  useNoIndex()

  const [exitosos, setExitosos] = useState<CfdiParseado[]>([])
  const [errores, setErrores] = useState<ArchivoConError[]>([])
  const [procesando, setProcesando] = useState(false)
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 })
  const incidencias = useMemo(() => validateCfdiBatch(exitosos), [exitosos])
  const resumen = useMemo(() => summarizeCfdiAudit(exitosos, incidencias), [exitosos, incidencias])

  useEffect(() => {
    trackXmlConverterEvent('xml_cfdi_page_view')
  }, [])

  async function handleFilesSelected(files: File[]) {
    setProcesando(true)
    setProgreso({ actual: 0, total: files.length })
    setExitosos([])
    setErrores([])

    const nuevosExitosos: CfdiParseado[] = []
    const nuevosErrores: ArchivoConError[] = []

    // Secuencial a propósito para mantener el orden y acotar memoria. Se cede
    // el hilo cada 20 archivos; antes de aumentar el límite actual se deberá
    // mover el parseo completo a un Web Worker.
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      const resultado = await procesarArchivo(file)
      if (resultado.ok) {
        nuevosExitosos.push(resultado.data)
      } else {
        nuevosErrores.push(resultado.error)
      }
      setProgreso({ actual: index + 1, total: files.length })
      if ((index + 1) % 20 === 0) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      }
    }

    setExitosos(nuevosExitosos)
    setErrores(nuevosErrores)
    setProcesando(false)
    if (files.length > 0) trackXmlConverterEvent('xml_cfdi_audit_completed')
  }

  async function handleExport() {
    if (!converterConfig.pilotExportEnabled) return
    const blob = await buildWorkbook(exitosos, errores, incidencias, converterConfig.nominaEnabled)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `romanus-auditoria-cfdi-${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url) // se libera de inmediato, no queda referencia viva
    trackXmlConverterEvent('xml_cfdi_export_completed')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Identificación conceptual, igual que RESICO: parte de Contable Suite
          dentro de Labs. Solo etiqueta visual, no cambia rutas ni lógica. */}
      <p className="text-xs uppercase tracking-wide text-stone">
        Contable Suite <span className="mx-1 text-gray-300">›</span> Auditor CFDI
      </p>

      <LabsBadge />

      <div>
        <h1 className="text-2xl font-bold text-primary">Auditor de XML CFDI</h1>
        <p className="text-sm text-gray-500 mt-1">
          Revisa lotes de CFDI, identifica duplicados y diferencias de estructura o importes y
          concentra los resultados sin sacar tus archivos del navegador.
        </p>
      </div>

      <ConsentGate>
        {(consentGiven) => (
          <XmlUploadZone disabled={!consentGiven} onFilesSelected={handleFilesSelected} />
        )}
      </ConsentGate>

      {procesando && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4" role="status" aria-live="polite">
          <div className="flex justify-between text-sm text-stone">
            <span>Analizando documentos…</span>
            <span>{progreso.actual} / {progreso.total}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${progreso.total > 0 ? (progreso.actual / progreso.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {!procesando && (exitosos.length > 0 || errores.length > 0) && (
        <>
          <ConversionPreview
            resultados={exitosos}
            erroresCount={errores.length}
            incidencias={incidencias}
            resumen={resumen}
            onExport={handleExport}
            pilotExportEnabled={converterConfig.pilotExportEnabled}
          />
          <NominaToggleGate>
            {exitosos.some((r) => r.nomina) && (
              <p className="text-sm text-stone">
                Se detectaron recibos de nómina — incluidos en la hoja "Nómina" del Excel.
              </p>
            )}
          </NominaToggleGate>
          <ErrorPanel errores={errores} />
        </>
      )}
    </div>
  )
}
