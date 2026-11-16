# Contratos de API — Taply

> **Fuente de verdad única** entre frontend y backend.
> Si un endpoint cambia, actualiza este documento y el Swagger en `/api/v1/docs`.

## Base URL

```
http://localhost:3001/api/v1
```

## Autenticación

Todos los endpoints protegidos requieren el header:

```
Authorization: Bearer <accessToken>
```

Los tokens se obtienen con `POST /auth/register` o `POST /auth/login`.

---

## 1. Auth

### POST /auth/register

Registrar un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Secure123",
  "name": "Juan Pérez"
}
```

- `email` (string, requerido): Email válido y único
- `password` (string, requerido): Mínimo 8 caracteres, mayúscula, minúscula y número
- `name` (string, opcional): Nombre del usuario

**Response 201:**
```json
{
  "user": { "id": "uuid", "email": "usuario@ejemplo.com", "name": "Juan Pérez" },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Error 409:** Email ya registrado
**Error 400:** Datos inválidos

---

### POST /auth/login

Iniciar sesión.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Secure123"
}
```

**Response 200:**
```json
{
  "user": { "id": "uuid", "email": "usuario@ejemplo.com", "name": "Juan Pérez" },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Error 401:** Credenciales inválidas

---

### POST /auth/refresh

Refrescar el token de acceso.

**Body:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbG..."
}
```

**Error 401:** Token de refresco inválido o expirado

---

### GET /auth/me

Obtener perfil del usuario autenticado. **Requiere JWT.**

**Response 200:**
```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "role": "USER"
}
```

**Error 401:** No autenticado

---

## 2. Businesses

### POST /businesses

Crear un nuevo negocio. **Requiere JWT.**

**Body:**
```json
{
  "name": "Mi Restaurante",
  "description": "El mejor restaurante de la ciudad"
}
```

- `name` (string, requerido): 2-100 caracteres
- `description` (string, opcional): Máximo 500 caracteres

**Response 201:**
```json
{
  "id": "uuid",
  "name": "Mi Restaurante",
  "slug": "mi-restaurante",
  "description": "El mejor restaurante de la ciudad",
  "status": "ACTIVE",
  "ownerId": "uuid",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

**Error 400:** Datos inválidos

---

### GET /businesses

Listar negocios del usuario autenticado. **Requiere JWT.**

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Mi Restaurante",
    "slug": "mi-restaurante",
    "status": "ACTIVE",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### GET /businesses/:id

Obtener un negocio por ID. **Requiere JWT.**

**Response 200:** Negocio encontrado
**Error 404:** Negocio no encontrado
**Error 403:** No autorizado

---

### PATCH /businesses/:id

Actualizar un negocio. **Requiere JWT.**

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "description": "Nueva descripción"
}
```

Ambos campos son opcionales (actualización parcial).

**Response 200:** Negocio actualizado
**Error 404:** Negocio no encontrado
**Error 403:** No autorizado

---

### DELETE /businesses/:id

Eliminar un negocio. **Requiere JWT.**

**Response 200:**
```json
{ "message": "Negocio eliminado correctamente" }
```

**Error 404:** Negocio no encontrado
**Error 403:** No autorizado

---

## 3. Pages

> ⚠️ **IMPORTANTE:** Todos los endpoints de Pages requieren `businessId` como **query param**, NO en el body.

### POST /pages?businessId=<uuid>

Crear una nueva página. **Requiere JWT.**

**Query Params:**
- `businessId` (string, requerido): ID del negocio propietario

**Body:**
```json
{
  "slug": "mi-restaurante",
  "templateId": "uuid",
  "description": "Descripción opcional"
}
```

- `slug` (string, requerido): 2-100 caracteres, único por negocio
- `templateId` (string, opcional): ID de la plantilla
- `description` (string, opcional): Máximo 500 caracteres

**Response 201:**
```json
{
  "id": "uuid",
  "slug": "mi-restaurante",
  "status": "DRAFT",
  "businessId": "uuid",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Error 400:** Datos inválidos
**Error 403:** No autorizado

---

### GET /pages?businessId=<uuid>

Listar páginas de un negocio. **Requiere JWT.**

**Query Params:**
- `businessId` (string, requerido): ID del negocio

**Response 200:** Array de páginas

---

### GET /pages/:id?businessId=<uuid>

Obtener una página con su versión publicada. **Requiere JWT.**

**Query Params:**
- `businessId` (string, requerido): ID del negocio

**Response 200:** Página encontrada
**Error 404:** Página no encontrada
**Error 403:** No autorizado

---

### PATCH /pages/:id?businessId=<uuid>

Actualizar una página. **Requiere JWT.**

**Query Params:**
- `businessId` (string, requerido): ID del negocio

**Body:**
```json
{
  "slug": "nuevo-slug",
  "templateId": "uuid"
}
```

Ambos campos opcionales.

**Response 200:** Página actualizada

---

### DELETE /pages/:id?businessId=<uuid>

Eliminar una página. **Requiere JWT.**

**Query Params:**
- `businessId` (string, requerido): ID del negocio

**Response 200:**
```json
{ "message": "Página eliminada" }
```

---

### POST /pages/:id/publish?businessId=<uuid>

Publicar una página. **Requiere JWT.**

**Query Params:**
- `businessId` (string, requerido): ID del negocio

**Response 200:** Página publicada
**Error 400:** No hay versión DRAFT para publicar
**Error 404:** Página no encontrada

---

## 4. NFC Tags

> ⚠️ **IMPORTANTE:** Todos los endpoints de NFC Tags requieren `businessId` como **query param**, NO en el body.

### POST /nfc-tags?businessId=<uuid>

Crear una etiqueta NFC. **Requiere JWT.**

**Query Params:**
- `businessId` (string, requerido): ID del negocio

**Body:**
```json
{
  "token": "mi-token-personalizado"
}
```

- `token` (string, opcional): Si no se proporciona, se genera automáticamente

**Response 201:**
```json
{
  "id": "uuid",
  "token": "mi-token-personalizado",
  "status": "INVENTORY",
  "businessId": "uuid",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

### GET /nfc-tags?businessId=<uuid>

Listar etiquetas de un negocio. **Requiere JWT.**

**Query Params:**
- `businessId` (string, requerido): ID del negocio

**Response 200:** Array de etiquetas

---

### GET /nfc-tags/:id?businessId=<uuid>

Obtener una etiqueta con su asignación activa. **Requiere JWT.**

**Query Params:**
- `businessId` (string, requerido): ID del negocio

**Response 200:** Etiqueta encontrada
**Error 404:** Etiqueta no encontrada

---

### POST /nfc-tags/:id/assign?businessId=<uuid>

Asignar una etiqueta a una página. **Requiere JWT.**

**Query Params:**
- `businessId` (string, requerido): ID del negocio

**Body:**
```json
{
  "pageId": "uuid"
}
```

**Response 200:** Asignación creada
**Error 404:** Etiqueta o página no encontrada

---

### POST /nfc-tags/:id/scan

Registrar un escaneo. **Requiere JWT.**

**Response 200:** Escaneo registrado
**Error 404:** Etiqueta no encontrada

---

## 5. Analytics

### GET /analytics/stats?pageId=<uuid>&startDate=<date>&endDate=<date>

Obtener estadísticas de una página. **Requiere JWT.**

**Query Params:**
- `pageId` (string, requerido): ID de la página
- `startDate` (string, opcional): Fecha de inicio ISO 8601
- `endDate` (string, opcional): Fecha de fin ISO 8601

**Response 200:**
```json
{
  "totalViews": 150,
  "totalClicks": 45,
  "totalScans": 30,
  "viewsByDay": [
    { "date": "2026-01-01", "count": 10 },
    { "date": "2026-01-02", "count": 15 }
  ],
  "clicksByButton": [
    { "button": "whatsapp", "count": 20 },
    { "button": "instagram", "count": 25 }
  ]
}
```

---

## 6. QR Codes

### POST /qr/generate

Generar un código QR para una página. **Requiere JWT.**

**Body:**
```json
{
  "pageId": "uuid"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "pageId": "uuid",
  "dataUrl": "data:image/png;base64,iVBOR...",
  "publicUrl": "http://localhost:3000/p/mi-restaurante",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Error 404:** Página no encontrada

---

### GET /qr/:pageId

Obtener QR existente para una página. **Requiere JWT.**

**Response 200:**
```json
{
  "id": "uuid",
  "pageId": "uuid",
  "dataUrl": "data:image/png;base64,iVBOR...",
  "publicUrl": "http://localhost:3000/p/mi-restaurante",
  "page": {
    "slug": "mi-restaurante",
    "businessName": "Mi Restaurante"
  },
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Error 404:** QR no encontrado

---

## 7. Public (Sin autenticación)

### GET /public/nfc/:token

Resolver un token NFC y obtener la página asignada.

**Response 200:**
```json
{
  "redirectUrl": "/p/mi-restaurante",
  "page": { "slug": "mi-restaurante" },
  "business": { "name": "Mi Restaurante" }
}
```

**Error 404:** Etiqueta no encontrada o sin asignación
**Error 400:** Etiqueta no activa o negocio suspendido

---

### POST /public/analytics/events

Registrar un evento de analíticas sin autenticación.

**Body:**
```json
{
  "type": "PAGE_VIEW",
  "pageId": "uuid",
  "tagId": "uuid",
  "buttonKey": "whatsapp",
  "metadata": { "userAgent": "Mozilla/5.0" }
}
```

- `type` (string, requerido): `PAGE_VIEW` | `BUTTON_CLICK` | `TAG_SCAN`
- `pageId` (string, requerido): ID de la página
- `tagId` (string, opcional): ID de la etiqueta NFC
- `buttonKey` (string, opcional): Clave del botón clickeado
- `metadata` (object, opcional): Metadatos adicionales

**Response 201:** Evento registrado
**Error 400:** Datos inválidos
**Error 404:** Página no encontrada

---

## Resumen de Endpoints

| Método | Ruta | Auth | Query Params | Body |
|--------|------|------|-------------|------|
| POST | `/auth/register` | No | — | `{ email, password, name? }` |
| POST | `/auth/login` | No | — | `{ email, password }` |
| POST | `/auth/refresh` | No | — | `{ refreshToken }` |
| GET | `/auth/me` | JWT | — | — |
| POST | `/businesses` | JWT | — | `{ name, description? }` |
| GET | `/businesses` | JWT | — | — |
| GET | `/businesses/:id` | JWT | — | — |
| PATCH | `/businesses/:id` | JWT | — | `{ name?, description? }` |
| DELETE | `/businesses/:id` | JWT | — | — |
| POST | `/pages` | JWT | `businessId` | `{ slug, templateId?, description? }` |
| GET | `/pages` | JWT | `businessId` | — |
| GET | `/pages/:id` | JWT | `businessId` | — |
| PATCH | `/pages/:id` | JWT | `businessId` | `{ slug?, templateId? }` |
| DELETE | `/pages/:id` | JWT | `businessId` | — |
| POST | `/pages/:id/publish` | JWT | `businessId` | — |
| POST | `/nfc-tags` | JWT | `businessId` | `{ token? }` |
| GET | `/nfc-tags` | JWT | `businessId` | — |
| GET | `/nfc-tags/:id` | JWT | `businessId` | — |
| POST | `/nfc-tags/:id/assign` | JWT | `businessId` | `{ pageId }` |
| POST | `/nfc-tags/:id/scan` | JWT | — | — |
| GET | `/analytics/stats` | JWT | `pageId`, `startDate?`, `endDate?` | — |
| POST | `/qr/generate` | JWT | — | `{ pageId }` |
| GET | `/qr/:pageId` | JWT | — | — |
| GET | `/public/nfc/:token` | No | — | — |
| POST | `/public/analytics/events` | No | — | `{ type, pageId, tagId?, buttonKey?, metadata? }` |
