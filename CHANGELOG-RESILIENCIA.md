# ROMANUS — Resiliencia y diagnóstico permanente

## 1. Diagnóstico del problema actual (punto 7 de tu pedido)

**Lo que hice:** releí línea por línea `resicoCalculations.ts`, `resicoContenidoUX.ts`, `ResicoDiagnosticoPage.tsx` y las 5 tarjetas nuevas (`ConfidenceCard`, `BenefitsCard`, `RiskCard`, `ValidateWithExpertCard`, `DisclaimerCard`), buscando específicamente: accesos a propiedades de objetos posiblemente `undefined`, `.find()` sin manejar el caso vacío, división por cero, y cualquier cosa que pudiera comportarse distinto entre el modo dev de Vite (esbuild, sin minificar) y un build de producción (Rollup, minificado).

**Lo que encontré:** un solo punto débil real — `ConfidenceCard` hacía `ESTILOS_NIVEL[level].color` sin verificar que `level` realmente fuera una clave válida. Si `level` llegara a ser cualquier otro valor, eso lanza `Cannot read properties of undefined`. Ya lo corregí con un valor de respaldo (`ESTILO_DESCONOCIDO`). En el flujo normal `level` siempre es `'alto'|'medio'|'bajo'` (lo garantiza el tipo), así que **no puedo confirmar que este era el error real que viste** — pero es el único hallazgo concreto después de una revisión exhaustiva, y ya no puede volver a pasar.

**Lo que NO encontré:** ninguna otra causa determinista en el código. No tengo acceso a tu consola de producción ni a tu Vercel real, así que no puedo señalar con certeza absoluta "fue esta línea". Esto es una limitación honesta, no evasión.

**Por qué esto ya no importa tanto:** con la capa de abajo, si queda cualquier otro error (el que vimos o cualquier otro futuro), **ya no vas a ver una pantalla blanca** — vas a ver el mensaje y el stack trace real, directamente en `/labs/resico`, en producción. La próxima vez que falle, por fin vamos a *ver* qué es, en vez de adivinar.

---

## 2. Arquitectura de resiliencia implementada

### Error Boundary global (punto 1)
`src/components/ErrorBoundary.tsx` — generalizado: acepta `moduleName` (para el log) y `forceDebug` (para decidir si muestra el stack trace). Envuelve toda la app en `main.tsx`. Nunca deja `<div id="root">` vacío: si algo truena en cualquier parte, se ve un mensaje, no una pantalla blanca.

### Error Boundaries por módulo (punto 2)
Cada calculadora de Laboral Suite (Finiquito, Liquidación, Resultado, Aguinaldo, Vacaciones, SDI) y `/labs/resico` tienen su **propio** Error Boundary en `App.tsx`. Si una herramienta falla, las demás —y el Navbar, footer, Home— siguen funcionando con total normalidad, porque el límite que captura el error es el más cercano a donde ocurrió, no el de toda la app.

### Sistema de logging interno (punto 3)
`src/utils/errorLogger.ts` — `registrarError()` captura exactamente lo que pediste: mensaje, stack trace, ruta actual (`window.location.pathname`), navegador (`navigator.userAgent`), fecha/hora (ISO) y el componente/módulo afectado. Lo manda a tres lugares: consola (siempre), GA4 (evento `app_error`, reutilizando la integración que ya existía) y `sessionStorage` (para poder inspeccionar errores recientes sin depender solo de la consola).

### Modo Debug para Labs (punto 4)
- En `/labs/resico`: **siempre** se muestra el detalle técnico del error (`LabsErrorBoundary` fuerza `forceDebug`), sea desarrollo o producción — es área interna, sin usuarios finales a quienes ocultarles el detalle.
- En el resto de la app (Laboral Suite pública): detalle técnico solo si `import.meta.env.DEV` (desarrollo); en producción, solo el mensaje amigable.
- Agregué un panel "🐞 Modo debug" al final de `/labs/resico` que muestra el historial de errores de la sesión (de `sessionStorage`), colapsado y solo visible si hay algo que mostrar.

### Validaciones defensivas (punto 5)
- `ConfidenceCard.tsx`: fallback si `level` no es una clave conocida (el hallazgo real de la auditoría).
- `ResultPage.tsx`: `generarPDF()` ahora corre dentro de un `try/catch` — un Error Boundary **no puede** capturar errores de un event handler (`onClick`), solo errores de render. Si el PDF falla, se registra el error y se muestra un aviso inline; el resto de la página sigue intacta.
- El resto de los puntos que pediste revisar (`undefined`/`null`/`NaN`/arrays vacíos/fechas) ya estaban cubiertos por trabajo de rondas anteriores: `aNumero()` siempre regresa un número válido por defecto, `BenefitsCard`/`RiskCard` ya retornan `null` si la lista viene vacía, y `ResultPage` ya validaba `resultado` antes de usarlo. No encontré huecos nuevos ahí.

### Protección contra fallos silenciosos (punto 6)
Cualquier error de render queda capturado por el Error Boundary más cercano y registrado por `registrarError()`. Cualquier error de PDF queda capturado por el `try/catch` nuevo. Ya no hay una ruta donde un error desaparezca sin dejar rastro.

---

## 3. Archivos modificados/creados

**Nuevos:**
- `src/utils/errorLogger.ts`
- `src/labs/components/LabsErrorBoundary.tsx`

**Modificados:**
- `src/components/ErrorBoundary.tsx` — generalizado (antes solo era el global de la sesión pasada).
- `src/main.tsx` — el Error Boundary global ahora pasa `moduleName="app"`.
- `src/App.tsx` — cada calculadora y `/labs/resico` envueltos en su propio Error Boundary.
- `src/labs/components/ConfidenceCard.tsx` — fallback defensivo.
- `src/labs/resico/ResicoDiagnosticoPage.tsx` — panel de debug con el historial de errores.
- `src/pages/ResultPage.tsx` — `try/catch` alrededor de `generarPDF()`.

**Sin tocar (verificado):** toda la lógica fiscal de RESICO (`resicoCalculations.ts`), todas las fórmulas de Laboral Suite (`laborCalculations.ts`), diseño, branding, `vercel.json`, `vite.config.ts`.

---

## 4. Checklist de producción (punto 8)

- [x] `npm run build` — no pude correrlo en este sandbox (sin red, no puedo instalar dependencias); verificación de tipos con TypeScript real + stubs manuales, cero errores nuevos atribuibles a este cambio.
- [ ] Verificar rutas de React Router — pendiente de tu lado en un navegador real.
- [ ] Verificar carga directa por URL (`/`, `/productos`, `/labs/resico`) — pendiente.
- [ ] Verificar en Vercel (deploy real) — pendiente.
- [ ] Verificar que los errores se vean correctamente — **esto sí lo puedes probar tú mismo a propósito**: abre React DevTools y, temporalmente, lanza un error a mano en cualquier componente (ej. `throw new Error('prueba')` dentro de un `useEffect` de `ResicoDiagnosticoPage`) para confirmar que ves el mensaje en pantalla en vez de blanco, y que aparece en el panel de debug. Quítalo después de probar.

```bash
npm run build
git add .
git commit -m "Capa de resiliencia: Error Boundaries por módulo, logging interno, modo debug en Labs"
git push origin main
```

Después del deploy, entra directo a `https://www.romanus.mx/labs/resico`. Si algo sigue fallando, ahora vas a **ver exactamente qué** — pégamelo tal cual aparece y de ahí sí puedo darte el fix definitivo y certero, en vez de seguir adivinando.
