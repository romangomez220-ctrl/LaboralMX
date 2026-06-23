import { WHATSAPP_LINK } from '../config/contacto'
import WhatsAppIcon from './WhatsAppIcon'

interface ContactWhatsAppButtonProps {
  label?: string
  variant?: 'solid' | 'outline' | 'inverse'
}

const VARIANTES: Record<string, string> = {
  solid: 'bg-primary text-white hover:bg-primary-light',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  // "inverse" para usarse sobre fondos navy (ej. el footer, que ya es bg-primary)
  inverse: 'border-2 border-gold text-gold hover:bg-gold hover:text-primary',
}

/**
 * Botón "Contáctanos" reutilizable hacia WhatsApp. Mismo destino que el
 * botón flotante (WHATSAPP_LINK), pero pensado para insertarse dentro
 * del flujo normal de una página (Footer, Con Causa, Acerca de,
 * Productos), no como elemento fijo.
 */
export default function ContactWhatsAppButton({
  label = 'Contáctanos',
  variant = 'outline',
}: ContactWhatsAppButtonProps) {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition ${VARIANTES[variant]}`}
    >
      <WhatsAppIcon className="w-5 h-5" />
      {label}
    </a>
  )
}
