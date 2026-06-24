/**
 * components/XmlUploadZone.tsx
 * -----------------------------------------------------------------------------
 * Solo lee archivos del input/drop al estado en memoria del componente padre.
 * No sube nada a ningún lado — FileReader trabaja enteramente en el navegador.
 * -----------------------------------------------------------------------------
 */

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { converterConfig } from '../config'

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
      const xmlFiles = Array.from(fileList).filter((f) => f.name.toLowerCase().endsWith('.xml'))

      if (xmlFiles.length > converterConfig.maxBatchFiles) {
        setLimitWarning(
          `Esta versión de Labs admite hasta ${converterConfig.maxBatchFiles} archivos por lote. ` +
            `Se tomarán los primeros ${converterConfig.maxBatchFiles}.`,
        )
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
          Hasta {converterConfig.maxBatchFiles} archivos por lote (fase de validación)
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
      {limitWarning && <p className="mt-2 text-sm text-warning">{limitWarning}</p>}
    </div>
  )
}
