# ROMANUS Labs v0.1 — Diagnóstico Inteligente RESICO

## 1. Archivos creados

```
src/labs/
  useNoIndex.ts                       Hook que inyecta noindex/nofollow solo en esta ruta
  components/
    LabsBadge.tsx                     Badge "🧪 ROMANUS Labs — Herramienta Experimental"
  resico/
    resicoTypes.ts                    Tipos del formulario y del resultado
    resicoCalculations.ts             Motor de cálculo (tabla RESICO, elegibilidad, confianza, recomendaciones)
    ResicoDiagnosticoPage.tsx         Página completa (formulario + resultados + explicabilidad + modo contador)

src/components/
  Modal.tsx                           Modal genérico reutilizable (sin dependencias nuevas)
```

## 2. Archivos modificados

- `src/utils/analytics.ts` — se agregó `trackEvent()` genérico, sin tocar `trackPageView()` existente.
- `src/App.tsx` — se agregó la ruta `/labs/resico`, dentro del `Layout` global (misma identidad visual) pero **sin ningún link** en ningún componente de navegación.

**Sin tocar:** todo lo de Laboral Suite (Liquidación, Finiquito, Aguinaldo, Vacaciones, SDI), `Navbar.tsx`, `LaboralMXLayout.tsx`, `RomanusHome.tsx`, `ProductosListing.tsx`, `Layout.tsx` (footer) — verificado con `grep`, cero referencias a `/labs/resico` en ninguno de ellos.

---

## 3. Arquitectura utilizada

`src/labs/` es un namespace nuevo, separado de `src/pages/` (que es el área pública de Laboral Suite). Esto deja la base lista para las próximas herramientas mencionadas en el brief (Costo Real de Nómina, ISR Personas Físicas, IVA, PTU, Honorarios, Simuladores Fiscales) como hermanas de `resico/`, cada una con su propia carpeta `tipos + cálculo + página`, reutilizando `LabsBadge`, `useNoIndex` y `Modal` ya construidos.

El motor de cálculo (`resicoCalculations.ts`) sigue el mismo patrón que `laborCalculations.ts`: funciones puras, sin estado, fáciles de probar de forma aislada.

---

## 4. Lógica fiscal utilizada (verificada, no inventada)

**Fuente:** Art. 113-E LISR y Anexo 8 de la RMF 2026 (DOF, 9 de diciembre de 2025), confirmada por múltiples fuentes especializadas consultadas — las tasas no han cambiado desde el lanzamiento de RESICO en 2022.

| Ingreso mensual cobrado (sin IVA) | Tasa |
|---|---|
| Hasta $25,000 | 1.00% |
| $25,000.01 a $50,000 | 1.10% |
| $50,000.01 a $83,333.33 | 1.50% |
| $83,333.34 a $208,333.33 | 2.00% |
| $208,333.34 en adelante | 2.50% |

- **Límite de permanencia:** $3,500,000 MXN de ingresos anuales (todas las fuentes, no solo RESICO). Si se supera, el diagnóstico marca "no elegible", confianza Baja, y recomienda revisión profesional — no se calcula una tasa para un escenario que legalmente no aplicaría.
- **Simplificación deliberada y declarada:** RESICO calcula el ISR sobre el ingreso *acumulado* desde enero, por lo que el tramo puede cambiar mes a mes. Esta herramienta usa el ingreso mensual capturado como si fuera constante todo el año — es una aproximación razonable para un diagnóstico, pero **no sustituye un cálculo real con ingresos mes a mes**. Esto se explica tanto en "Modo contador" como en la leyenda legal.
- **Retención de personas morales (1.25%)** y la posibilidad de devolución mensual del saldo a favor (Regla 3.13.34 RMF 2026, vigente desde 2026) se mencionan como recomendación informativa, no se modelan como ajuste numérico al ISR — para no aparentar una precisión que la herramienta no tiene.
- El nivel de confianza es un **sistema de puntos transparente y auditable** (no un modelo de IA / caja negra): cada regla que se activa queda listada literalmente en pantalla, tanto en "¿Cómo llegó ROMANUS a esta conclusión?" como en "Modo contador".

---

## 5. Estrategia de ocultamiento de la ruta

- **Sin enlaces:** no existe ningún `<Link>` ni `<NavLink>` hacia `/labs/resico` en `Navbar`, `LaboralMXLayout`, `Home`, `RomanusHome`, `ProductosListing` ni el footer. Solo es accesible si se conoce la URL exacta.
- **noindex/nofollow por ruta:** como es una SPA con un solo `index.html`, no se puede poner una etiqueta `<meta name="robots">` ahí sin afectar TODO el sitio. En su lugar, `useNoIndex()` inyecta la etiqueta en `document.head` solo mientras la página de RESICO está montada, y la retira al salir — el resto del sitio mantiene su indexabilidad normal.
- **Sitemap:** el proyecto no tiene `sitemap.xml` ni generación automática de sitemap actualmente, así que no hay nada que excluir todavía. Si en el futuro se genera uno, esta ruta debe quedar fuera explícitamente.
- **Sin autenticación, como se pidió:** la ruta privada es la única barrera. No se implementó contraseña ni login.
- Se agregó el badge visible "🧪 ROMANUS Labs — Herramienta Experimental" al inicio de la página, con el texto exacto solicitado.

---

## 6. Riesgos y áreas que requieren validación profesional adicional

1. **Simplificación de "ingreso constante todo el año".** Es la limitación más importante: alguien con ingresos muy variables mes a mes obtendría una tasa distinta a la que realmente le correspondería en algunos meses. Está documentado en "Modo contador", pero conviene que un contador valide si esta simplificación es aceptable para el público objetivo o si se necesita capturar ingresos mes a mes.
2. **No se valida elegibilidad más allá del límite de ingresos.** RESICO tiene otras restricciones (socios/accionistas de personas morales, ingresos por fideicomisos, ciertas combinaciones de regímenes) que esta herramienta no verifica. Está declarado explícitamente en "Modo contador" y en la sección educativa, pero un contador debería confirmar si conviene agregar más preguntas de elegibilidad.
3. **El campo "Otra" en actividad principal** reduce la confianza pero no impide el cálculo — vale la pena que un contador revise si ese supuesto debería bloquear el diagnóstico en vez de solo advertir.
4. **No se modela el efecto real de la retención de personas morales** en el ISR neto — se dejó como recomendación textual para no introducir un cálculo que pudiera ser incorrecto sin más validación.
5. **No hay pruebas automatizadas** para `calcularDiagnosticoResico` ni para `evaluarConfianza` — dado que es lógica fiscal con consecuencias reales, debería ser la primera candidata a cobertura de pruebas antes de salir de fase privada.
6. **Build pendiente de confirmación real.** Se completó una verificación estática de tipos de TypeScript. Cero errores nuevos; el único hallazgo es un artefacto ya conocido en `SelectField.tsx` (no relacionado con RESICO). Falta la confirmación con `npm run build` en el entorno de desarrollo del equipo.

---

## 7. Validación de build

Verificación estática de tipos de TypeScript completada. Resultado: cero errores nuevos atribuibles
al código de RESICO Labs. Pendiente: `npm install && npm run build` en el entorno de desarrollo
del equipo, para confirmación definitiva.
