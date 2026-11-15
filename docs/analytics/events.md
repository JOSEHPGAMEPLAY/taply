# Analíticas — Eventos y Métricas

## Tipos de eventos

| Tipo | Descripción | Endpoint |
|---|---|---|
| PAGE_VIEW | Visita a una página pública | `POST /public/analytics/events` |
| BUTTON_CLICK | Clic en un botón de la página | `POST /public/analytics/events` |
| TAG_SCAN | Escaneo de una etiqueta NFC | `GET /public/nfc/:token` (automático) |

## Tracking

Los eventos se registran de dos formas:

1. **Automático**: Cuando se escanea una etiqueta NFC, el endpoint de resolución registra automáticamente un evento `TAG_SCAN`.
2. **Manual**: El frontend público envía un evento `PAGE_VIEW` al cargar la página y un evento `BUTTON_CLICK` al hacer clic en un botón.

## Métricas calculadas

El endpoint `GET /analytics/stats` agrega los eventos por:

- **Tipo de evento**: Total de PAGE_VIEW, BUTTON_CLICK y TAG_SCAN.
- **Botón**: Cuántos clics tuvo cada botón de la página.
- **Período**: Los eventos se filtran por rango de fechas (`from` y `to`).

## Retención

Los eventos se retienen durante **12 meses**. Después de este período, se eliminan automáticamente para cumplir con la política de privacidad.

## Índices de base de datos

- `analytics_events_page_id_idx`: Índice por `pageId` para consultas rápidas por página.
- `analytics_events_created_at_idx`: Índice por `createdAt` para filtrar por período.
- `analytics_events_type_idx`: Índice por `type` para agrupar por tipo de evento.
