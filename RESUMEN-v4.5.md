# ROMANUS v4.5 — Compliance & Trust

## Aclaración importante antes del resumen

El segundo mensaje decía "ya existe un paquete documental preliminar... no reemplazar desde
cero". Revisé el proyecto completo y **no encontré ningún `/aviso-legal`, `/privacidad`,
`/terminos` ni modal de consentimiento a nivel de ROMANUS** — solo existía el aviso legal
específico de Laboral Suite (`/productos/laboralmx/aviso-legal`, sobre metodología de cálculo,
que no toqué). Por eso construí los 3 documentos y el modal ahora, usando como base exacta el
texto y las cláusulas que me diste en el primer documento (Fases 1-9), no lenguaje legal
inventado por mí. Si en algún otro lugar existe una versión previa que no vi, dime y la concilio.

---

## Archivos nuevos

- `src/pages/AvisoLegalPage.tsx` → `/aviso-legal`
- `src/pages/PrivacidadPage.tsx` → `/privacidad`
- `src/pages/TerminosPage.tsx` → `/terminos` (incluye las cláusulas de las Fases 6, 7, 9 y el aviso de servicio no urgente de la Fase 8)
- `src/components/WhatsAppConsentModal.tsx` — pantalla de consentimiento obligatorio (Fase 5), con los 7 puntos exactos y el checkbox que bloquea "Continuar a WhatsApp" hasta marcarse.

## Archivos modificados

- `src/components/Layout.tsx` — disclaimer global (Fase 1) en el footer; enlaces permanentes a las 3 páginas legales; versión actualizada a "v4.5 — Compliance & Trust".
- `src/components/ContactWhatsAppButton.tsx` — nueva prop `requireConsent`: cuando es `true`, abre el modal de consentimiento en vez de enlazar directo. **Los usos existentes (footer, Acerca de, Productos) no la usan y siguen funcionando exactamente igual que antes.**
- `src/components/WhatsAppFloatingButton.tsx` — ahora exige consentimiento específicamente cuando el usuario está en `/con-causa` (ver decisión de alcance abajo); en el resto del sitio sigue siendo el enlace directo de siempre.
- `src/pages/ConCausaPage.tsx` — se agregaron: las 5 áreas de atención (Fase 4, sin Derecho Penal), el bloque "Antes de contactarnos, es importante que sepas" con las 5 precisiones obligatorias, el aviso de servicio no urgente (Fase 8), y el botón de contacto ahora usa `requireConsent`.
- `src/App.tsx` — 3 rutas legales nuevas conectadas; se eliminó el redirect legacy `/aviso-legal → /productos/laboralmx/aviso-legal` (chocaba directamente con la nueva ruta de plataforma — mismo tipo de conflicto que ya había encontrado con `/acerca-de` en v4.3).

## Sin tocar (verificado)

`resicoCalculations.ts`, `laborCalculations.ts`: cero ediciones. Error Boundaries y `errorLogger.ts`: intactos. `analytics.ts`: intacto. Cero rutas duplicadas. El aviso legal de Laboral Suite en `/productos/laboralmx/aviso-legal` sigue siendo el mismo, sin cambios.

---

## Decisión de alcance que tomé (y quiero que confirmes)

La Fase 5 dice textualmente "antes de enviar a cualquier usuario **al canal de WhatsApp de ROMANUS con Causa**". Interpreté esto como: el consentimiento aplica al contacto específico de Con Causa (orientación jurídica gratuita, donde existe el riesgo real de que alguien asuma una relación abogado-cliente), no a cualquier clic de WhatsApp en todo el sitio (por ejemplo, alguien preguntando algo general desde el footer o desde Productos). Implementé:

- **Con consentimiento obligatorio:** el botón "Contáctanos" de `/con-causa`, y el botón flotante específicamente mientras el usuario está en `/con-causa`.
- **Sin consentimiento (enlace directo, sin cambios):** footer global, Acerca de, Productos, y el botón flotante en cualquier otra página.

Si prefieres que el consentimiento aplique a **todo** clic de WhatsApp en cualquier parte del sitio, es un cambio sencillo (quitar la condición de ruta en el botón flotante y agregar `requireConsent` a los demás usos de `ContactWhatsAppButton`).

---

## Build

Verificación estática de tipos de TypeScript: cero errores nuevos. Hallazgo previamente
identificado en `SelectField.tsx`, sin relación con estos cambios.

```bash
npm run build
git add .
git commit -m "v4.5 Compliance & Trust: paginas legales, disclaimer global y consentimiento previo a WhatsApp en Con Causa"
git push origin main
```

Pendiente de tu lado: confirmar el build real, y revisar si la decisión de alcance del consentimiento (arriba) es la que querías.
