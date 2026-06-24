# ROMANUS — Changelog v0.2

Implementación de mejoras derivadas de validación con abogado laboral.

---

## 1. Archivos modificados y creados

**Nuevos:**
- `src/components/ExplicacionCalculo.tsx` — sección colapsable "¿Cómo se calculó este resultado?" (Mejora 3)
- `src/config/catalogoHerramientas.ts` — catálogo de herramientas actuales y futuras (Mejora 6)

**Modificados:**
- `src/components/Disclaimer.tsx` — nuevo texto legal obligatorio, más detallado (Mejora 1)
- `src/components/Layout.tsx` — indicador "ROMANUS v0.2" en footer (Mejora 5)
- `src/utils/laborCalculations.ts` — lógica de prima de antigüedad reestructurada en 4 casos jurídicos explícitos, cada uno con su nota (Mejora 2)
- `src/utils/pdfGenerator.ts` — PDF rediseñado por completo: encabezado, fecha/hora, datos capturados, desglose con fórmulas, total destacado, paginación automática, pie de página (Mejora 4)
- `src/pages/ResultPage.tsx` — lee `datosCapturados` del state, los pasa al PDF, renderiza `ExplicacionCalculo`
- `src/pages/FiniquitoCalculator.tsx` — construye y envía `datosCapturados` al navegar a resultado
- `src/pages/LiquidacionCalculator.tsx` — idem
- `src/pages/SDICalculator.tsx`, `AguinaldoCalculator.tsx`, `VacacionesCalculator.tsx` — se agregó `<Disclaimer />` (texto legal completo) después del resultado, donde antes solo existía la versión compacta previa al formulario

**Sin tocar:** tabla de vacaciones, fórmulas de aguinaldo, SDI, indemnización constitucional, tope de prima de antigüedad (Art. 162 LFT) — todas las fórmulas matemáticas existentes quedaron exactamente igual.

---

## 2. Lógica jurídica aplicada (Mejora 2)

La prima de antigüedad (Art. 162 LFT) ahora se evalúa en 4 casos explícitos, cada uno con una nota visible que se muestra **siempre** (se incluya o no el concepto), para que el usuario nunca asuma automáticamente que le corresponde:

| Caso | Supuesto | ¿Aplica? | Nota mostrada |
|---|---|---|---|
| A1 | Renuncia voluntaria, antigüedad **< 15 años** | No | Se excluye y se explica el requisito de 15 años. |
| A2 | Renuncia voluntaria, antigüedad **≥ 15 años** | Sí | Se incluye y se explica por qué sí procede. |
| B | Despido injustificado | Sí | Se incluye; se explica que no hay mínimo de años en despido. |
| C1 | Despido justificado | Sí | Se incluye; se aclara que la prima no depende de la causa del despido, solo de la antigüedad. |
| C2 | Otro supuesto (mutuo acuerdo, vencimiento de contrato, etc.) | Sí | Se incluye; se advierte verificar que la causa real corresponda a este supuesto. |

El tope de salario base (2 veces el salario mínimo de la zona, también Art. 162 LFT) y la fórmula de cálculo (salario diario × 12 días × años de antigüedad) **no se modificaron** — solo cambió cuándo se incluye y qué explicación se muestra.

---

## 3. Riesgos detectados (auditoría técnica, Mejora 7)

- **`laborCalculations.ts` ya tiene 465 líneas.** Sigue siendo manejable y cada función tiene una responsabilidad clara, pero si se agregan las herramientas planeadas en el catálogo (PTU, horas extra, etc.) en este mismo archivo, conviene dividirlo por dominio (ej. `prima-antiguedad.ts`, `vacaciones.ts`) antes de que crezca más.
- **`datosCapturados` es opcional y no tipado contra un esquema único.** Hoy cada calculadora construye su propio arreglo `{etiqueta, valor}[]` a mano. Si se agregan más calculadoras con PDF, conviene una función compartida que genere este arreglo a partir del propio `FormData` de cada una, para evitar inconsistencias de formato.
- **No hay pruebas automatizadas** (unit tests) para `evaluarPrimaAntiguedad` ni para el resto del motor de cálculo. Dado que es la lógica con más riesgo legal del proyecto, es la primera candidata para cobertura de pruebas.
- **`npm run build` pendiente de confirmación en el entorno de desarrollo del equipo.** Se realizó una verificación estática de tipos de TypeScript sobre los archivos modificados; no se detectaron errores nuevos, aunque esto no sustituye un build real con las dependencias completas instaladas.
- **Botones disabled accesibles pero sin `aria-disabled` explícito** en `RevisionProfesionalBlock` — el atributo HTML `disabled` ya impide la interacción y es leído correctamente por lectores de pantalla, pero `aria-disabled="true"` sería un refuerzo semántico de bajo costo.

---

## 4. Mejoras futuras recomendadas

1. Dividir `laborCalculations.ts` por dominio antes de agregar PTU/horas extra/IMSS (catálogo ya preparado en `catalogoHerramientas.ts`).
2. Cobertura de pruebas unitarias para `evaluarPrimaAntiguedad`, `calcularPrimaAntiguedad` y la tabla de vacaciones — son la lógica de mayor riesgo legal.
3. Centralizar la construcción de `datosCapturados` para que cada calculadora no la reescriba manualmente.
4. Cuando exista logotipo definitivo, sustituir el texto "ROMANUS" del PDF por el logo real (la estructura del encabezado ya está lista para recibirlo).
5. Considerar agregar pruebas end-to-end para los flujos críticos: Finiquito → Resultado → PDF.

---

## 5. Validación de build

`npm run build` pendiente de confirmación en el entorno de desarrollo del equipo. Se completó una
verificación estática de tipos de TypeScript sobre los archivos modificados. Resultado: **cero
errores nuevos** introducidos por los cambios de esta versión; el único hallazgo corresponde a un
artefacto ya identificado, en un archivo no modificado en esta ronda (`SelectField.tsx`).

**Pendiente de tu lado:** correr `npm install && npm run build` para la confirmación definitiva.
