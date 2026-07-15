import { useState } from 'react'
import { WHATSAPP_LINK } from '../config/contacto'
import { trackWhatsAppIntent } from '../utils/analytics'
import WhatsAppIcon from './WhatsAppIcon'
import WhatsAppConsentModal from './WhatsAppConsentModal'

interface ContactWhatsAppButtonProps {
  label?: string
  variant?: 'solid' | 'outline' | 'inverse'
  /**
   * Si es true, no enlaza directo a WhatsApp: abre primero el modal de
   * consentimiento obligatorio (Fase 5, v4.5). Se usa específicamente en
   * el canal de WhatsApp de ROMANUS con Causa, donde existe el riesgo de
   * que se asuma una relación abogado-cliente que no existe. El resto de
   * los usos de este botón (footer, Acerca de, Productos) son contacto
   * general y siguen enlazando directo, sin cambios de comportamiento.
   */
  requireConsent?: boolean
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
  requireConsent = false,
}: ContactWhatsAppButtonProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const clases = `inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition ${VARIANTES[variant]}`

  if (requireConsent) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            trackWhatsAppIntent(label, 'consent_required')
            setModalAbierto(true)
          }}
          className={clases}
        >
          <WhatsAppIcon className="w-5 h-5" />
          {label}
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
      className={clases}
      onClick={() => trackWhatsAppIntent(label, 'direct')}
    >
      <WhatsAppIcon className="w-5 h-5" />
      {label}
    </a>
  )
}
