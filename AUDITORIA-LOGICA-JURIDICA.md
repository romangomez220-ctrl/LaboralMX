# Auditoría técnico-jurídica — LaboralMX

Fecha de esta auditoría: a partir del estado del código tras las correcciones de prima de
antigüedad (tope Art. 162 LFT) y unificación de antigüedad ya aplicadas previamente.

Esta auditoría es solo diagnóstico. No se modifica ninguna fórmula matemática como parte de
este documento.

---

## 1. Cómo se calcula actualmente el Finiquito

Archivo: `src/utils/laborCalculations.ts`, función `calcularFiniquito` (apoyada en
`calcularConceptosBase`).

Conceptos incluidos, en este orden:

1. **Salarios pendientes de pago** = salario diario × días pendientes capturados por el usuario.
2. **Aguinaldo proporcional** = 15 × salario diario × (días trabajados del año calendario ÷ 365).
   Los "días trabajados del año calendario" se cuentan desde el 1 de enero del año de la fecha
   de salida (o desde la fecha de ingreso, si es posterior) hasta la fecha de salida.
3. **Vacaciones proporcionales** = días de vacaciones que correspondan según la tabla de
   antigüedad (ver sección 4) × salario diario × (días transcurridos desde el último aniversario
   laboral ÷ 365), menos el valor en dinero de los días que el usuario indicó como ya
   disfrutados este año.
4. **Prima vacacional** = vacaciones pendientes en dinero × 25%.
5. **Prima de antigüedad** (opcional, si el usuario la activa) = salario diario × 12 × años de
   antigüedad (con decimales), **usando como salario base el menor entre el salario diario real y
   el doble del salario mínimo general vigente de la zona seleccionada** (tope del Art. 162 LFT,
   corregido en una iteración anterior).
   - Solo se incluye si: la salida NO es por renuncia voluntaria, O si es renuncia voluntaria y
     el usuario indicó tener 15 años o más de antigüedad.

El total estimado es la suma de los conceptos incluidos, cada uno ya redondeado a 2 decimales.

## 2. Cómo se calcula actualmente la Liquidación

Misma función base (`calcularConceptosBase`) más:

1. Los 4 conceptos del finiquito (salarios pendientes, aguinaldo, vacaciones, prima vacacional).
2. **Indemnización constitucional** = salario diario × 90, **solo si el tipo de salida es
   "despido injustificado"**.
3. **Prima de antigüedad** (opcional) = misma fórmula y mismo tope que en finiquito, pero **sin
   condicionarla a 15 años cuando el tipo de salida es "renuncia"** — solo se agrega una nota de
   advertencia (ver hallazgo 6.2).
4. **20 días por año** (opcional, informativo): solo se calcula y se muestra si el tipo de salida
   es "despido injustificado". Se presenta separado del total legal, como escenario de
   referencia/negociación, no como derecho automático.

## 3. Supuestos jurídicos utilizados por el sistema

- El "año laboral en curso" para vacaciones se interpreta como el aniversario que el trabajador
  **está cursando** (años completos + 1), no el que ya completó. Es la interpretación más usada
  en la práctica de despachos y calculadoras de finiquito, pero **es un punto de interpretación,
  no un hecho indiscutido** (ver hallazgo 6.1).
- Se asume que toda vacación de años anteriores ya completados fue disfrutada o pagada; el
  sistema no tiene forma de capturar vacaciones vencidas de ejercicios previos.
- Se asume "salario diario simple" (salario mensual ÷ 30) en todos los conceptos, no Salario
  Diario Integrado (Art. 84 LSS). Esto está advertido en el aviso legal general.
- Se asume que la prima vacacional de los días ya disfrutados ya fue pagada en su momento, por lo
  que el 25% solo se calcula sobre lo pendiente.
- El "20 días por año" se trata como referencia informativa de mercado/negociación, no como
  derecho automático del Art. 50-III LFT (que en realidad solo aplica a los supuestos del Art. 49
  — confianza, antigüedad menor a un año, eventuales, etc. — no a todo despido injustificado).
  Este tratamiento es correcto y deliberadamente conservador.

## 4. Artículos de la LFT que sustentan cada cálculo

| Concepto | Artículo | Nota |
|---|---|---|
| Aguinaldo | Art. 87 LFT | 15 días mínimo, proporcional, base calendario (no aniversario). |
| Vacaciones | Art. 76 LFT (reformado, "vacaciones dignas") | Tabla 12-32 días implementada conforme a la reforma vigente. |
| Prima vacacional | Art. 80 LFT | 25% mínimo sobre el salario del periodo vacacional. |
| Prima de antigüedad | Art. 162 LFT | 12 días por año, con tope de 2 salarios mínimos (ya corregido). 15 años mínimos solo para renuncia voluntaria. |
| Indemnización constitucional | Art. 48 LFT | 3 meses de salario (90 días), por despido injustificado. |
| 20 días por año | Art. 50-III LFT | Aplica a los supuestos del Art. 49, no a todo despido injustificado — tratado correctamente como informativo. |

## 5. Posibles errores matemáticos

- **Ninguno nuevo detectado** en esta revisión sobre la aritmética en sí (las fórmulas
  corresponden a lo descrito arriba y ya fueron corregidas en iteraciones previas: tope de
  prima de antigüedad y unificación de antigüedad).
- Se revisaron específicamente las validaciones de fecha (`fecha futura`, `fecha de salida
  anterior a fecha de ingreso`) considerando zonas horarias de México (UTC-6/UTC-5): **no se
  encontró un error de zona horaria**, porque México siempre está detrás de UTC, lo que hace que
  estas comparaciones sean seguras en la práctica.
