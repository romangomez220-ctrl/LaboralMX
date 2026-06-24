# ROMANUS v4.6 — Intake & Privacy Hardening

## Corrección aplicada (antes que todo lo demás)

Implementé la corrección tal cual la diste: **no se publicó ningún correo**, ni el personal
(`romangomez220@gmail.com`) que aparecía en el documento original, ni uno definitivo. En su lugar:

- `EMAIL_PRIVACIDAD` y `EMAIL_CONTACTO` quedaron como `null` en `src/config/contacto.ts`, con un
  comentario explícito de que son placeholders para cuando el proyecto se formalice.
- `PrivacidadPage.tsx` muestra el texto temporal exacto que diste ("Los canales oficiales...")
  mientras `EMAIL_PRIVACIDAD` sea `null`, y automáticamente mostraría el correo real el día que
  se le asigne un valor — **sin que haya que volver a tocar el documento**.
- Sí mantuve "Román Gómez" como responsable del tratamiento — eso lo pedía el documento original
  y la corrección solo hablaba de correos, no de ese dato.

## Archivos modificados

- `src/config/contacto.ts` — nuevas constantes `WHATSAPP_BUSINESS_LINK` (enlace corto, sin texto
  precargado) y `WHATSAPP_NUMBER_LINK` (con `?text=`, para el flujo de Con Causa). `WHATSAPP_LINK`
  se mantuvo como alias del enlace de negocio, así que el footer/Acerca de/Productos no necesitaron
  ningún cambio.
- `src/pages/PrivacidadPage.tsx` — "Responsable del tratamiento" + sección ARCO con el texto
  temporal (ver arriba).
- `src/pages/AvisoLegalPage.tsx` — cláusula de derecho a rechazar/derivar solicitudes + cláusula de
  carácter de las estimaciones.
- `src/pages/TerminosPage.tsx` — misma cláusula de rechazo/derivación + cláusula de capacidad
  operativa limitada. Las cláusulas de "no garantiza resultados" y "ningún colaborador puede recibir
  pagos/representar/contratar" ya existían desde v4.5 — no había nada que reforzar ahí, solo
  confirmé que siguen presentes.
- `src/components/WhatsAppConsentModal.tsx` — reescrito por completo: ahora es un flujo de 3 pasos
  (`consentimiento` → `formulario` → `bloqueo`), descrito abajo.
- `src/components/Layout.tsx` — versión del footer actualizada a v4.6.

**Sin archivos nuevos** — todo el flujo de intake vive dentro del mismo `WhatsAppConsentModal.tsx`
que ya existía, porque sus únicos consumidores (`ContactWhatsAppButton` en modo `requireConsent` y
`WhatsAppFloatingButton` en `/con-causa`) son exactamente los que necesitaban este flujo ampliado.

## El flujo de intake, paso a paso

1. **Consentimiento** (igual que en v4.5): los 7 puntos + checkbox. Botón "Continuar" ahora avanza
   al formulario en vez de abrir WhatsApp directo.
2. **Formulario de triage**: Nombre (texto), Materia (select: Laboral/Civil/Familiar/Cobranza
   abusiva/Fraude o estafa digital/No estoy seguro), Urgencia (select con las 5 opciones exactas),
   descripción breve (textarea, opcional), y el segundo checkbox obligatorio.
   - Si se selecciona "Tengo una fecha límite próxima", aparece la advertencia inline pedida, sin
     bloquear.
   - Si se selecciona cualquiera de las 3 urgencias críticas (audiencia/plazo, violencia/riesgo,
     detención/riesgo penal), al enviar el formulario se salta directo al paso 3 y **no se abre
     WhatsApp**.
3. **Bloqueo** (solo si aplica): el mensaje de derivación exacto que diste + botón "Entendido" que
   cierra y reinicia el flujo, sin continuar a WhatsApp.

Si no hay bloqueo, se construye el mensaje precargado con los valores reales capturados (sin
ningún placeholder tipo `[Nombre]`, verificado con grep) y se abre `WHATSAPP_NUMBER_LINK` con
`?text=` codificado, en una pestaña nueva.

**Nada se guarda:** todo el estado vive en `useState` dentro del componente y se limpia por
completo al cerrar el modal (`reiniciarYCerrar`), sin `fetch`, sin `localStorage`, sin backend.

## Sin tocar (verificado)

`resicoCalculations.ts`, `laborCalculations.ts`: cero ediciones. `analytics.ts`: intacto. Error
Boundaries: intactos. Rutas de Laboral Suite y de `/labs/*`: sin cambios. Cero rutas duplicadas.

## Verificación (punto 9 del brief)

- `/aviso-legal`, `/privacidad`, `/terminos`: rutas conectadas, sin conflicto (verificado).
- `/con-causa` abre consentimiento → formulario: confirmado en el código (flujo de 3 pasos).
- Bloqueo por urgencia crítica: confirmado, las 3 urgencias críticas saltan a "bloqueo" antes de
  intentar abrir WhatsApp.
- Mensaje precargado: confirmado, cero placeholders sin reemplazar.
- WhatsApp fuera de Con Causa (footer, Acerca de, Productos): sigue siendo enlace directo, sin
  cambios — usan `WHATSAPP_LINK` (alias de `WHATSAPP_BUSINESS_LINK`), no el flujo de intake.

## Build

Verificación estática de tipos de TypeScript: cero errores nuevos. Hallazgo previamente
identificado en
`SelectField.tsx`, sin relación con estos cambios, no tocado.

```bash
npm run build
git add .
git commit -m "v4.6 Intake & Privacy Hardening: formulario de triage antes de WhatsApp en Con Causa, refuerzo de paginas legales, correo de privacidad pendiente"
git push origin main
```
