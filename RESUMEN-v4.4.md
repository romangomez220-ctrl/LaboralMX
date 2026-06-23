# ROMANUS v4.4 — Contacto WhatsApp + corrección de navegación

## Archivos nuevos

- `src/config/contacto.ts` — `WHATSAPP_LINK` (constante editable) y `WHATSAPP_NUMERO_VISIBLE`.
- `src/components/WhatsAppIcon.tsx` — glifo SVG en línea, sin dependencias nuevas.
- `src/components/WhatsAppFloatingButton.tsx` — botón flotante, esquina inferior derecha, `fixed bottom-5 right-5 z-40`.
- `src/components/ContactWhatsAppButton.tsx` — botón "Contáctanos" reutilizable (variantes `solid`/`outline`/`inverse`).

## Archivos modificados

- `src/components/Layout.tsx` — botón flotante montado una sola vez (visible en toda la web); "Contáctanos" agregado al footer; versión actualizada a v4.4.
- `src/pages/ConCausaPage.tsx` — botón "Contáctanos".
- `src/pages/AcercaDeRomanusPage.tsx` — botón "Contáctanos".
- `src/pages/ProductosListing.tsx` — reescrita: Laboral Suite como producto activo destacado (con el texto exacto que diste y botón "Ver Laboral Suite" → `/laboral-suite`), Contable Suite y Empresarial Suite como "Próximamente", y botón de contacto al final.
- `src/components/Navbar.tsx` — se quitó "Laboral Suite" del menú principal. Queda: Inicio | Productos | Con Causa | Acerca de.
- `src/App.tsx` — comentario de jerarquía actualizado (Laboral Suite ahora documentada como parte de Productos, no como categoría propia). La ruta `/laboral-suite` **no se eliminó** — sigue existiendo y funcionando, solo que ahora se llega a ella desde el botón "Ver Laboral Suite" en `/productos`, no desde el menú.

## Sin tocar (verificado)

Rutas duplicadas: cero. `/labs` y `/labs/resico`: sin enlace en ningún menú/footer/catálogo, siguen funcionando por URL directa. `resicoCalculations.ts`, `laborCalculations.ts`: cero ediciones. Error Boundaries y `errorLogger.ts`: intactos. Ninguna dependencia nueva (el ícono de WhatsApp es SVG escrito a mano).

## Una decisión que tomé

El botón flotante usa **navy con ícono dorado**, no el verde estándar de WhatsApp — siguiendo tu instrucción explícita de "azul navy, dorado, estilo sobrio" sobre la identidad de marca por encima de la convención visual típica de WhatsApp. Si en algún momento prefieres el verde reconocible de WhatsApp para mejor reconocimiento de marca por parte del usuario, es un cambio de una sola clase.

## Build

Verificación de tipos con TypeScript real + stubs (sin red para `npm install`/`npm run build` real): cero errores nuevos. Mismo artefacto conocido en `SelectField.tsx` (no relacionado).

```bash
npm run build
git add .
git commit -m "v4.4: boton de contacto WhatsApp (flotante + Contactanos) y Laboral Suite movida dentro de Productos"
git push origin main
```
