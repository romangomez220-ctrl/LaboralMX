# ROMANUS v5.0 — Contable Suite: renombre + 4 herramientas con rigor legal mexicano

## 1. Renombre Fiscal Suite → Contable Suite

Completado en todo el proyecto:
- Breadcrumbs visibles en RESICO y XML CFDI: "Fiscal Suite › ..." → "Contable Suite › ...".
- Encabezado de agrupación en `/labs`.
- `ROADMAP-FISCAL-SUITE-PRO.md` → renombrado a `ROADMAP-CONTABLE-SUITE.md`, contenido actualizado.
- Comentarios de código que usaban "Fiscal Suite" como nombre propio.

Verificado: cero ocurrencias de "Fiscal Suite" restantes en `src/`. Los usos genéricos del
adjetivo "fiscal" (información fiscal, cumplimiento fiscal, etc.) no se tocaron.

## 2. Las 4 herramientas nuevas

Todas viven en `src/labs/contable-suite/`, siguen el patrón de RESICO/XML CFDI (Labs, oculto,
`noindex`, Error Boundary propio, sin backend ni autenticación), y cada resultado expone su
**fundamento legal explícito** junto al monto, no solo la fórmula aritmética.

### 2.1 Calculadora de Devolución de Impuestos (asalariados) — `/labs/devolucion-impuestos`

**Fuentes verificadas (consulta: 25 de junio de 2026):**
- LISR Art. 151 (catálogo de deducciones personales y tope global).
- UMA 2026: **$117.31 diaria / $42,794.64 anual**. Verificado contra INEGI (comunicado de prensa
  1/26) y el Diario Oficial de la Federación (publicación 9 de enero de 2026) — dos fuentes
  primarias coincidentes. Descarté otras cifras de blogs ($117.30, $115.26, $113.14) que aparecían
  en fuentes secundarias y se contradicen entre sí, incluso dentro del mismo artículo en un caso.
- Decreto DOF 26/dic/2013 (modificado 2017) — topes de colegiaturas por nivel: Preescolar $14,200,
  Primaria $12,900, Secundaria $19,900, Profesional técnico $17,100, Bachillerato $24,500. **Una
  fuente secundaria reportó $14,900 para preescolar** en vez de $14,200 — discrepancia no resuelta,
  marcada para verificación directa contra el decreto.

**Variaciones cubiertas:** topes por categoría (médicos dentro del tope global; colegiaturas con
tope propio por nivel; donativos con tope 7%/4%; intereses hipotecarios reales dentro del tope
global; aportaciones de retiro con tratamiento señalado como disputado, ver abajo); más de un
patrón en el año (nota de advertencia, no automatiza la suma de constancias).

**Puntos disputados, documentados explícitamente en el código y en la UI, no resueltos
unilateralmente:**
1. **Si las aportaciones voluntarias de retiro cuentan dentro o fuera del tope global del Art.
   151.** Las fuentes consultadas se contradicen. Esta versión las trata con límite propio
   (10%/5UMA), separado del tope global — requiere confirmación profesional.
2. **El tope de donativos debería calcularse sobre el ingreso del ejercicio ANTERIOR**, no el
   actual. Esta versión usa el ingreso del ejercicio actual como aproximación, documentado
   explícitamente como simplificación pendiente de corregir.
3. **El ISR final y el saldo a favor NO se calculan en esta versión.** Las fuentes consultadas se
   contradicen sobre si la tarifa anual (Art. 152 LISR) se actualizó por inflación para 2026: dos
   fuentes (IDC, calculaMX) citan una actualización del 13.21% con una tabla de 11 tramos; una
   fuente (SDV) sostiene que la tarifa no cambió porque la inflación acumulada no alcanzó el 10%
   legal — y esa misma fuente reportó un valor de UMA distinto al verificado, lo que reduce su
   confiabilidad relativa. No tuve una fuente primaria (DOF) con la tabla completa de los 11 tramos
   para confirmar con certeza. **La herramienta calcula la base gravable después de deducciones con
   rigor, pero deja la aplicación de la tarifa final fuera de su alcance**, en vez de mostrar un
   número con falsa precisión.

### 2.2 Calculadora de Declaración Anual RESICO (¿aplica o no?) — `/labs/resico-anual`

