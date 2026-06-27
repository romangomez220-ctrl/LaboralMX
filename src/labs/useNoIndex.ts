import { useEffect } from 'react'

/**
 * Inserta <meta name="robots" content="noindex, nofollow"> en
 * document.head SOLO mientras el componente que lo invoca está montado,
 * y lo retira al desmontarse. Esto evita tener que poner esta etiqueta
 * en index.html (que aplicaría a TODO el sitio, incluido el contenido
 * público que sí debe indexarse) — al ser una SPA, la única forma de
 * tener una etiqueta por-ruta es inyectarla/quitarla en tiempo de
 * ejecución.
 */
export function useNoIndex(enabled = true): void {
  useEffect(() => {
    if (!enabled) return undefined

    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    return () => {
      document.head.removeChild(meta)
    }
  }, [enabled])
}
