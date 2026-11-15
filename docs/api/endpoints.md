# Endpoints de la API — Taply

## Base URL

Todos los endpoints están bajo `/api/v1`.

## Autenticación

Los endpoints protegidos requieren el header `Authorization: Bearer <token>`.

---

## Health

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| GET | `/health` | Liveness — verifica que la app está corriendo | No |
| GET | `/health/ready` | Readiness — verifica que la DB está disponible | No |

**Respuesta `/health`:**
```json
{ "status": "ok" }
```

**Respuesta `/health/ready`:**
```json
{ "status": "ready", "checks": { "database": "ok" } }
```

---

## Auth

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/refresh` | Refrescar tokens JWT | No |
| GET | `/auth/me` | Obtener perfil del usuario | Sí |

**Request `/auth/register`:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "name": "Nombre Completo"
}
```

**Response `/auth/register` (201):**
```json
{
  "user": { "id": "uuid", "email": "usuario@ejemplo.com", "name": "Nombre Completo" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Request `/auth/login`:**
```json
{ "email": "usuario@ejemplo.com", "password": "contraseña123" }
```

**Response `/auth/login` (200):**
```json
{
  "user": { "id": "uuid", "email": "usuario@ejemplo.com", "name": "Nombre Completo" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Códigos de error:**
- `409 Conflict`: Email ya registrado
- `401 Unauthorized`: Credenciales inválidas

---

## Businesses

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| POST | `/businesses` | Crear negocio | Sí |
| GET | `/businesses` | Listar negocios del usuario | Sí |
| GET | `/businesses/:id` | Obtener negocio por ID | Sí |
| PATCH | `/businesses/:id` | Actualizar negocio | Sí |
| DELETE | `/businesses/:id` | Eliminar negocio | Sí |

**Request `/businesses` (POST):**
```json
{ "name": "Mi Negocio", "description": "Descripción opcional" }
```

**Response (201):**
```json
{
  "id": "uuid",
  "ownerId": "uuid",
  "name": "Mi Negocio",
  "slug": "mi-negocio",
  "description": "Descripción opcional",
  "status": "ACTIVE"
}
```

**Códigos de error:**
- `403 Forbidden`: No eres el owner del negocio
- `404 Not Found`: Negocio no encontrado

---

## Pages

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| POST | `/pages` | Crear página | Sí |
| GET | `/pages` | Listar páginas de un negocio | Sí |
| GET | `/pages/:id` | Obtener página por ID | Sí |
| PATCH | `/pages/:id` | Actualizar página | Sí |
| DELETE | `/pages/:id` | Eliminar página | Sí |
| POST | `/pages/:id/publish` | Publicar versión actual | Sí |

**Request `/pages` (POST):**
```json
{
  "businessId": "uuid",
  "slug": "mi-pagina",
  "templateId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "businessId": "uuid",
  "slug": "mi-pagina",
  "status": "DRAFT",
  "publishedVersionId": null
}
```

**Query params `/pages` (GET):**
- `businessId` (requerido): ID del negocio

---

## NFC Tags

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| POST | `/nfc-tags` | Crear etiqueta NFC | Sí |
| GET | `/nfc-tags` | Listar etiquetas de un negocio | Sí |
| POST | `/nfc-tags/:id/assign` | Asignar etiqueta a página | Sí |
| POST | `/nfc-tags/:id/scan` | Registrar escaneo | Sí |

**Request `/nfc-tags` (POST):**
```json
{ "businessId": "uuid" }
```

**Response (201):**
```json
{
  "id": "uuid",
  "businessId": "uuid",
  "token": "auto-generated-token",
  "status": "INVENTORY"
}
```

**Request `/nfc-tags/:id/assign`:**
```json
{ "pageId": "uuid" }
```

---

## Analytics

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| GET | `/analytics/stats` | Estadísticas de eventos | Sí |

**Query params `/analytics/stats`:**
- `pageId` (requerido): ID de la página
- `from` (opcional): Fecha inicio (ISO 8601)
- `to` (opcional): Fecha fin (ISO 8601)

**Response (200):**
```json
{
  "pageId": "uuid",
  "totalEvents": 150,
  "byType": {
    "PAGE_VIEW": 100,
    "BUTTON_CLICK": 40,
    "TAG_SCAN": 10
  },
  "byButton": {
    "whatsapp": 25,
    "website": 15
  }
}
```

---

## Billing

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| POST | `/billing/products` | Crear producto | Sí |
| GET | `/billing/products` | Listar productos | Sí |
| POST | `/billing/orders` | Crear orden | Sí |

---

## Public (Sin autenticación)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/public/nfc/:token` | Resolver token NFC y obtener página |
| POST | `/public/analytics/events` | Registrar evento de analítica |

**Response `/public/nfc/:token` (200):**
```json
{
  "redirectUrl": "/p/mi-pagina",
  "page": { "id": "uuid", "slug": "mi-pagina" },
  "business": { "id": "uuid", "name": "Mi Negocio", "slug": "mi-negocio" },
  "publishedVersion": { "config": {}, "buttons": [] }
}
```

**Request `/public/analytics/events`:**
```json
{
  "type": "PAGE_VIEW",
  "pageId": "uuid",
  "tagId": "uuid",
  "buttonKey": "whatsapp"
}
```

**Códigos de error:**
- `404 Not Found`: Etiqueta no encontrada o sin asignación
- `400 Bad Request`: Etiqueta no activa o negocio suspendido

---

## QR

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| POST | `/qr/generate` | Generar QR para una página | Sí |
| GET | `/qr/:pageId` | Obtener QR existente | Sí |

**Request `/qr/generate`:**
```json
{ "pageId": "uuid" }
```

**Response (201):**
```json
{
  "id": "uuid",
  "pageId": "uuid",
  "dataUrl": "data:image/svg+xml;base64,..."
}
```
