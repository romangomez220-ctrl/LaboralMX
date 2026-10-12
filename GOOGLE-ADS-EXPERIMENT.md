# Piloto de ventas Google Ads — Reporte ROMANUS de liquidación

## Objetivo

Validar si una persona que llega desde una búsqueda laboral paga MXN $39 por conservar su
resultado como Reporte ROMANUS. El piloto promociona un solo producto y una sola intención:
calcular una liquidación laboral.

## Límites del experimento

- Tipo: campaña de búsqueda, sin Display ni socios de búsqueda durante el piloto.
- Ubicación: México; elegir presencia física en la ubicación objetivo.
- Idioma: español.
- Calendario: tres días alternados dentro de una semana.
- Presupuesto: MXN $150–$200 por día activo; máximo total MXN $600.
- Puja inicial: maximizar clics mientras no exista volumen suficiente de ventas.
- No activar la campaña hasta confirmar que la conversión de venta está disponible.
- No usar remarketing, Customer Match ni audiencias basadas en situaciones jurídicas.

## Medición

- Conversión principal: `romanus_pdf_payment_succeeded`.
- Conversión secundaria: `romanus_pdf_checkout_started`.
- Diagnóstico: `romanus_calculator_started`, `romanus_calculator_completed` y
  `romanus_result_viewed`.
- Prospecto jurídico separado: `romanus_review_whatsapp_continued`.

Solo la venta debe participar inicialmente en la optimización de la campaña. Checkout y cálculo
sirven para localizar abandonos, no para presentar el piloto como rentable.

## Grupo de anuncios: Liquidación

### Palabras clave iniciales

- `[calcular liquidación]`
- `[calculadora de liquidación]`
- `"cuánto me toca de liquidación"`
- `"liquidación por despido"`
- `"calcular liquidación por despido injustificado"`
- `"cuánto me toca por despido"`

No comenzar con concordancia amplia. Revisar términos de búsqueda después de cada día activo.

### Titulares

1. Calcula Tu Liquidación
2. Liquidación Laboral México
3. Resultado Gratis En Minutos
4. Revisa Tu Escenario De Despido
5. Sin Registro Ni Complicaciones
6. Reporte Profesional Por $39
7. Conoce Tu Estimación Laboral
8. Calculadora Laboral ROMANUS

### Descripciones

- Estima tu liquidación en minutos. Resultado gratuito y reporte profesional por $39.
- Captura fechas y salario. Revisa finiquito e indemnización con conceptos separados.
- Calculadora laboral para México, sin registro. Metodología visible y pago seguro.
- Conserva tu cálculo en un Reporte ROMANUS con folio, metodología y próximos pasos.

### URL final

`https://www.romanus.mx/calcular-liquidacion?utm_source=google&utm_medium=cpc&utm_campaign=mx_liquidacion_reporte_piloto&utm_content=liquidacion_report_search_a&utm_term={keyword}`

## Palabras negativas iniciales

- empleo
- vacantes
- bolsa de trabajo
- curso
- diplomado
- tesis
- definición
- wikipedia
- formato word
- formato excel
- machote
- demanda
- abogado gratis
- asesoría gratis
- teléfono conciliación
- calculadora física
- comprar calculadora

Agregar negativas únicamente cuando el término real sea claramente ajeno al cálculo laboral.

## Lectura del resultado

| Señal | Interpretación | Acción siguiente |
| --- | --- | --- |
| Hay clics, pero casi ningún cálculo iniciado | Anuncio y landing no mantienen la misma promesa | Ajustar mensaje, no subir presupuesto |
| Se inician cálculos, pero pocos terminan | Existe fricción en el formulario | Revisar campos y errores frecuentes |
| Hay resultados, pero no checkout | El reporte no comunica suficiente valor | Mejorar muestra y propuesta del reporte |
| Hay checkout, pero no pago | Revisar confianza, precio y experiencia de Stripe | Diagnosticar antes de atraer más tráfico |
| Se confirma al menos una venta fría | Existe disposición inicial a pagar | Repetir prueba sin ampliar aún el alcance |
| Se repiten entre tres y cinco ventas | Señal comercial más sólida | Aumentar presupuesto gradualmente |

No evaluar el piloto por CTR ni por número de cálculos aislados. La venta confirmada en Stripe y
Supabase es la fuente de verdad; Analytics sirve para atribución y diagnóstico.
