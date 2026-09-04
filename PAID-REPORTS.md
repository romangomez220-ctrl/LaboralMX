# Reporte ROMANUS de cálculo laboral

El producto permanece desactivado por defecto con `VITE_PAID_REPORTS_ENABLED=false`.

## Arquitectura

La calculadora produce `ResultadoCalculo`. Liquidación crea además un `LiquidacionSnapshot`
tipado. `buildLiquidacionReportModel` consume ambos sin recalcular importes; el renderer existente
de jsPDF produce el documento premium. Stripe Checkout crea una compra pendiente mediante una
Edge Function. Solo el webhook firmado cambia el pago a `paid`. Después, `report-access` valida
un token opaco y el estado confirmado, autoriza una carga firmada al bucket privado y
`finalize-report` valida firma PDF y checksum, registra el archivo y entrega una URL firmada de
cinco minutos. La generación se reclama de forma atómica (`authorized` → `generating`) y puede
recuperarse desde `failed` o después de diez minutos si una pestaña quedó interrumpida.

## Configuración

- Precio, moneda y versiones: `shared/reportConfig.ts`, fuente compartida por frontend y backend.
- Flags: `VITE_PAID_REPORTS_ENABLED` y `VITE_FREE_LABOR_ORIENTATION_ENABLED`.
- Versiones: `reportVersion` y `calculatorVersion` en ambos archivos de configuración.

## Edge Functions

- `create-report-checkout`
- `stripe-report-webhook`
- `report-access`
- `finalize-report`

Secretos que debe configurar el proyecto: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y
`APP_BASE_URL`. Supabase proporciona automáticamente `SUPABASE_URL` y
`SUPABASE_SERVICE_ROLE_KEY` al runtime alojado; no deben duplicarse ni usar prefijo `VITE_`.

Solo `stripe-report-webhook` debe desplegarse con `--no-verify-jwt`. Las otras tres funciones
conservan la verificación JWT predeterminada porque son invocadas mediante `supabase-js`.

## Analytics

Se emiten `romanus_pdf_offer_viewed`, `romanus_pdf_checkout_started`,
`romanus_pdf_payment_succeeded`, `romanus_pdf_payment_failed`, `romanus_pdf_generated` y
`romanus_pdf_downloaded`. Solo incluyen tipo de calculadora, precio, moneda, versión y proveedor.

## Añadir otra calculadora

Crear un snapshot tipado, su constructor de `ReportModel`, reglas de insights/checklist y adaptar
el renderer compartido. No duplicar ni volver a ejecutar el motor matemático.
