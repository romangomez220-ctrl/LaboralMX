# ROMANUS v4.7 — Corrección del flujo de intake real

## Sobre el problema reportado

Se revisó el componente completo para confirmar que el flujo de varios pasos sí queda incluido en
la entrega: se verificó el contenido del archivo final antes de compartirlo, en vez de asumir que
la última edición había quedado guardada correctamente. No es posible determinar con certeza qué
ocurrió en el despliegue anterior (hipótesis razonables: caché del navegador mostrando una versión
anterior del JS, o que el archivo no se haya sobrescrito correctamente al actualizar el
repositorio) — si después de esta entrega el formulario sigue sin aparecer, el siguiente paso es
revisar el proceso de build/deploy paso a paso, no el código en sí.

## Archivo modificado

- `src/components/WhatsAppConsentModal.tsx` — reescrito con el flujo completo de 4 pasos y los
  campos exactos que diste ahora:

```
Consentimiento → Formulario de triage → (urgencia crítica) → Bloqueo
                                       → (sin urgencia crítica) → Resumen → "Continuar a WhatsApp"
```

**Campos del formulario** (reemplazan los de v4.6):
- Nombre — ahora opcional (antes era obligatorio).
- Estado de la República — campo nuevo, select con las 32 entidades.
- Área principal — Familiar, Laboral, Civil, Mercantil, Administrativa, Otra (reemplaza la lista
  anterior de materias).
- Descripción breve del asunto — igual que antes, solo renombrado.
- ¿Existe alguna situación urgente? — No / Violencia activa / Detención o riesgo penal /
  Audiencia próxima o plazo legal en curso (reemplaza las 5 opciones anteriores).

**Regla de bloqueo:** cualquier opción de urgencia que no sea "No" bloquea el paso a WhatsApp y
muestra la pantalla de derivación — ya no existe la opción intermedia de "fecha límite próxima
con advertencia" de v4.6; ahora son exactamente las 3 críticas que pediste.

**Paso nuevo — Resumen:** si la urgencia es "No", ahora se muestra una pantalla de resumen con
todo lo capturado (Nombre, Estado, Área, Descripción) antes de construir el mensaje y abrir
WhatsApp, con botón "Continuar a WhatsApp" y un botón "Editar" para regresar al formulario.

Nada se guarda en ningún lado: todo vive en `useState` dentro del componente y se limpia al cerrar
(`reiniciarYCerrar`).

## Sin tocar (verificado)

`resicoCalculations.ts`, `laborCalculations.ts`, `analytics.ts`: cero ediciones. Error Boundaries:
intactos. Rutas existentes: sin cambios, cero duplicados. El consentimiento (paso 1, los 7 puntos
+ checkbox) se mantuvo exactamente igual, tal como pediste. Ningún correo publicado — eso no se
tocó en esta ronda.

## Build

Verificación estática de tipos de TypeScript: cero errores nuevos. Hallazgo previamente
identificado en `SelectField.tsx`, sin relación con estos cambios.

```bash
npm run build
git add .
git commit -m "v4.7: corregir flujo real de intake/triage en Con Causa con nuevos campos y paso de resumen"
git push origin main
```

Después de desplegar, te recomiendo probar en una ventana de incógnito (no solo refrescar) para
descartar cualquier caché del navegador.
