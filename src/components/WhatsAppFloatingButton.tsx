import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { WHATSAPP_LINK } from '../config/contacto'
import WhatsAppIcon from './WhatsAppIcon'
import WhatsAppConsentModal from './WhatsAppConsentModal'

/**
 * Botón flotante visible en toda la web (se monta una sola vez, en el
 * Layout global). z-40: por debajo del Modal (z-50) si alguno está
 * abierto, por encima del contenido normal y del header (z-10).
 *
 * En /con-causa pide el consentimiento obligatorio antes de continuar a
 * WhatsApp (Fase 5, v4.5) — es el mismo botón flotante de siempre, pero
 * el usuario podría estar leyendo esa página específicamente y usar
 * este acceso en vez del botón "Contáctanos" de la página. En el resto
 * del sitio sigue siendo un enlace directo, sin cambios.
 */
export default function WhatsAppFloatingButton() {
  const location = useLocation()
  const [modalAbierto, setModalAbierto] = useState(false)
  const requiereConsentimiento = location.pathname === '/con-causa'

  if (requiereConsentimiento) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          aria-label="Contactar a ROMANUS por WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-gold shadow-lg border border-gold/40 hover:bg-primary-light transition"
        >
          <WhatsAppIcon className="w-7 h-7" />
        </button>
        <WhatsAppConsentModal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} />
      </>
    )
  }

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar a ROMANUS por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-gold shadow-lg border border-gold/40 hover:bg-primary-light transition"
    >
      <WhatsAppIcon className="w-7 h-7" />
    </a>
  )
}
