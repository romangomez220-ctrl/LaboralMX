import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import FiniquitoCalculator from './pages/FiniquitoCalculator'
import LiquidacionCalculator from './pages/LiquidacionCalculator'
import ResultPage from './pages/ResultPage'
import HowItWorks from './pages/HowItWorks'
import LegalNotice from './pages/LegalNotice'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/finiquito" element={<FiniquitoCalculator />} />
        <Route path="/liquidacion" element={<LiquidacionCalculator />} />
        <Route path="/resultado" element={<ResultPage />} />
        <Route path="/como-se-calcula" element={<HowItWorks />} />
        <Route path="/aviso-legal" element={<LegalNotice />} />
        <Route path="/acerca-de" element={<About />} />
      </Route>
    </Routes>
  )
}
