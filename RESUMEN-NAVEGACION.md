# ROMANUS — Reorganización de navegación y arquitectura institucional

## Archivos nuevos

- `src/pages/LaboralSuiteCatalogPage.tsx` — catálogo de Laboral Suite (Finiquito, Liquidación, Aguinaldo, Vacaciones, Prima vacacional), en `/laboral-suite`.
- `src/pages/LabsLandingPage.tsx` — página pública de ROMANUS Labs, en `/labs`.
- `src/pages/ConCausaPage.tsx` — landing institucional, en `/con-causa`. Sin formularios, sin backend.
- `src/pages/AcercaDeRomanusPage.tsx` — Qué es ROMANUS / Misión / Visión / Valores, en `/acerca-de`.

## Archivos modificados

- `src/components/Navbar.tsx` — el menú principal ahora muestra los 6 ítems pedidos (Inicio, Productos, Laboral Suite, Labs, Con Causa, Acerca de); se redujo el `gap` de 6 a 4 para que entren cómodos en escritorio.
- `src/components/LaboralMXLayout.tsx` — se quitó el dropdown "Herramientas" y los enlaces directos (Cómo se calcula / Aviso legal / Acerca de). Solo queda el breadcrumb "Romanus › Laboral Suite". Esa navegación ahora vive en el catálogo de `/laboral-suite`.
- `src/App.tsx` — 4 rutas nuevas conectadas; **se eliminó un bug real que encontré al revisar**: el redirect legacy `/acerca-de → /productos/laboralmx/acerca-de` (de una ronda anterior) chocaba con la nueva ruta `/acerca-de` de ROMANUS — dos rutas idénticas en el mismo árbol. Lo quité; la página de Laboral Suite sigue intacta en su URL anidada.
- `src/pages/RomanusHome.tsx` — el botón "Calcular ahora" del hero ahora apunta a `/laboral-suite` en vez de `/productos/laboralmx` (los chips individuales de herramientas siguen igual, enlazando directo a cada calculadora).
- `src/pages/ProductosListing.tsx` — la tarjeta de Laboral Suite ahora enlaza a `/laboral-suite`.

## Sin tocar (verificado)

- `/labs/resico` — ruta, `LabsErrorBoundary`, `useNoIndex`, y toda la lógica de `resicoCalculations.ts`: intactos, cero ediciones.
- `laborCalculations.ts` — intacto, cero ediciones.
- Todos los Error Boundaries por calculadora (Finiquito, Liquidación, Resultado, Aguinaldo, Vacaciones, SDI) y el sistema de logging (`errorLogger.ts`): intactos.
- `/productos/laboralmx/*` (todas las calculadoras existentes, Cómo se calcula, Aviso legal, Acerca de Laboral Suite): siguen funcionando exactamente igual, en las mismas URLs.

## Decisiones que tomé y quiero que confirmes

1. **El catálogo de `/laboral-suite` no incluye SDI.** Seguí tu lista literal (Finiquito, Liquidación, Aguinaldo, Vacaciones, Prima vacacional), que no menciona SDI. SDI sigue funcionando en su URL de siempre, solo no aparece en esta tarjeta nueva. Dime si lo agrego.
2. **`/productos/laboralmx` (la página índice vieja) sigue existiendo, sin cambios**, en paralelo al nuevo `/laboral-suite`. Son dos páginas con contenido parecido ahora. No las consolidé porque no me lo pediste y prioricé no romper nada — pero es una duplicidad real que vale la pena resolver en una próxima iteración.
3. La página "Acerca de Laboral Suite" (con Román Gómez e Instagram) sigue en `/productos/laboralmx/acerca-de`, sin tocar. La nueva `/acerca-de` es exclusivamente la institucional de ROMANUS que pediste.

## Build

Verificación de tipos con TypeScript real + stubs manuales (sin red para `npm install`/`npm run build` real): cero errores nuevos. Mismo artefacto conocido de siempre en `SelectField.tsx`.

```bash
npm run build
git add .
git commit -m "Reorganizar navegacion principal: Laboral Suite, Labs, Con Causa y Acerca de como secciones de primer nivel"
git push origin main
```
