import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/analytics'

/**
 * No renderiza nada visible. Vive dentro del Layout global, por lo que
 * observa los cambios de ruta de absolutamente todas las páginas de la
 * app (ROMANUS y, anidadas, todas las de Laboral Suite), y registra un
 * page view de GA4 en cada una.
 */
export default function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location.pathname, location.search])

  return null
}
