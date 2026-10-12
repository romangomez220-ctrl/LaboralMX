/**
 * components/XmlUploadZone.tsx
 * -----------------------------------------------------------------------------
 * Solo lee archivos del input/drop al estado en memoria del componente padre.
 * No sube nada a ningún lado — FileReader trabaja enteramente en el navegador.
 * -----------------------------------------------------------------------------
 */

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { converterConfig } from '../config'
import { createDemoCfdiFiles } from '../core/demoFiles'
import { trackXmlConverterEvent } from '../analytics/xmlConverterAnalytics'

interface XmlUploadZoneProps {
  disabled: boolean
  onFilesSelected: (files: File[]) => void
}

export function XmlUploadZone({ disabled, onFilesSelected }: XmlUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [limitWarning, setLimitWarning] = useState<string | null>(null)

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return
      const candidates = Array.from(fileList).filter((f) => f.name.toLowerCase().endsWith('.xml'))
      const xmlFiles: File[] = []
      let totalBytes = 0
      let oversized = 0
      let overBatchSize = 0

      for (const file of candidates) {
        if (file.size > converterConfig.maxFileBytes) {
          oversized += 1
          continue
        }
        if (totalBytes + file.size > converterConfig.maxBatchBytes) {
          overBatchSize += 1
          continue
        }
        totalBytes += file.size
        xmlFiles.push(file)
      }

      if (xmlFiles.length > converterConfig.maxBatchFiles) {
        setLimitWarning(
          `Esta versión admite hasta ${converterConfig.maxBatchFiles} archivos por lote. ` +
            `Se tomarán los primeros ${converterConfig.maxBatchFiles}.`,
        )
      } else if (oversized > 0 || overBatchSize > 0) {
        setLimitWarning(
          `${oversized + overBatchSize} archivo(s) se omitieron por exceder los límites de seguridad ` +
            '(5 MB por XML y 25 MB por lote).',
        )
      } else if (candidates.length === 0) {
        setLimitWarning('Selecciona archivos con extensión .xml.')
      } else {
        setLimitWarning(null)
      }

      onFilesSelected(xmlFiles.slice(0, converterConfig.maxBatchFiles))
    },
    [onFilesSelected],
  )

  return (
    <div>
      <div
        className={[
          'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
            : dragOver
              ? 'border-gold bg-warning-light'
              : 'border-gray-300 hover:border-gold',
        ].join(' ')}
        onDragOver={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          setDragOver(false)
          if (!disabled) handleFiles(e.dataTransfer.files)
        }}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <p className="font-medium text-primary">
          {disabled
            ? 'Marca la casilla de arriba para habilitar la carga'
            : 'Arrastra tus archivos XML aquí, o haz clic para seleccionarlos'}
        </p>
        <p className="mt-1 text-sm text-stone">
          Hasta {converterConfig.maxBatchFiles} XML por lote · 5 MB por archivo · procesamiento local
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xml"
          multiple
          disabled={disabled}
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
        />
      </div>
      <button
        type="button"
        disabled={disabled}
        className="mt-3 text-sm font-semibold text-primary underline decoration-gold underline-offset-4 disabled:cursor-not-allowed disabled:text-gray-400"
        onClick={() => {
          if (disabled) return
          trackXmlConverterEvent('xml_cfdi_demo_loaded')
          setLimitWarning(null)
          onFilesSelected(createDemoCfdiFiles())
        }}
      >
        Probar con 2 CFDI ficticios
      </button>
      {limitWarning && <p className="mt-2 text-sm text-warning">{limitWarning}</p>}
    </div>
  )
}
