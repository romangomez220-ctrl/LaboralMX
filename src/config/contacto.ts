/**
 * Contacto oficial de WhatsApp de ROMANUS.
 *
 * WHATSAPP_BUSINESS_LINK: enlace corto de WhatsApp Business. No admite
 * texto precargado de forma confiable, así que solo se usa para
 * contacto directo sin formulario (footer, Acerca de, Productos).
 *
 * WHATSAPP_NUMBER_LINK: enlace por número, sí admite "?text=" para
 * precargar un mensaje. Se usa específicamente en el flujo de intake de
 * Con Causa (ver WhatsAppConsentModal.tsx), donde sí hay un mensaje que
 * precargar con las respuestas del usuario.
 *
 * WHATSAPP_LINK se mantiene como alias del enlace de negocio para no
 * romper ningún uso existente que ya lo importaba.
 */
export const WHATSAPP_BUSINESS_LINK = 'https://wa.me/message/BYKKTJWFITQ5P1'
export const WHATSAPP_NUMBER_LINK = 'https://wa.me/525539257479'
export const WHATSAPP_LINK = WHATSAPP_BUSINESS_LINK
export const WHATSAPP_NUMERO_VISIBLE = '+52 55 3925 7479'

/**
 * Correos de privacidad/contacto — v4.6: por instrucción explícita, NO
 * se publica todavía ningún correo (ni personal ni definitivo) mientras
 * el proyecto se formaliza. Se deja la estructura lista: en cuanto
 * existan, basta con asignar el valor aquí — el Aviso de Privacidad ya
 * está preparado para mostrarlos automáticamente sin tener que
 * reescribir el documento.
 */
export const EMAIL_PRIVACIDAD: string | null = null
export const EMAIL_CONTACTO: string | null = null
