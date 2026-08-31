# Convención de campañas de ROMANUS

## Objetivo del piloto de canalización laboral

La campaña de búsqueda debe medir el recorrido completo. Durante los primeros días,
la conversión principal será `romanus_review_whatsapp_continued`, que confirma que la
persona terminó el triage y decidió enviar su solicitud por WhatsApp. Cuando exista
volumen operativo suficiente, la optimización deberá migrar a un evento offline de
solicitud calificada o consulta realizada.

`romanus_calculator_completed` se conserva como microconversión de diagnóstico: permite
saber si la landing y la calculadora funcionan, pero no demuestra que exista una
oportunidad profesional.

### Eventos del embudo

| Evento | Uso |
| --- | --- |
| `romanus_calculator_completed` | Microconversión: cálculo terminado |
| `romanus_review_started` | La persona abrió el triage laboral |
| `romanus_review_submitted` | Terminó el formulario y consentimiento |
| `romanus_review_blocked_urgent` | Fue derivada por urgencia o plazo próximo |
| `romanus_review_whatsapp_continued` | Conversión web principal del piloto |

Ningún evento envía nombre, teléfono, cantidades, descripción del asunto ni respuestas
del formulario a Analytics.

## Parámetros UTM

| Parámetro | Valor inicial | Uso |
| --- | --- | --- |
| `utm_source` | `google` | Plataforma que origina el tráfico |
| `utm_medium` | `cpc` | Medio pagado de búsqueda |
| `utm_campaign` | `mx_laboral_calculadoras` | Experimento inicial en México |
| `utm_content` | `finiquito_search` o `liquidacion_search` | Variante y grupo de anuncios |
| `utm_term` | `{keyword}` | Palabra clave de Google Ads mediante ValueTrack |

## URLs finales

### Finiquito

`https://www.romanus.mx/calcular-finiquito?utm_source=google&utm_medium=cpc&utm_campaign=mx_laboral_calculadoras&utm_content=finiquito_search&utm_term={keyword}`

### Liquidación

`https://www.romanus.mx/calcular-liquidacion?utm_source=google&utm_medium=cpc&utm_campaign=mx_laboral_calculadoras&utm_content=liquidacion_search&utm_term={keyword}`

## Reglas

- Mantener los valores en minúsculas, sin acentos y separados por guion bajo.
- No incluir nombres, correos, teléfonos ni información del asunto jurídico en UTMs.
- No cambiar `utm_campaign` durante el experimento de 14 días.
- Crear variaciones nuevas con `utm_content`, no sobrescribiendo campañas anteriores.
- Comparar costo por `romanus_review_whatsapp_continued` y, de forma manual, costo por
  solicitud confirmada y consulta realizada. No evaluar la campaña solo por clics o
  cálculos terminados.
