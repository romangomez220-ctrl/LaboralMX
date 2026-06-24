# ROMANUS v4.9.2 — Auditoría XML CFDI + Limpieza institucional + Feedback profesional

## 1. Cambios realizados

### Salario diario vs. mensual (feedback de validación profesional)
- Nuevo componente `src/components/SalarioCapturaField.tsx`: selector Diario/Mensual + campo
  numérico + conversión visible cuando se captura mensual. **Diario es el valor por defecto** en
  las 5 calculadoras, como se pidió.
- `src/types/labor.ts` y `src/utils/laborCalculations.ts`: `salarioMensual` se sustituyó por
  `salarioBase` + `tipoSalario` en las 5 calculadoras. La conversión (÷30) vive en una sola
  función (`obtenerSalarioDiario`), reutilizada por todas — ya no estaba repetida 5 veces.
- Finiquito, Liquidación, Aguinaldo, Vacaciones, SDI: formularios actualizados; resultados
  (`ResultPage.tsx` y las 3 calculadoras con resultado inline) muestran ahora salario capturado,
  tipo, conversión aplicada y fórmula — el escenario que reportó el contador ($400 diario
  interpretado como mensual) ya no puede ocurrir, porque el tipo de captura es explícito.
- El PDF (`pdfGenerator.ts`) también muestra el salario capturado y su conversión, no solo el
  diario final.

### Prima de antigüedad (feedback de validación profesional)
- `evaluarPrimaAntiguedad()` pasó de un resultado booleano a tres estados: **incluir** (renuncia
  con 15+ años, despido, fallecimiento — casos jurídicamente ciertos), **informativo** (mutuo
  acuerdo, incapacidad, y el "otro" de Finiquito — casos que dependen de las circunstancias) y
  **excluir** (renuncia con menos de 15 años).
- Los casos "informativo" ya **no se suman al total estimado** — se calculan y se muestran por
  separado, con la nota neutral exacta que se pidió: "La prima de antigüedad puede depender del
  motivo de terminación y de la antigüedad. Este cálculo es orientativo y debe revisarse según el
  caso concreto."
- Liquidación ahora distingue 6 supuestos de terminación (se agregaron Mutuo acuerdo,
  Fallecimiento e Incapacidad a los 3 que ya existían).

### Limpieza institucional
- **Easter egg eliminado.** El mensaje sobre Josué en RESICO (y su comentario de código asociado)
  se sustituyó por: "Si tienes dudas sobre tu situación fiscal, consulta a un contador o asesor
  especializado."
- Barrido completo de Claude/Anthropic/ChatGPT/OpenAI/Sonnet/sandbox/IA/asistente/prompt en todo
  `src/` y los `.md`: sin hallazgos nuevos en código fuente. Se limpió una mención residual de
  "sandbox" en `RESUMEN-v4.8.1.md` (documentación interna, no visible públicamente).
- Omar/Olaf: confirmado que nunca aparecieron en ningún archivo (son la fuente del feedback, no
  texto que se haya insertado en el producto).
- "Román" sigue apareciendo en `PrivacidadPage.tsx` (responsable del tratamiento) y `About.tsx`
  (responsable del proyecto) — **decisión: no se eliminó**, porque ahí no es una broma ni
  referencia interna, es la identificación legal/de transparencia que tú mismo pediste en v4.6.
  Dímelo si querías que también se quitara de ahí.

### Labs y Laboral Suite
- `LabsLandingPage.tsx`: se quitó la sección "Laboral Suite (experimentos)" — Liquidación y SDI
  aparecían como "Beta" en Labs cuando en realidad son productos reales y funcionales desde el
  inicio del proyecto. RESICO Beta y XML CFDI Beta sí siguen ahí correctamente (son auténticamente
  experimentales).
- `LaboralSuiteCatalogPage.tsx`: se agregó SDI al catálogo (era un pendiente señalado desde v4.3 y
  nunca se había resuelto).

## 2. Auditoría XML CFDI

Resultado: **sin riesgos críticos**. Confirmado de nuevo (no solo se asumió de la ronda anterior):
cero `fetch`/`axios`/XHR, cero `localStorage`/`sessionStorage`/IndexedDB, `trackXmlConverterEvent`
solo se invoca con los 3 nombres de evento permitidos, sin payload posible a nivel de tipos.

**Un hallazgo no crítico, documentado, no corregido todavía:** la detección de CFDI depende del
prefijo de namespace `cfdi:` (ej. `getElementsByTagName('cfdi:Comprobante')`). En la práctica,
prácticamente todo XML de CFDI generado por un PAC usa ese prefijo — y de hecho así fue validado
manualmente con XML reales — pero el estándar XML no lo garantiza. Una migración a
`getElementsByTagNameNS` con la URI real del namespace (`http://www.sat.gob.mx/cfd/3` o `/cfd/4`)
sería más robusta. No lo cambié esta ronda porque el código ya fue validado manualmente con éxito
y modificarlo ahora, sin un XML real que lo amerite, es más riesgo que beneficio en esta etapa.
Queda en el roadmap.

Rendimiento con 50 archivos, manejo de campos faltantes y XML corruptos: ya eran robustos desde la
integración anterior (verificado de nuevo, sin cambios necesarios).

## 3. Archivos modificados

```
src/types/labor.ts
src/utils/laborCalculations.ts
src/utils/pdfGenerator.ts
src/components/SalarioCapturaField.tsx        (nuevo)
src/pages/FiniquitoCalculator.tsx
src/pages/LiquidacionCalculator.tsx
src/pages/AguinaldoCalculator.tsx
src/pages/VacacionesCalculator.tsx
src/pages/SDICalculator.tsx
src/pages/ResultPage.tsx
src/pages/LabsLandingPage.tsx
src/pages/LaboralSuiteCatalogPage.tsx
src/labs/resico/ResicoDiagnosticoPage.tsx      (solo el easter egg)
RESUMEN-v4.8.1.md                               (solo limpieza de lenguaje)
```

**Sin tocar:** Con Causa, `WhatsAppConsentModal`, `AvisoLegalPage`, `PrivacidadPage`,
`TerminosPage`, `contacto.ts`, Analytics global, Error Boundaries, Layout principal, rutas
existentes, `resicoCalculations.ts`, el módulo `src/labs/xml-cfdi/*` (solo se re-auditó, cero
ediciones).

## 4. Pendientes / riesgos conocidos para roadmap

1. Detección de CFDI por namespace URI en vez de prefijo literal (ver sección 2).
2. Confirmar con el contador si "mutuo acuerdo" e "incapacidad" deberían eventualmente tener su
   propio criterio cierto (incluir/excluir) en vez de quedar siempre como informativo, conforme se
   acumule más validación de casos reales.
3. Decidir si la identificación de "Román" en Privacidad/About debe mantenerse, ocultarse, o
   formalizarse de otra manera conforme el proyecto avance.
4. Finiquito todavía no distingue mutuo acuerdo/fallecimiento/incapacidad como Liquidación — su
   "otro" genérico cubre todos esos casos con la misma nota informativa. Si se requiere la misma
   granularidad que Liquidación, es una mejora futura acotada.

## 5. Build

Verificación estática de tipos de TypeScript sobre el proyecto completo, incluyendo todos los
cambios de este documento: cero errores nuevos. Único hallazgo: el artefacto ya conocido en
`SelectField.tsx`, no relacionado. `npm install && npm run build` reales quedan pendientes de tu
lado para la confirmación definitiva.

```bash
npm install
npm run build
git add .
git commit -m "v4.9.2: professional validation cleanup and XML CFDI hardening"
git push origin main
```