**Fuentes verificadas:**
- LISR Art. 113-E, último párrafo — para 2026, la liberación de declarar quedó incorporada
  **directamente al texto de la ley** (vía Paquete Económico 2026), no solo a una regla
  administrativa como en ejercicios anteriores.
- RMF 2026, Regla 3.13.7 — condiciones operativas de la liberación.
- RMF 2026, Reglas 3.13.20 y 3.13.21 — presentación voluntaria para aplicar deducciones
  personales.

**Variaciones cubiertas:** copropiedad (genera obligación, confirmado por múltiples fuentes);
AGAPES (tratamiento especial, marcado explícitamente como fuera de alcance de esta versión, no
simulado); ingresos fuera de RESICO (genera obligación sobre esos otros ingresos, el ingreso RESICO
se reporta informativamente); exclusión a mitad de año y suspensión de actividades (marcados como
**zona gris**, ya que las fuentes consultadas no detallan su tratamiento con precisión suficiente).

**Punto disputado, confirmado de forma independiente:** una fuente especializada (buencontador.com,
sin relación con este proyecto) describe explícitamente la existencia de "una zona gris jurídica
que hoy no está claramente resuelta por la ley ni por reglas administrativas del SAT" para ciertos
supuestos — exactamente el motivo por el que esta herramienta usa un resultado de 3 estados
(no_obligado / obligado / zona_gris) en vez de forzar una respuesta binaria.

### 2.3 Comparador de Arrendamiento: Deducción Ciega vs. Real — `/labs/arrendamiento`

**Fuentes verificadas:**
- LISR Art. 115 (primer y segundo párrafo) — deducción ciega 35% + predial vs. gastos reales.
- Reglamento de la LISR, Art. 196 — la elección se fija en el primer pago provisional del año,
  aplica a todos los inmuebles incluida la copropiedad, no puede variarse en pagos provisionales
  posteriores del mismo año, **pero sí puede cambiarse al presentar la declaración anual**
  (matiz que varias fuentes secundarias omiten).
- Reglamento de la LISR, Art. 197 — depreciación al 5% anual sobre el valor de construcción.

**Variaciones cubiertas:** copropiedad (con porcentaje, nota de que la elección debe ser consistente
en todos los inmuebles); uso mixto (parcialmente, vía gastos reales proporcionales, sin
automatizar el prorrateo); comparación explícita señalada como NO incluyendo RESICO como tercera
opción (documentado como fuera de alcance, no simulado).

**Puntos disputados / no resueltos, documentados explícitamente:**
1. El umbral exacto para pagos provisionales mensuales vs. trimestrales (Art. 116 LISR) sigue
   fijado por ley en **salarios mínimos, no en UMA** — una particularidad real que sobrevivió a la
   desindexación de 2016. La herramienta no fija este umbral en pesos para evitar un error por el
   valor del salario mínimo vigente; lo deja como nota explícita.
2. Interacción con ingresos de plataformas tipo Airbnb: no se modela la interacción entre este
   comparador y la Herramienta 4 — un arrendador que además usa Airbnb debe revisar ambas
   herramientas por separado.

### 2.4 Calculadora de Retenciones por Plataformas Digitales 2026 — `/labs/plataformas-digitales`

**Esta es la herramienta de mayor riesgo de toda la ronda, marcada como tal en la propia interfaz.**

**Fuentes verificadas:**
- LISR Art. 113-A (texto vigente, sin reforma directa) — tasas de 2.1% (transporte/entrega), 4%
  (hospedaje), **1%** (venta de bienes/servicios en general) a personas físicas.
- LISR Art. 113-B — retención agravada de 20% sin RFC.
- LISR Art. 113-C, fracción VI (texto literal verificado) — retención nueva a personas morales:
  2.5% sin deducción alguna, 20% sin RFC.

**TENSIÓN LEGAL DOCUMENTADA, NO RESUELTA POR ESTA HERRAMIENTA:** múltiples fuentes especializadas
posteriores a enero de 2026 reportan de forma consistente que la tasa para personas físicas en
"venta de bienes y servicios en general" subió de 1% a **2.5%** para 2026 — pero ese incremento se
instrumentó vía la **Ley de Ingresos de la Federación 2026**, no mediante una reforma directa al
texto del Art. 113-A LISR. Una fuente especializada (IDC) señala esto explícitamente como una
"tensión normativa" por modificar un elemento sustantivo del impuesto a través de una ley de
vigencia anual en vez de la ley sustantiva. La herramienta usa 2.5% por defecto (es la cifra más
consistentemente reportada para el ejercicio en curso) pero **muestra una advertencia en rojo,
visible sin necesidad de interacción, antes del formulario**, y lo repite en las notas del
resultado. No elegí resolver esta tensión por mi cuenta.

