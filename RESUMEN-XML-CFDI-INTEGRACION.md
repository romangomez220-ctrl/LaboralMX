# ROMANUS — Integración del Conversor XML CFDI a Labs

## Qué se integró

El módulo recibido (`xml-converter-v1.zip`) se incorporó en `src/labs/xml-cfdi/`, siguiendo
exactamente el mismo patrón ya usado por RESICO dentro de Labs: ruta oculta, `useNoIndex`,
`LabsBadge`, breadcrumb "Fiscal Suite › ..." y su propio Error Boundary. Es la herramienta "XML
CFDI Beta" que ya estaba prevista como placeholder en `ROADMAP-FISCAL-SUITE-PRO.md` — ahora pasa
de placeholder a disponible.

Convierte XML de CFDI (estándar y Nómina) a un libro de Excel, 100% en el navegador del usuario.

## Auditoría del código recibido

Revisé los 14 archivos antes de integrarlos. Hallazgos:

- **Seguro:** usa `DOMParser` nativo del navegador (sin riesgo de XXE), no hace ninguna petición de
  red, no escribe en `localStorage`/`sessionStorage`/`IndexedDB`, y el límite de 50 archivos por
  lote se aplica correctamente antes de procesar.
- **Privacidad bien diseñada:** la función de analytics de este módulo no acepta ningún parámetro
  de datos — es imposible, a nivel de firma de TypeScript, enviar un RFC, CURP, NSS, UUID o importe
  a Google Analytics desde esta herramienta.
- **Un bug real de integración, corregido:** el archivo de analytics original declaraba su propio
  `Window.gtag` global, que chocaba con el que ya existe en `src/utils/analytics.ts`. Lo resolví
  haciendo que reutilice el `trackEvent()` ya existente del proyecto, en vez de declarar su propio
  acceso a `gtag` — un solo punto de contacto con GA4 en todo ROMANUS, sin perder la restricción de
  "sin payload" del módulo original.

## Corrección de branding (lo que pediste)

Reemplacé los colores genéricos de Tailwind por los tokens de ROMANUS en los 5 componentes con
interfaz visual:
- `XmlUploadZone`: el estado de "arrastrando archivo" pasó de azul genérico a dorado.
- `ConsentGate`: ya usaba ámbar/amarillo, lo alineé al token `warning` que usa el resto del sitio.
- `ConversionPreview`: el badge de éxito pasó a `success` (verde institucional), el botón
  "Exportar a Excel" pasó de azul genérico a `bg-primary` (navy), encabezados de tabla en navy.
- `ErrorPanel`: se mantuvo en rojo (igual que el resto de ROMANUS usa rojo para errores duros,
  distinto del ámbar para advertencias), solo se redondearon las esquinas para que coincida con el
  resto de tarjetas del sitio.
- El encabezado de la página (`ConverterPage`) ahora usa la tipografía y jerarquía visual de las
  demás páginas de Labs, con el badge "🧪 ROMANUS Labs" y el breadcrumb de Fiscal Suite.

La lógica de negocio (detección de tipo de CFDI, parseo de comprobante y nómina, armado del Excel,
límite de lote, gate de consentimiento) no se tocó.

## Archivos nuevos

```
src/labs/xml-cfdi/
  config.ts
  ConverterPage.tsx
  core/{types,detectTipo,parseCfdi,parseNomina,buildWorkbook}.ts
  analytics/xmlConverterAnalytics.ts   (adaptado, ver arriba)
  components/{ConsentGate,XmlUploadZone,ConversionPreview,ErrorPanel}.tsx   (rebrandeados)
  components/nomina/NominaToggleGate.tsx
```

## Archivos modificados

- `package.json` — se agregó `xlsx` como dependencia (la librería que usa este módulo para generar
  el Excel). **Tu próximo `npm install` la instalará.**
- `src/App.tsx` — nueva ruta `/labs/xml-cfdi`, con su propio Error Boundary, dentro de la sección ya
  existente de Labs.
- `src/pages/LabsLandingPage.tsx` — "XML CFDI Beta" pasó de tarjeta no clicable a tarjeta real,
  disponible, enlazando a la herramienta.
- `ROADMAP-FISCAL-SUITE-PRO.md` — se actualizó el diagrama y el backlog para reflejar que esta
  herramienta ya no es un placeholder.

## Sin tocar (verificado)

RESICO, Laboral Suite, Con Causa, el modal de consentimiento de WhatsApp, Analytics existente,
Error Boundaries, el easter egg de Josué, y todas las rutas previas. Cero rutas duplicadas.

## Pendiente de tu lado

- Validar el parser de Nómina contra XML reales (el documento original señala que Incapacidades y
  los nodos de Acciones/Jubilación quedaron fuera de este primer corte).
- `npm install` (instalará `xlsx`) y `npm run build` para la confirmación real.

```bash
npm install
npm run build
git add .
git commit -m "Integrar conversor XML CFDI a ROMANUS Labs, con branding ROMANUS"
git push origin main
```