- Aguinaldo y SDI usan un divisor fijo de 365 sin ajuste por año bisiesto (diferencia de
  centésimas de día). Ya documentado como limitación conocida, impacto despreciable.

## 6. Posibles errores jurídicos / de diseño en la captura de datos

Esta sección responde directamente al comentario público de que existen errores **desde la
captura de datos**. Se encontraron dos hallazgos concretos:

### 6.1 — Campo redundante y potencialmente contradictorio: "¿Tiene 15 años o más de antigüedad?"

> **Estado: corregido.** Se eliminó el campo manual `tiene15Anios` de `FiniquitoFormData`, del
> formulario y de toda la lógica de cálculo. La condición de "15 años o más" ahora se deriva
> exclusivamente de `antiguedadDecimal` (calculada a partir de las fechas capturadas), mediante
> la función `primaAntiguedadAplicaLegalmente()` en `laborCalculations.ts`. Ya no es posible una
> contradicción entre las fechas capturadas y una respuesta manual.

En el formulario de **Finiquito**, el sistema le pide al usuario las fechas de ingreso y salida
(de las cuales ya puede calcular la antigüedad exacta) **y además** le pide responder manualmente
"Sí/No" a si tiene 15 años o más de antigüedad. Esto es un problema de diseño de captura: el
usuario podría capturar fechas que arrojen, por ejemplo, 20 años de antigüedad, y por error (o
por no saber la cifra exacta) responder "No" a esa pregunta — o viceversa. El sistema no validaba
la consistencia entre ambos datos.

### 6.2 — Tratamiento inconsistente del requisito de 15 años entre Finiquito y Liquidación

> **Estado: corregido.** Ambas calculadoras ahora llaman a la misma función
> `primaAntiguedadAplicaLegalmente()` para decidir si la prima de antigüedad aplica. Ante el
> mismo supuesto (renuncia con antigüedad calculada menor a 15 años), ambas excluyen el monto y
> muestran la misma nota explicativa (`NOTA_PRIMA_ANTIGUEDAD_RENUNCIA_INSUFICIENTE`). Ya no hay
> ninguna ruta donde una renuncia con menos de 15 años sume prima de antigüedad al total.

- En **Finiquito**, si la salida es por renuncia voluntaria y el usuario indica tener menos de 15
  años, el sistema **excluye por completo** el monto de prima de antigüedad y explica por qué.
- En **Liquidación**, si el tipo de salida es "renuncia" y el usuario activa la prima de
  antigüedad, el sistema **sí calculaba y sumaba el monto al total**, y solo agregaba una nota de
  texto advirtiendo que ese requisito de 15 años podría no cumplirse.

Es decir: ante el mismo supuesto legal (renuncia con prima de antigüedad), las dos calculadoras
se comportaban de forma distinta. Esto es exactamente el tipo de inconsistencia que un abogado
revisando el código encontraría y reportaría como error. Es plausible que sea, total o
parcialmente, lo que motivó el comentario público.

### 6.3 — Interpretación del "año en curso" para vacaciones (punto de interpretación, no error claro)

Ya señalado en la sección 3: usar "años completos + 1" para determinar la tabla de días de
vacaciones aplicable es la interpretación mayoritaria en la práctica, pero no es la única
defendible. Un abogado litigante podría argumentar válidamente por la interpretación contraria
en un caso específico. No lo considero un "error", pero sí un punto que vale la pena dejar más
explícito en la página "Cómo se calcula" (ya está documentado ahí, pero podría reforzarse).

## 7. Riesgos detectados

- **Riesgo reputacional/legal de mayor impacto:** la inconsistencia 6.2 puede hacer que un
  trabajador en renuncia con menos de 15 años vea un monto de prima de antigüedad en su
  Liquidación que, en estricto sentido, no le corresponde — generando expectativas económicas
  incorrectas.
- **Riesgo de captura:** el campo redundante de 6.1 puede generar resultados incorrectos por
  error humano del usuario, no por error de fórmula.
- **Riesgo de alcance ya conocido (no nuevo):** vacaciones vencidas de años anteriores no
  capturadas, edge case del 29 de febrero, salario diario simple vs. SDI — todos ya documentados
  en el README como pendientes para v2.
- **Riesgo de percepción pública:** dado que un abogado ya comentó públicamente sobre errores,
  recomiendo que cualquier corrección a 6.1/6.2 se acompañe de una nota de changelog visible
  (por ejemplo, en el Aviso Legal o en una sección de "actualizaciones"), para mostrar
  transparencia y respuesta activa a la retroalimentación profesional recibida.

## Resumen ejecutivo

No se encontraron errores aritméticos nuevos. Los dos hallazgos reales y concretos estaban en el
**diseño de la captura de datos y en la consistencia de reglas de negocio entre Finiquito y
Liquidación** (secciones 6.1 y 6.2), no en las fórmulas matemáticas en sí. Esto es consistente
con el comentario público de que el problema "viene desde la captura de datos". **Ambos
hallazgos (6.1 y 6.2) ya fueron corregidos** mediante una función compartida
(`primaAntiguedadAplicaLegalmente`) que ahora es la única fuente de verdad para la regla de los
15 años en separación voluntaria, usada de forma idéntica por ambas calculadoras. Ninguna
fórmula matemática (aguinaldo, vacaciones, prima vacacional, tope de prima de antigüedad,
indemnización constitucional, 20 días por año) fue modificada para implementar esta corrección.
