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
          <div style={{ maxWidth: '520px' }}>
            <h1 style={{ color: '#0F2744', fontSize: '22px', marginBottom: '8px' }}>
              No pudimos mostrar esta sección
            </h1>
            <p style={{ color: '#6B7280', marginBottom: '16px', fontSize: '14px' }}>
              Recarga la página para intentarlo de nuevo. Si el problema continúa, vuelve al inicio.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{ border: 0, borderRadius: '8px', background: '#0F2744', color: '#fff', padding: '10px 16px', fontWeight: 600, cursor: 'pointer' }}
              >
                Recargar
              </button>
              <a href="/" style={{ border: '1px solid #0F2744', borderRadius: '8px', color: '#0F2744', padding: '9px 16px', fontWeight: 600, textDecoration: 'none' }}>
                Volver al inicio
              </a>
            </div>
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
