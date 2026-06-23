import { WHATSAPP_LINK } from '../config/contacto'
import WhatsAppIcon from './WhatsAppIcon'

/**
 * Botón flotante visible en toda la web (se monta una sola vez, en el
 * Layout global). z-40: por debajo del Modal (z-50) si alguno está
 * abierto, por encima del contenido normal y del header (z-10).
 */
export default function WhatsAppFloatingButton() {
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
