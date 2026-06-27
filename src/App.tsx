import type { ComponentType } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LaboralMXLayout from './components/LaboralMXLayout'
import ErrorBoundary from './components/ErrorBoundary'
import RomanusHome from './pages/RomanusHome'
import ProductosListing from './pages/ProductosListing'
import LaboralSuiteCatalogPage from './pages/LaboralSuiteCatalogPage'
import ConCausaPage from './pages/ConCausaPage'
import AcercaDeRomanusPage from './pages/AcercaDeRomanusPage'
import AvisoLegalPage from './pages/AvisoLegalPage'
import PrivacidadPage from './pages/PrivacidadPage'
import TerminosPage from './pages/TerminosPage'
import ResicoDiagnosticoPage from './labs/resico/ResicoDiagnosticoPage'
import ConverterPage from './labs/xml-cfdi/ConverterPage'
import DevolucionImpuestosPage from './labs/contable-suite/pages/DevolucionImpuestosPage'
import ResicoAnualPage from './labs/contable-suite/pages/ResicoAnualPage'
import ArrendamientoComparadorPage from './labs/contable-suite/pages/ArrendamientoComparadorPage'
import PlataformasDigitalesPage from './labs/contable-suite/pages/PlataformasDigitalesPage'
import TerminosProcesalesPage from './labs/juridico-suite/pages/TerminosProcesalesPage'
import FamiliarUrgentePage from './labs/juridico-suite/pages/FamiliarUrgentePage'
import LabsErrorBoundary from './labs/components/LabsErrorBoundary'
import RequireValidatorAuth from './labs-portal/components/RequireValidatorAuth'
import RequireAdminAuth from './labs-portal/components/RequireAdminAuth'
import ValidadorLoginPage from './labs-portal/pages/ValidadorLoginPage'
import RestablecerPasswordPage from './labs-portal/pages/RestablecerPasswordPage'
import ValidadorPortalPage from './labs-portal/pages/ValidadorPortalPage'
import AdminLoginPage from './labs-portal/admin/AdminLoginPage'
import AdminDashboardPage from './labs-portal/admin/AdminDashboardPage'
import AdminValidadoresPage from './labs-portal/admin/AdminValidadoresPage'
import AdminHerramientasPage from './labs-portal/admin/AdminHerramientasPage'
import AdminFeedbackPage from './labs-portal/admin/AdminFeedbackPage'
import AdminEstadisticasPage from './labs-portal/admin/AdminEstadisticasPage'
import { listarToolsDeLabs } from './catalog/registry'

