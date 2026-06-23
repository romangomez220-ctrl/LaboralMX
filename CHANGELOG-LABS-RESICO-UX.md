# ROMANUS Labs — RESICO: mejora de UX y contenido

## Archivos nuevos

**Componentes reutilizables** (`src/labs/components/`):
- `ConfidenceCard.tsx` — nivel de confianza + explicación + "factores evaluados" + observaciones específicas.
- `BenefitsCard.tsx` — tarjeta verde de posibles beneficios.
- `RiskCard.tsx` — tarjeta ámbar de riesgos/puntos de atención.
- `ValidateWithExpertCard.tsx` — checklist azul para validar con un contador.
- `DisclaimerCard.tsx` — bloque "IMPORTANTE" destacado.

**Contenido dinámico** (`src/labs/resico/resicoContenidoUX.ts`): genera los textos/listas de las tarjetas anteriores a partir del `ResultadoResico` ya calculado. No reevalúa nada — solo consume lo que ya existe.

## Archivos modificados

- `src/labs/resico/ResicoDiagnosticoPage.tsx` — integra las 5 tarjetas en el orden: Diagnóstico → Beneficios → Riesgos → Confianza (mejorada) → Importante → Recomendaciones → Validar con contador → Explicabilidad → Modo contador (sin cambios en estos dos últimos).

## Sin tocar (verificado)

`src/labs/resico/resicoCalculations.ts` — **cero ediciones**. Tabla RESICO, elegibilidad, `evaluarConfianza`, `generarDiagnostico`, `generarRecomendaciones` exactamente iguales (verificado con grep antes y después). Tampoco se tocó: analytics, la ruta `/labs/resico`, `useNoIndex`, ni ningún color/fuente del sistema de diseño ROMANUS.

## Por qué es reutilizable

Las 5 tarjetas no reciben nada específico de RESICO en sus props — reciben strings y listas ya armadas. Cualquier futura herramienta de Labs (Costo Real de Nómina, Honorarios vs Sueldos, RESICO PM) puede importar las mismas 5 tarjetas y solo escribir su propio archivo de "contenido UX" (como `resicoContenidoUX.ts`) que arme las listas a partir de su propio resultado.

## Build

Verificación de tipos con TypeScript real + stubs (sin red para `npm install`/`npm run build` real): cero errores nuevos. Mismo artefacto conocido de siempre en `SelectField.tsx` (no relacionado, no tocado). Pendiente build real de tu lado.
