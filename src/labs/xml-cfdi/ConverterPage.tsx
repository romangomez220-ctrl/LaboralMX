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

import { useEffect, useState } from 'react'
import { converterConfig } from './config'
import { detectTipo, tryParseXml } from './core/detectTipo'
import { parseCfdi } from './core/parseCfdi'
import { parseNomina } from './core/parseNomina'
import { buildWorkbook } from './core/buildWorkbook'
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
  const texto = await leerArchivo(file)
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

  useEffect(() => {
    trackXmlConverterEvent('xml_cfdi_page_view')
  }, [])

  async function handleFilesSelected(files: File[]) {
    setProcesando(true)
    setExitosos([])
    setErrores([])

    const nuevosExitosos: CfdiParseado[] = []
    const nuevosErrores: ArchivoConError[] = []

    // Secuencial a propósito en esta fase de Labs. Migrar a Web Worker si el
    // lote típico supera ~100-150 archivos (el tope actual es 50).
    for (const file of files) {
      const resultado = await procesarArchivo(file)
      if (resultado.ok) {
        nuevosExitosos.push(resultado.data)
      } else {
        nuevosErrores.push(resultado.error)
      }
    }

    setExitosos(nuevosExitosos)
    setErrores(nuevosErrores)
    setProcesando(false)
  }

  function handleExport() {
    const blob = buildWorkbook(exitosos, errores, converterConfig.nominaEnabled)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cfdi-conversion-${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url) // se libera de inmediato, no queda referencia viva
    trackXmlConverterEvent('xml_cfdi_export_completed')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Identificación conceptual, igual que RESICO: parte de Fiscal Suite
          dentro de Labs. Solo etiqueta visual, no cambia rutas ni lógica. */}
      <p className="text-xs uppercase tracking-wide text-stone">
        Fiscal Suite <span className="mx-1 text-gray-300">›</span> Conversor XML CFDI
      </p>

      <LabsBadge />

      <div>
        <h1 className="text-2xl font-bold text-primary">Conversor de XML CFDI a Excel</h1>
        <p className="text-sm text-gray-500 mt-1">
          Convierte tus archivos XML de CFDI (incluye Nómina) a un libro de Excel, sin salir de tu
          navegador.
        </p>
      </div>

      <ConsentGate>
        {(consentGiven) => (
          <XmlUploadZone disabled={!consentGiven} onFilesSelected={handleFilesSelected} />
        )}
      </ConsentGate>

      {procesando && <p className="text-sm text-stone">Procesando archivos…</p>}

      {!procesando && (exitosos.length > 0 || errores.length > 0) && (
        <>
          <ConversionPreview resultados={exitosos} erroresCount={errores.length} onExport={handleExport} />
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
