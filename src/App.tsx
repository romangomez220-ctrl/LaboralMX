import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LaboralMXLayout from './components/LaboralMXLayout'
import ErrorBoundary from './components/ErrorBoundary'
import LabsErrorBoundary from './labs/components/LabsErrorBoundary'
import RequireValidatorAuth from './labs-portal/components/RequireValidatorAuth'
import RequireAdminAuth from './labs-portal/components/RequireAdminAuth'
import { listarToolsDeLabs } from './catalog/registry'

const RomanusHome = lazy(() => import('./pages/RomanusHome'))
const HerramientasPublicasPage = lazy(() => import('./pages/HerramientasPublicasPage'))
const HerramientaPublicaPage = lazy(() => import('./pages/HerramientaPublicaPage'))
const LaboralSuiteCatalogPage = lazy(() => import('./pages/LaboralSuiteCatalogPage'))
const ConCausaPage = lazy(() => import('./pages/ConCausaPage'))
const AcercaDeRomanusPage = lazy(() => import('./pages/AcercaDeRomanusPage'))
const AvisoLegalPage = lazy(() => import('./pages/AvisoLegalPage'))
const PrivacidadPage = lazy(() => import('./pages/PrivacidadPage'))
const TerminosPage = lazy(() => import('./pages/TerminosPage'))
const ResicoDiagnosticoPage = lazy(() => import('./labs/resico/ResicoDiagnosticoPage'))
const DevolucionImpuestosPage = lazy(() => import('./labs/contable-suite/pages/DevolucionImpuestosPage'))
const ResicoAnualPage = lazy(() => import('./labs/contable-suite/pages/ResicoAnualPage'))
const ArrendamientoComparadorPage = lazy(() => import('./labs/contable-suite/pages/ArrendamientoComparadorPage'))
const PlataformasDigitalesPage = lazy(() => import('./labs/contable-suite/pages/PlataformasDigitalesPage'))
const TerminosProcesalesPage = lazy(() => import('./labs/juridico-suite/pages/TerminosProcesalesPage'))
const FamiliarUrgentePage = lazy(() => import('./labs/juridico-suite/pages/FamiliarUrgentePage'))
const ValidadorLoginPage = lazy(() => import('./labs-portal/pages/ValidadorLoginPage'))
const RestablecerPasswordPage = lazy(() => import('./labs-portal/pages/RestablecerPasswordPage'))
const ValidadorPortalPage = lazy(() => import('./labs-portal/pages/ValidadorPortalPage'))
const AdminLoginPage = lazy(() => import('./labs-portal/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./labs-portal/admin/AdminDashboardPage'))
const AdminValidadoresPage = lazy(() => import('./labs-portal/admin/AdminValidadoresPage'))
const AdminHerramientasPage = lazy(() => import('./labs-portal/admin/AdminHerramientasPage'))
const AdminFeedbackPage = lazy(() => import('./labs-portal/admin/AdminFeedbackPage'))
const AdminEstadisticasPage = lazy(() => import('./labs-portal/admin/AdminEstadisticasPage'))
const ConverterPage = lazy(() => import('./labs/xml-cfdi/ConverterPage'))
const ResultPage = lazy(() => import('./pages/ResultPage'))

// Mapa clave (del Registro Central) → componente real. Es el único lugar
// donde el Registro (datos) se conecta con la implementación (código) —
// el propio Registro nunca importa React ni sabe que estos componentes
// existen (principio "referencia de implementación opaca").
const COMPONENTES_LABS: Record<string, LazyExoticComponent<ComponentType>> = {
  resico: ResicoDiagnosticoPage,
  'xml-cfdi': ConverterPage,
  'devolucion-impuestos': DevolucionImpuestosPage,
  'resico-anual': ResicoAnualPage,
  arrendamiento: ArrendamientoComparadorPage,
  'plataformas-digitales': PlataformasDigitalesPage,
  'terminos-procesales': TerminosProcesalesPage,
  'familiar-urgente': FamiliarUrgentePage,
}
const Home = lazy(() => import('./pages/Home'))
const FiniquitoCalculator = lazy(() => import('./pages/FiniquitoCalculator'))
const LiquidacionCalculator = lazy(() => import('./pages/LiquidacionCalculator'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const LegalNotice = lazy(() => import('./pages/LegalNotice'))
const About = lazy(() => import('./pages/About'))
const SDICalculator = lazy(() => import('./pages/SDICalculator'))
const AguinaldoCalculator = lazy(() => import('./pages/AguinaldoCalculator'))
const VacacionesCalculator = lazy(() => import('./pages/VacacionesCalculator'))
const CalculatorCampaignLanding = lazy(() => import('./pages/CalculatorCampaignLanding'))
const PaidReportPage = lazy(() => import('./pages/PaidReportPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm text-stone">
        <span className="h-2 w-2 animate-pulse rounded-full bg-gold" aria-hidden="true" />
        Preparando contenido…
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
        <Route path="/productos" element={<Navigate to="/herramientas" replace />} />
        <Route path="/herramientas" element={<HerramientasPublicasPage />} />
        <Route path="/herramientas/:clave" element={<HerramientaPublicaPage />} />
        <Route path="/laboral-suite" element={<LaboralSuiteCatalogPage />} />
        <Route path="/reporte" element={<PaidReportPage />} />

        {/* Landings de adquisición: rutas cortas y enfocadas que reutilizan
            las calculadoras existentes sin duplicar lógica de negocio. */}
        <Route
          path="/calcular-finiquito"
          element={
            <ErrorBoundary moduleName="campaign-finiquito">
              <CalculatorCampaignLanding calculator="finiquito" />
            </ErrorBoundary>
          }
        />
        <Route
          path="/calcular-liquidacion"
          element={
            <ErrorBoundary moduleName="campaign-liquidacion">
              <CalculatorCampaignLanding calculator="liquidacion" />
            </ErrorBoundary>
          }
        />

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
                    <Suspense fallback={<RouteFallback />}>
                      <Componente />
                    </Suspense>
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
                <Suspense fallback={<RouteFallback />}>
                  <ResultPage />
                </Suspense>
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
    </Suspense>
  )
}
