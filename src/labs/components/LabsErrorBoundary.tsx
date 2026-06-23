import type { ReactNode } from 'react'
import ErrorBoundary from '../../components/ErrorBoundary'

interface LabsErrorBoundaryProps {
  children: ReactNode
  moduleName: string
}

/**
 * En /labs siempre se muestra el detalle técnico del error, tanto en
 * desarrollo como en producción — es área interna de validación, no hay
 * usuarios finales a quienes esconderles el detalle, y es justo donde
 * más se necesita ver la causa real para corregirla rápido.
 */
export default function LabsErrorBoundary({ children, moduleName }: LabsErrorBoundaryProps) {
  return (
    <ErrorBoundary moduleName={`labs/${moduleName}`} forceDebug>
      {children}
    </ErrorBoundary>
  )
}
