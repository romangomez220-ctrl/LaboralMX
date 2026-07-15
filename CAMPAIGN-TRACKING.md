# Convención de campañas de ROMANUS

## Objetivo inicial

La primera campaña de búsqueda debe optimizarse al evento clave de GA4
`romanus_calculator_completed`. Los clics, vistas de página y contactos por WhatsApp
son señales de diagnóstico, no la conversión principal del experimento.

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
- Comparar costo por `romanus_calculator_completed`, no solo costo por clic.
