import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import AnalyticsTracker from './AnalyticsTracker'

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
          <p className="mt-2 text-sm text-gray-300">
            Tecnología. Estrategia. Conocimiento.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            © {new Date().getFullYear()} ROMANUS. Laboral Suite es una herramienta informativa;
            no constituye asesoría legal.
          </p>
          <p className="mt-1 text-[10px] text-gray-500 tracking-wide">ROMANUS v0.2</p>
        </div>
      </footer>
    </div>
  )
}
