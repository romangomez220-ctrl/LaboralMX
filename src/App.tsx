import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LaboralMXLayout from './components/LaboralMXLayout'
import RomanusHome from './pages/RomanusHome'
import ProductosListing from './pages/ProductosListing'
import Home from './pages/Home'
import FiniquitoCalculator from './pages/FiniquitoCalculator'
import LiquidacionCalculator from './pages/LiquidacionCalculator'
import ResultPage from './pages/ResultPage'
import HowItWorks from './pages/HowItWorks'
import LegalNotice from './pages/LegalNotice'
import About from './pages/About'
import SDICalculator from './pages/SDICalculator'
import AguinaldoCalculator from './pages/AguinaldoCalculator'
import VacacionesCalculator from './pages/VacacionesCalculator'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* ROMANUS: plataforma. Por ahora solo se muestra Laboral Suite;
            la arquitectura queda lista para futuros productos sin
            anunciar nada que todavía no existe. */}
        <Route path="/" element={<RomanusHome />} />
        <Route path="/productos" element={<ProductosListing />} />

        {/* Producto: Laboral Suite (sección anidada con su propia sub-navegación) */}
        <Route path="/productos/laboralmx" element={<LaboralMXLayout />}>
          <Route index element={<Home />} />
          <Route path="finiquito" element={<FiniquitoCalculator />} />
          <Route path="liquidacion" element={<LiquidacionCalculator />} />
          <Route path="resultado" element={<ResultPage />} />
          <Route path="aguinaldo" element={<AguinaldoCalculator />} />
          <Route path="vacaciones" element={<VacacionesCalculator />} />
          <Route path="sdi" element={<SDICalculator />} />
          <Route path="como-se-calcula" element={<HowItWorks />} />
          <Route path="aviso-legal" element={<LegalNotice />} />
          <Route path="acerca-de" element={<About />} />
        </Route>

        {/* Redirecciones desde las URLs anteriores de Laboral Suite (antes
            LaboralMX, ya compartidas/indexadas), para no romper enlaces. */}
        <Route path="/finiquito" element={<Navigate to="/productos/laboralmx/finiquito" replace />} />
        <Route path="/liquidacion" element={<Navigate to="/productos/laboralmx/liquidacion" replace />} />
        <Route path="/resultado" element={<Navigate to="/productos/laboralmx/resultado" replace />} />
        <Route path="/aguinaldo" element={<Navigate to="/productos/laboralmx/aguinaldo" replace />} />
        <Route path="/vacaciones" element={<Navigate to="/productos/laboralmx/vacaciones" replace />} />
        <Route path="/sdi" element={<Navigate to="/productos/laboralmx/sdi" replace />} />
        <Route path="/como-se-calcula" element={<Navigate to="/productos/laboralmx/como-se-calcula" replace />} />
        <Route path="/aviso-legal" element={<Navigate to="/productos/laboralmx/aviso-legal" replace />} />
        <Route path="/acerca-de" element={<Navigate to="/productos/laboralmx/acerca-de" replace />} />

        {/* Las tarjetas "Próximamente" (Romanus AI, Consulting, Analytics,
            Legal) se retiraron por instrucción explícita: no se anuncian
            productos inexistentes. Si esas URLs llegaron a compartirse,
            se redirige al listado real de productos en vez de un 404. */}
        <Route path="/productos/romanus-ai" element={<Navigate to="/productos" replace />} />
        <Route path="/productos/romanus-consulting" element={<Navigate to="/productos" replace />} />
        <Route path="/productos/romanus-analytics" element={<Navigate to="/productos" replace />} />
        <Route path="/productos/romanus-legal" element={<Navigate to="/productos" replace />} />
        <Route path="/productos/contratos" element={<Navigate to="/productos" replace />} />
        <Route path="/productos/recursos-juridicos" element={<Navigate to="/productos" replace />} />
      </Route>
    </Routes>
  )
}