// Mapa clave (del Registro Central) → componente real. Es el único lugar
// donde el Registro (datos) se conecta con la implementación (código) —
// el propio Registro nunca importa React ni sabe que estos componentes
// existen (principio "referencia de implementación opaca").
const COMPONENTES_LABS: Record<string, ComponentType> = {
  resico: ResicoDiagnosticoPage,
  'xml-cfdi': ConverterPage,
  'devolucion-impuestos': DevolucionImpuestosPage,
  'resico-anual': ResicoAnualPage,
  arrendamiento: ArrendamientoComparadorPage,
  'plataformas-digitales': PlataformasDigitalesPage,
  'terminos-procesales': TerminosProcesalesPage,
  'familiar-urgente': FamiliarUrgentePage,
}
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
        {/* ============================================================
            JERARQUÍA INSTITUCIONAL DE ROMANUS (v4.4)
            ============================================================
            EMPRESA        → ROMANUS (marca/plataforma, "/")
            PRODUCTOS      → catálogo en /productos:
                              - Laboral Suite (activo) → /laboral-suite
                              - Próximamente: Contable Suite, Empresarial Suite
                              (Laboral Suite ya NO es un ítem independiente
                              del menú principal: vive dentro de Productos)
            INICIATIVAS    → Con Causa (iniciativa social pública)
            INSTITUCIONAL  → Acerca de (la organización)
            LABORATORIO INTERNO → Labs: NO es un producto ni una sección
                              pública. No tiene enlace en ningún menú,
                              catálogo ni landing. Solo es alcanzable por
                              URL directa, y lleva noindex/nofollow.
            ============================================================ */}

        {/* EMPRESA */}
        <Route path="/" element={<RomanusHome />} />

        {/* PRODUCTOS (catálogo). Laboral Suite mantiene su propia ruta,
            solo que ahora se llega a ella desde /productos, no desde el
            menú principal directamente. */}
        <Route path="/productos" element={<ProductosListing />} />
        <Route path="/laboral-suite" element={<LaboralSuiteCatalogPage />} />

        {/* INICIATIVAS */}
        <Route path="/con-causa" element={<ConCausaPage />} />

        {/* INSTITUCIONAL */}
        <Route path="/acerca-de" element={<AcercaDeRomanusPage />} />

        {/* LEGAL (v4.5 — Compliance & Trust). A nivel de plataforma,
            distintas del aviso legal específico de Laboral Suite en
            /productos/laboralmx/aviso-legal, que no se tocó. */}
        <Route path="/aviso-legal" element={<AvisoLegalPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        <Route path="/terminos" element={<TerminosPage />} />

        {/* LABORATORIO INTERNO — ROMANUS Labs (v6.0: Portal de Validadores).
            Oculto de toda navegación pública (noindex/nofollow), pero ahora
            además requiere sesión de validador para entrar — antes solo
            dependía de no tener enlace público. El login y el panel admin
            quedan fuera del guard (si no, nadie podría llegar a loguearse). */}
        <Route path="/labs/login" element={<ValidadorLoginPage />} />
        <Route path="/labs/restablecer-password" element={<RestablecerPasswordPage />} />
        <Route path="/labs/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/labs/admin"
          element={
            <RequireAdminAuth>
              <AdminDashboardPage />
            </RequireAdminAuth>
          }
        />
        <Route
          path="/labs/admin/validadores"
          element={
            <RequireAdminAuth>
              <AdminValidadoresPage />
            </RequireAdminAuth>
          }
        />
        <Route
          path="/labs/admin/herramientas"
          element={
            <RequireAdminAuth>
              <AdminHerramientasPage />
            </RequireAdminAuth>
          }
        />
        <Route
          path="/labs/admin/feedback"
          element={
            <RequireAdminAuth>
              <AdminFeedbackPage />
            </RequireAdminAuth>
          }
        />
        <Route
          path="/labs/admin/estadisticas"
          element={
            <RequireAdminAuth>
              <AdminEstadisticasPage />
            </RequireAdminAuth>
          }
        />

        <Route
          path="/labs"
          element={
            <RequireValidatorAuth>
              <ValidadorPortalPage />
            </RequireValidatorAuth>
          }
        />
        {/* Las rutas de las herramientas internas de Labs se generan
            desde el Registro Central (src/catalog/registry.ts) — antes
            existían aquí bloques de <Route> escritos a mano, que era
            exactamente la doble fuente de verdad (rutas vs. metadata de
            seedData.ts) que la Fase 1 de la Constitución Técnica v1.0
            identificó como deuda técnica. */}
        {listarToolsDeLabs().map((tool) => {
          const Componente = COMPONENTES_LABS[tool.clave]
          if (!Componente) return null
          return (
            <Route
              key={tool.id}
              path={tool.ruta}
              element={
                <RequireValidatorAuth>
                  <LabsErrorBoundary moduleName={tool.clave}>
                    <Componente />
                  </LabsErrorBoundary>
                </RequireValidatorAuth>
              }
            />
          )
        })}

        {/* Producto: Laboral Suite (sección anidada con su propia sub-navegación).
            Cada calculadora tiene su propio Error Boundary: si una falla,
            las demás y el resto de ROMANUS siguen funcionando con normalidad. */}
        <Route path="/productos/laboralmx" element={<LaboralMXLayout />}>
          <Route index element={<Home />} />
          <Route
            path="finiquito"
            element={
              <ErrorBoundary moduleName="finiquito">
                <FiniquitoCalculator />
              </ErrorBoundary>
            }
          />
          <Route
            path="liquidacion"
            element={
              <ErrorBoundary moduleName="liquidacion">
                <LiquidacionCalculator />
              </ErrorBoundary>
            }
          />
          <Route
            path="resultado"
            element={
              <ErrorBoundary moduleName="resultado">
                <ResultPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="aguinaldo"
            element={
              <ErrorBoundary moduleName="aguinaldo">
                <AguinaldoCalculator />
              </ErrorBoundary>
            }
          />
          <Route
            path="vacaciones"
            element={
              <ErrorBoundary moduleName="vacaciones">
                <VacacionesCalculator />
              </ErrorBoundary>
            }
          />
          <Route
            path="sdi"
            element={
              <ErrorBoundary moduleName="sdi">
                <SDICalculator />
              </ErrorBoundary>
            }
          />
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
        {/* Nota: los redirects legacy de /aviso-legal y /acerca-de se
            retiraron a propósito: ambas rutas ahora son páginas de
            ROMANUS a nivel de plataforma (ver arriba). Las páginas de
            Laboral Suite siguen disponibles, sin cambios, en
            /productos/laboralmx/aviso-legal y /productos/laboralmx/acerca-de
            — solo que ya no comparten la URL corta con las de ROMANUS. */}

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

        {/* Red de seguridad: cualquier ruta no reconocida regresa al inicio
            en vez de dejar el <Outlet/> vacío dentro del Layout. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
