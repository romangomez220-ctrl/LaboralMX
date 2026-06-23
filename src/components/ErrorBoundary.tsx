import { Component, type ErrorInfo, type ReactNode } from 'react'
import { registrarError } from '../utils/errorLogger'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Nombre del módulo que protege esta instancia, para el log (ej. "app", "finiquito", "labs/resico"). */
  moduleName: string
  /**
   * Si es true, siempre muestra el detalle técnico del error (se usa en
   * ROMANUS Labs). Si se omite, se decide automáticamente según el modo
   * de build de Vite: detalle técnico en desarrollo, mensaje amigable en
   * producción — tal como se pidió explícitamente.
   */
  forceDebug?: boolean
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Red de seguridad reutilizable. Úsala envolviendo el árbol completo de
 * la app (en main.tsx) Y, por separado, envolviendo cada módulo crítico
 * (cada calculadora, cada herramienta de Labs) — así, si un módulo
 * falla, el límite más interno lo contiene y el resto de la app sigue
 * funcionando, en vez de desmontar toda la aplicación.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    registrarError(error, this.props.moduleName, info.componentStack ?? undefined)
  }

  render() {
    if (this.state.error) {
      const mostrarDebug = this.props.forceDebug ?? import.meta.env.DEV

      return (
        <div
          style={{
            minHeight: '40vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
            background: '#F8F8F6',
            color: '#1f2937',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <h1 style={{ color: '#0F2744', fontSize: '22px', marginBottom: '8px' }}>
              Algo salió mal
            </h1>
            <p style={{ color: '#6B7280', marginBottom: '16px', fontSize: '14px' }}>
              Ocurrió un error inesperado en esta sección ({this.props.moduleName}). El resto de
              ROMANUS sigue funcionando con normalidad. Intenta recargar o vuelve al inicio.
            </p>
            <a href="/" style={{ color: '#0F2744', textDecoration: 'underline' }}>
              Ir al inicio
            </a>
            {mostrarDebug && (
              <pre
                style={{
                  marginTop: '24px',
                  fontSize: '11px',
                  color: '#9CA3AF',
                  textAlign: 'left',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
