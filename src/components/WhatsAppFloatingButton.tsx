import { useLocation } from 'react-router-dom'
import { WHATSAPP_LINK } from '../config/contacto'
import { trackWhatsAppIntent } from '../utils/analytics'
import WhatsAppIcon from './WhatsAppIcon'

/**
 * Botón flotante visible en toda la web (se monta una sola vez, en el
 * Layout global). z-40: por debajo del Modal (z-50) si alguno está
 * abierto, por encima del contenido normal y del header (z-10).
 *
 * Las páginas que ya incluyen una acción de contacto propia no muestran
 * este acceso para evitar llamadas a la acción duplicadas.
 */
export default function WhatsAppFloatingButton() {
  const location = useLocation()
  const tieneContactoPropio = location.pathname === '/con-causa' || location.pathname === '/acerca-de'
  const esFlujoCalculadora = [
    '/calcular-finiquito',
    '/calcular-liquidacion',
    '/productos/laboralmx/finiquito',
    '/productos/laboralmx/liquidacion',
    '/productos/laboralmx/resultado',
  ].includes(location.pathname)

  if (esFlujoCalculadora || tieneContactoPropio) return null

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar a ROMANUS por WhatsApp"
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 sm:bottom-5 sm:right-5 z-40 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-gold shadow-lg border border-gold/40 hover:bg-primary-light transition"
      onClick={() => trackWhatsAppIntent('floating_button', 'direct')}
    >
      <WhatsAppIcon className="w-7 h-7" />
    </a>
  )
}