**Otro punto no resuelto:** el umbral de $300,000 anuales para "pago definitivo" que repiten varias
fuentes secundarias como regla general no coincide exactamente con el supuesto que describe el
texto verificado del Art. 113-B LISR (que habla específicamente de ingresos recibidos en parte
directamente de los usuarios, no solo vía la plataforma). La herramienta presenta $300,000 como
referencia, marcado explícitamente como pendiente de verificar contra el texto exacto aplicable al
caso del usuario.

**Variaciones cubiertas:** las 3 categorías de actividad; personas físicas vs. morales (nuevo para
2026); con/sin RFC registrado (tasa agravada); facturación adicional fuera de la plataforma (nota,
no modelada en el cálculo).

## 3. Archivos nuevos

```
src/labs/contable-suite/
  core/{types,devolucionImpuestos,resicoAnual,arrendamiento,plataformasDigitales}.ts
  components/ConceptoLegalCard.tsx
  pages/{DevolucionImpuestosPage,ResicoAnualPage,ArrendamientoComparadorPage,PlataformasDigitalesPage}.tsx
```

## 4. Archivos modificados

- `src/App.tsx` — 4 rutas nuevas, cada una con su propio `LabsErrorBoundary`.
- `src/pages/LabsLandingPage.tsx` — 4 tarjetas nuevas, variable interna renombrada
  (`FISCAL_SUITE_BETA` → `CONTABLE_SUITE_BETA`), referencia al roadmap corregida.
- `src/labs/resico/ResicoDiagnosticoPage.tsx`, `src/labs/xml-cfdi/ConverterPage.tsx` — breadcrumb
  renombrado.
- `src/components/InputField.tsx` — se le agregó soporte para `disabled` (no existía; lo necesitó
  el comparador de arrendamiento para el campo de porcentaje de copropiedad). Cambio aditivo, no
  rompe ningún uso existente del componente.
- `ROADMAP-FISCAL-SUITE-PRO.md` → renombrado a `ROADMAP-CONTABLE-SUITE.md`, contenido actualizado.

**Sin tocar:** `laborCalculations.ts`, `resicoCalculations.ts`, Con Causa, `WhatsAppConsentModal`,
Analytics global, Error Boundaries existentes, Layout principal, rutas de Laboral Suite, el módulo
`xml-cfdi` salvo el breadcrumb.

## 5. Resumen de puntos que requieren revisión profesional prioritaria

Para los validadores (contadores, fiscalistas, abogados, secretario de tribunal colegiado), en
orden de importancia:

1. **Tasa de retención de plataformas digitales (Herramienta 4):** 1% (texto LISR) vs. 2.5% (LIF
   2026, fuentes posteriores) — la tensión normativa en sí, no solo el número.
2. **Tarifa del Art. 152 LISR para 2026 (Herramienta 1):** si se actualizó por inflación o no —
   actualmente no calculada en la herramienta por esta misma incertidumbre.
3. **Tratamiento de aportaciones voluntarias de retiro** dentro o fuera del tope global de
   deducciones personales (Herramienta 1).
4. **Tope exacto de colegiaturas de preescolar:** $14,200 vs. $14,900 según la fuente.
5. **Umbral de "pago definitivo" en plataformas digitales** (Herramienta 4) — la regla general de
   $300,000 vs. el supuesto específico del Art. 113-B.
6. **Zona gris de declaración anual RESICO** para exclusión a mitad de año y suspensión de
   actividades (Herramienta 2) — actualmente sin fundamento cierto identificado.

## 6. Build

Verificación estática de tipos de TypeScript sobre el proyecto completo, incluyendo las 4
herramientas nuevas: cero errores nuevos. Único hallazgo: el artefacto ya conocido en
`SelectField.tsx`, no relacionado. Cero rutas duplicadas. `npm install && npm run build` reales
quedan pendientes de tu lado para la confirmación definitiva.

```bash
npm install
npm run build
git add .
git commit -m "v5.0: Contable Suite — renombre y 4 herramientas con rigor legal mexicano"
git push origin main
```
