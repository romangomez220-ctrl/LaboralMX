# Medición del piloto de ventas ROMANUS

## Embudo instrumentado

| Orden | Evento | Función |
| --- | --- | --- |
| 1 | `romanus_calculator_started` | La persona comenzó la calculadora |
| 2 | `romanus_calculator_completed` | Terminó un cálculo válido |
| 3 | `romanus_result_viewed` | Vio el resultado |
| 4 | `romanus_pdf_offer_viewed` | Vio la oferta del reporte |
| 5 | `romanus_pdf_checkout_started` | Salió hacia Stripe Checkout |
| 6 | `romanus_pdf_payment_succeeded` | El backend confirmó el pago |
| 7 | `romanus_pdf_generated` | El PDF quedó generado |
| 8 | `romanus_pdf_downloaded` | Abrió la descarga firmada |

`romanus_review_whatsapp_continued` mide un prospecto jurídico y debe analizarse por separado de
la venta del reporte.

El evento de pago incluye `value: 39`, `currency: MXN` y un `transaction_id` único para atribuir
valor y evitar duplicados. No envía salario, fechas laborales, teléfono, respuestas del formulario
ni tokens de recuperación.

## Configuración manual pendiente en GA4

Propiedad esperada: ROMANUS / ID de medición `G-0XMBSS23D7`.

1. Abrir **Administrar → Visualización de datos → Eventos**.
2. Marcar `romanus_pdf_payment_succeeded` como evento clave.
3. Marcar `romanus_review_whatsapp_continued` como evento clave solo si se medirán prospectos.
4. No marcar cálculos, vistas de oferta ni checkout como eventos clave principales.
5. Verificar una ejecución en Tiempo real o DebugView antes de activar anuncios.

Si un evento todavía no aparece en la lista, debe producirse al menos una vez antes de marcarlo o
crearse por nombre desde la administración de Analytics.

## Configuración manual pendiente en Google Ads

1. Confirmar que Google Ads y la propiedad GA4 de ROMANUS estén vinculados.
2. Mantener activado el etiquetado automático.
3. Abrir **Objetivos → Conversiones → Crear acción de conversión → Importar → GA4 Web**.
4. Importar `romanus_pdf_payment_succeeded` y configurarlo como **Principal**.
5. Importar `romanus_pdf_checkout_started`, si se desea observarlo, como **Secundaria**.
6. Importar `romanus_review_whatsapp_continued` en un objetivo independiente de prospectos; no
   mezclarlo con el objetivo de venta del reporte.
7. Confirmar valor dinámico y moneda MXN antes de publicar la campaña.

La propagación entre GA4 y Google Ads puede tardar; no activar la campaña hasta que la acción de
venta sea visible y tenga el estado de configuración correcto.

## Convención UTM

| Parámetro | Valor |
| --- | --- |
| `utm_source` | `google` |
| `utm_medium` | `cpc` |
| `utm_campaign` | `mx_liquidacion_reporte_piloto` |
| `utm_content` | `liquidacion_report_search_a` |
| `utm_term` | `{keyword}` |

URL autorizada para el piloto:

`https://www.romanus.mx/calcular-liquidacion?utm_source=google&utm_medium=cpc&utm_campaign=mx_liquidacion_reporte_piloto&utm_content=liquidacion_report_search_a&utm_term={keyword}`

## Registro diario

Al cerrar cada día activo, registrar:

- gasto;
- clics y términos de búsqueda;
- cálculos iniciados y terminados;
- resultados y ofertas vistas;
- checkouts iniciados;
- pagos confirmados en Stripe/Supabase;
- descargas;
- solicitudes de revisión por WhatsApp;
- errores o mensajes recibidos.

No registrar nombres, teléfonos, salarios ni detalles del caso en la hoja de campaña.
