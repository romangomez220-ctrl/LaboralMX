import { Outlet, Link } from 'react-router-dom'
import Navbar from './Navbar'
import AnalyticsTracker from './AnalyticsTracker'
import WhatsAppFloatingButton from './WhatsAppFloatingButton'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnalyticsTracker />
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 bg-primary text-white">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
            <div>
              <p className="font-display text-base tracking-[0.22em] uppercase text-gold">ROMANUS</p>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-300">
                Herramientas informativas para México. No sustituyen asesoría profesional.
              </p>
            </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-300">
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
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} ROMANUS</p>
          </div>
        </div>
      </footer>

      <WhatsAppFloatingButton />
    </div>
  )
}
