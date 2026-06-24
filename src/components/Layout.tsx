import { Outlet, Link } from 'react-router-dom'
import Navbar from './Navbar'
import AnalyticsTracker from './AnalyticsTracker'
import WhatsAppFloatingButton from './WhatsAppFloatingButton'
import ContactWhatsAppButton from './ContactWhatsAppButton'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnalyticsTracker />
      <Navbar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-primary text-white">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="font-display text-lg tracking-widest uppercase text-gold">ROMANUS</p>
          <p className="mt-2 text-sm text-gray-300">Tecnología. Estrategia. Conocimiento.</p>

          <div className="mt-5">
            <ContactWhatsAppButton variant="inverse" />
          </div>

          {/* Disclaimer global obligatorio (Fase 1, v4.5). Al vivir en el
              footer global, aparece automáticamente en Inicio, Productos,
              Laboral Suite, Con Causa y Acerca de, sin tener que repetirlo
              manualmente en cada página. */}
          <p className="mt-6 text-xs text-gray-300 max-w-xl mx-auto leading-relaxed">
            ROMANUS es un proyecto jurídico y tecnológico en fase de validación. La información
            contenida en este sitio tiene fines exclusivamente informativos y educativos. No
            constituye asesoría legal, representación legal ni genera relación abogado-cliente.
          </p>

          <nav className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <Link to="/aviso-legal" className="hover:text-gold transition underline">
              Aviso Legal
            </Link>
            <Link to="/privacidad" className="hover:text-gold transition underline">
              Aviso de Privacidad
            </Link>
            <Link to="/terminos" className="hover:text-gold transition underline">
              Términos y Condiciones
            </Link>
          </nav>

          <p className="mt-4 text-xs text-gray-400">© {new Date().getFullYear()} ROMANUS.</p>
          <p className="mt-1 text-[10px] text-gray-500 tracking-wide">
            ROMANUS v4.6 — Intake &amp; Privacy Hardening
          </p>
        </div>
      </footer>

      <WhatsAppFloatingButton />
    </div>
  )
}
