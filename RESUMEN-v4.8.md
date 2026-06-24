# ROMANUS v4.8 — Pulido Fiscal + Arquitectura Fiscal Suite + Labs

## Archivos modificados

- `src/labs/resico/resicoCalculations.ts` — terminología: "Tabla oficial de tasas..." → "Tarifa
  oficial de ISR..." y "tramo de la tabla" → "tramo de la tarifa" (solo comentarios, cero cambios
  de lógica/cálculo).
- `src/labs/resico/ResicoDiagnosticoPage.tsx`:
  - Breadcrumb conceptual "Fiscal Suite › RESICO" arriba del badge de Labs (solo visual, sin
    cambiar rutas).
  - Aclaración visible sobre IVA debajo del campo del formulario, explicando que no afecta el ISR
    pero sí puede afectar el nivel de confianza (es decir, sí indiqué cómo influye, como pedías).
  - Terminología: "Tabla de tasas utilizada" → "Tarifa aplicable"; "tabla oficial de RESICO" →
    "tarifa oficial de RESICO"; "tramo de la tabla" → "tramo de la tarifa" en supuestos. La tabla
    HTML real (con los tramos numéricos) no se tocó — sigue siendo una tabla visual genuina.
  - Tooltip `<details>` "¿Qué es un crédito fiscal?" con el texto exacto que diste, mostrado solo
    cuando la recomendación de retención de personas morales aparece (es el único lugar donde el
    concepto de "crédito"/"acredita" surge en esta herramienta).
  - Nueva sección "Factores considerados" después de Recomendaciones, con los 5 puntos dinámicos
    que pediste (límite de ingresos, compatibilidad, restricciones, orientativo, revisar con
    contador) — y el easter egg de Josué, comentado en el código como **temporal, para fase
    privada, sin botón, sin contacto, sin presentarlo como colaborador/asesor** — exactamente como
    lo pediste.
- `src/labs/components/ConfidenceCard.tsx` — explicación genérica del puntaje ("no constituye una
  determinación fiscal oficial", qué la sube/baja). La puse en el componente reutilizable (no
  solo en RESICO) porque es texto genéricamente válido para cualquier futura herramienta de Labs
  que use esta misma tarjeta de confianza.
- `src/pages/LabsLandingPage.tsx` — reorganizada por suite: Fiscal Suite (RESICO Beta disponible +
  XML CFDI Beta y Retenciones Beta como placeholders no clicables) y Laboral Suite (Liquidación
  Beta y SDI Beta, también placeholders). Aviso "Herramientas experimentales..." agregado. Sigue
  sin enlace en ningún menú, con `noindex/nofollow` intacto.

## Archivo nuevo

- `ROADMAP-FISCAL-SUITE-PRO.md` — Fiscal Suite Free vs. Pro, las 5 fases de arquitectura de
  usuarios (roles `user/pro/admin`, planes `free/pro`), el backlog validado por el contador, y el
  backlog adicional (fecha de inicio de actividades, ejercicios irregulares, tipo de actividad).
  Documento de planeación únicamente — nada de esto se implementó.

## Decisión de diseño: los "Beta" de Labs no tienen ruta propia

XML CFDI Beta, Retenciones Beta, Liquidación Beta y SDI Beta aparecen **solo como tarjetas no
clicables** en `/labs` — no creé rutas nuevas para ninguno. Esto cumple literalmente "deben existir
únicamente como placeholder" y "no desarrollar todavía ninguna de estas herramientas", evitando
abrir superficie de rutas para algo que no existe.

## Verificación de la lista de "NO modificar"

Confirmé que estos archivos no se tocaron en esta ronda (no aparecen en mis ediciones de esta
sesión): `WhatsAppConsentModal.tsx`, `laborCalculations.ts`, `AvisoLegalPage.tsx`,
`PrivacidadPage.tsx`, `TerminosPage.tsx`, `contacto.ts`, `analytics.ts`, `ErrorBoundary.tsx`,
`Layout.tsx`, `ConCausaPage.tsx`. Cero rutas duplicadas o eliminadas en `App.tsx`.

## Build

Verificación de tipos con TypeScript real + stubs manuales (sin red para `npm install`/`npm run
build` real en este entorno): cero errores nuevos. Mismo artefacto conocido de siempre en
`SelectField.tsx` (no relacionado, no tocado). Extraje el ZIP final a una carpeta limpia y
confirmé que el contenido coincide antes de entregarlo.

```bash
npm run build
git add .
git commit -m "v4.8: fiscal suite architecture and RESICO refinement"
git push origin main
```
