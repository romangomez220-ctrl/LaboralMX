# ROMANUS v7.1 — Jurídico Suite en Labs: Términos Procesales y Familiar Urgente

## Objetivo

Agregar herramientas de Labs orientadas a validadores abogados, sin alterar las calculadoras
públicas de Laboral Suite ni las herramientas fiscales/contables existentes.

## Herramientas nuevas

1. **ROMANUS Términos** (`/labs/terminos-procesales`)
   - Calcula vencimientos base.
   - Distingue días hábiles y naturales.
   - Excluye fines de semana en días hábiles.
   - Permite capturar días inhábiles manuales.
   - Documenta fundamento, hipótesis de cómputo y advertencias.
   - Incluye reglas iniciales para amparo, CNPCF y conciliación laboral.

2. **Asistente Familiar Urgente** (`/labs/familiar-urgente`)
   - Ordena asuntos de alimentos, guarda/custodia, convivencia, violencia familiar o mixtos.
   - Genera semáforo de atención: ordinaria, prioritaria o urgente.
   - Sugiere medidas provisionales a valorar.
   - Genera checklist probatorio, omisiones críticas y siguientes pasos.
   - Documenta fundamentos base y advertencias de validación.

## Integración técnica

- Se creó `suite_juridica` dentro del Registro Central.
- Las dos herramientas nuevas se registraron en `src/catalog/registry.ts`.
- El router sigue usando el mecanismo existente de rutas generadas desde `listarToolsDeLabs()`.
- Las páginas nuevas viven bajo `src/labs/juridico-suite/pages/`.
- La lógica jurídica vive separada en `src/labs/juridico-suite/core/`.
- Ambas herramientas incluyen botón de feedback para validadores autenticados.
- Ambas registran actividad de apertura con `activityRepository`.

## Archivos principales

```
src/catalog/types.ts
src/catalog/registry.ts
src/App.tsx
src/labs/juridico-suite/core/terminosProcesales.ts
src/labs/juridico-suite/core/familiarUrgente.ts
src/labs/juridico-suite/pages/TerminosProcesalesPage.tsx
src/labs/juridico-suite/pages/FamiliarUrgentePage.tsx
src/labs-portal/storage/seedData.ts
supabase/seed_tools_state.sql
```

## Validación

`npm run build` ejecutado correctamente.

La navegación a `/labs/terminos-procesales` sin sesión redirige a `/labs/login`, confirmando que
las herramientas nuevas quedaron bajo el guard de validadores.

## Notas de alcance

- No se modificaron motores de Laboral Suite.
- No se modificaron motores de Contable Suite.
- No se agregó una garantía de exactitud jurisdiccional automática; los calendarios oficiales,
  acuerdos de suspensión y reglas locales siguen siendo revisión profesional obligatoria.
- Si `tools_state` no se sembró en Supabase, la app usará el estado default `en_validacion`,
  oculto públicamente y disponible solo en Labs.
