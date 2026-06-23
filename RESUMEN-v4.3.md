# ROMANUS v4.3 — Reorganización de Arquitectura y Navegación

## 1. Archivos modificados

- `src/components/Navbar.tsx` — se quitó "Labs"; contenedor del header ampliado (`max-w-3xl` → `max-w-5xl`, `px-6 lg:px-10`); gap entre ítems de `gap-4` a `gap-9`. Con solo 2 hijos visibles en desktop (logo + nav) y un contenedor más ancho, `justify-between` genera por sí solo el espacio amplio entre ROMANUS y el menú que pediste, sin necesitar márgenes adicionales que arriesgaran desbordar en pantallas medianas.
- `src/pages/LabsLandingPage.tsx` — se agregó `useNoIndex()`. Ya no es una sección pública.
- `src/pages/ProductosListing.tsx` — catálogo más sólido: Laboral Suite (activo) + "Próximamente nuevas soluciones fiscales" + "Próximamente nuevas soluciones empresariales". Labs no aparece.
- `src/pages/ConCausaPage.tsx` — reescrita con Propósito, Misión social, y un bloque "Programa de orientación gratuita (próximamente)" con las 3 áreas de enfoque (grupos vulnerables, pro bono, información comprensible) como tarjetas, no como una sola línea de texto.
- `src/pages/AcercaDeRomanusPage.tsx` — misma información (Qué es ROMANUS, Misión, Visión, Valores), reorganizada en tarjetas con eyebrow dorado y grid de valores, en vez de texto corrido.
- `src/App.tsx` — rutas reagrupadas y comentadas explícitamente bajo la jerarquía EMPRESA / PRODUCTOS / INICIATIVAS / INSTITUCIONAL / LABORATORIO INTERNO (ver sección 2). Sin cambios funcionales en las rutas existentes.
- `index.html` — referencia al favicon nuevo.

## Archivos nuevos

- `public/favicon.svg` — favicon temporal (ver sección 5).

## Sin tocar (verificado)

- Rutas `/labs` y `/labs/resico`: siguen funcionando exactamente igual, solo sin enlace en el menú. Cero rutas duplicadas (verificado).
- `resicoCalculations.ts`, `laborCalculations.ts`: cero ediciones.
- Todos los Error Boundaries y el sistema de logging: intactos.
- `/productos/laboralmx/*` (todas las calculadoras): sin cambios.

---

## 2. Decisión de arquitectura: la jerarquía institucional

Implementé la jerarquía que pediste directamente como estructura de comentarios en `App.tsx`, agrupando las rutas (no como un menú con categorías visibles — pediste explícitamente que el menú público fuera la lista plana de 5 ítems):

```
EMPRESA        → ROMANUS ("/")
PRODUCTOS      → Laboral Suite (activo) + futuros productos → /productos, /laboral-suite
INICIATIVAS    → Con Causa → /con-causa
INSTITUCIONAL  → Acerca de → /acerca-de
LABORATORIO INTERNO → Labs (oculto) → /labs, /labs/resico
```

Esto le da a cualquier desarrollador que abra `App.tsx` después de ti una explicación inmediata de "por qué" cada ruta vive donde vive, sin tener que inferirlo del código.

---

## 3. Homepage — análisis y recomendaciones (NO implementado, solo documentado, como pediste)

**Diagnóstico:** tienes razón. El hero de `RomanusHome.tsx` hoy dice "Calculadoras laborales gratuitas para México" como mensaje principal — eso vende *una herramienta*, no a ROMANUS como organización. La sección "¿Por qué ROMANUS?" existe pero queda después del catálogo de herramientas, cuando institucionalmente debería reforzar primero quién es ROMANUS.

**Recomendaciones para v4.4 (sin implementar todavía):**
1. Considerar mover "¿Por qué ROMANUS?" más arriba, antes o inmediatamente después del hero, para que la identidad institucional se lea antes que la propuesta de la herramienta específica.
2. El hero podría mantener la claridad actual (es buena para conversión) pero agregar una segunda línea breve que mencione explícitamente que Laboral Suite es "el primer producto" de un ecosistema más grande — ahora que existen Con Causa y la arquitectura de Productos, vale la pena que el visitante lo sepa desde el primer scroll.
3. Evaluar si la sección de "Filosofía" (la cita) debería moverse cerca de "¿Por qney ROMANUS?" para que ambos bloques institucionales queden juntos, en vez de separados por el catálogo de herramientas.

No toqué nada de esto — son solo observaciones para que decidas antes de la siguiente iteración.

---

## 4. Riesgo/duplicidad ya documentado (de la ronda anterior, sigue vigente)

`/productos/laboralmx` (la página índice vieja de Laboral Suite) sigue existiendo en paralelo a `/laboral-suite`. No las consolidé esta vez tampoco — sigue siendo candidata a limpieza en una futura versión, ahora más urgente porque la navegación ya está más madura.

---

## 5. Identidad visual básica — favicon

**No existía ningún favicon.** Implementé uno temporal: SVG simple, fondo navy (`#0F2744`), una "R" en dorado (`#D4AF37`) con tipografía serif del sistema (no depende de Google Fonts, así que carga instantáneo y funciona offline). Se ve nítido en cualquier tamaño porque es vectorial.

**Lo que NO hice, a propósito:** no generé `apple-touch-icon` ni un set completo de PNGs para distintas resoluciones (iOS históricamente tiene soporte inconsistente de favicons SVG para pantalla de inicio). Para v4.4, si quieren que ROMANUS se vea bien al "agregar a pantalla de inicio" en iPhone, recomiendo generar un `apple-touch-icon.png` (180×180) y un `manifest.json` básico — es rápido de hacer una vez que haya un logo definitivo, así que sugiero esperar a esa decisión de marca antes de invertir tiempo ahí.

---

## 6. Build

Verificación de tipos con TypeScript real + stubs manuales (sin red para `npm install`/`npm run build` real en este entorno): cero errores nuevos. Mismo artefacto conocido de siempre en `SelectField.tsx` (no relacionado).

```bash
npm run build
git add .
git commit -m "v4.3: reorganizar navegacion (quitar Labs del menu publico), jerarquia institucional, Con Causa y Acerca de mas solidos, favicon temporal"
git push origin main
```

---

## 7. Mejoras futuras recomendadas (v4.4)

1. Consolidar `/productos/laboralmx` con `/laboral-suite` (mismo contenido, dos rutas).
2. Implementar las recomendaciones de homepage de la sección 3.
3. Definir logo/favicon definitivo y generar el set completo de íconos (apple-touch-icon, manifest.json).
4. Decidir si "Cómo se calcula" y "Aviso legal" de Laboral Suite necesitan más visibilidad ahora que ya no tienen un sub-menú persistente (hoy solo se llega ahí desde los enlaces al pie del catálogo de `/laboral-suite`).
