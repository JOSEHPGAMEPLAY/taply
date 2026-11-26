# Auditoría del Proyecto Taply — Estado Actual

**Fecha:** 16 de noviembre de 2026  
**Repositorio:** https://github.com/JOSEHPGAMEPLAY/taply

---

## 🟢 Lo que SÍ funciona

### Infraestructura Docker

| Componente | Estado | Detalles |
|---|---|---|
| PostgreSQL 16-alpine | ✅ Healthy | Puerto 5433 (host), volumen persistente |
| Backend NestJS (api) | ✅ Healthy | Puerto 3001, Prisma conectado |
| Frontend Next.js (web) | ✅ Running | Puerto 3000, 7 páginas generadas |
| `GET /api/v1/health` | ✅ 200 | `{"status":"ok"}` |
| `GET /api/v1/health/ready` | ✅ 200 | `{"status":"ready","checks":{"database":"ok"}}` |
| Persistencia de datos | ✅ Verificada | Sobrevive reinicio de contenedores |

### Backend — Módulos Funcionales

| Módulo | Endpoints | Estado | Verificado |
|---|---|---|---|
| **Health** | `GET /health`, `GET /health/ready` | ✅ OK | Liveness y readiness |
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` | ✅ OK | JWT, bcrypt, refresh tokens |
| **Businesses** | `POST/GET/PATCH/DELETE /businesses` | ✅ OK | CRUD con ownership |
| **Pages** | `POST/GET/PATCH/DELETE /pages`, `POST /pages/:id/publish` | ✅ OK | CRUD + publish workflow |
| **NFC Tags** | `POST/GET /nfc-tags`, `POST /nfc-tags/:id/assign`, `POST /nfc-tags/:id/scan` | ✅ OK | Crear, asignar, escanear |
| **Analytics** | `GET /analytics/stats`, `DELETE /analytics/events/prune` | ✅ OK | Stats + retención 12 meses |
| **Billing** | `POST/GET /billing/products`, `POST /billing/orders` | ✅ OK | Productos y órdenes |
| **Public** | `GET /public/nfc/:token`, `POST /public/analytics/events` | ✅ OK | Resolución NFC + tracking |
| **QR** | `POST /qr/generate`, `GET /qr/:pageId` | ✅ OK | Generación PNG |
| **Audit** | Interceptor global | ✅ OK | Logging automático en AuditLog |
| **Swagger** | `GET /api/v1/docs` | ✅ OK | Documentación interactiva |

### Frontend — Páginas Funcionales

| Página | Ruta | Estado | Detalles |
|---|---|---|---|
| Landing page | `/` | ✅ OK | Hero, botones CTA, features |
| Login | `/login` | ✅ OK | Formulario conectado a API |
| Registro | `/register` | ✅ OK | Formulario conectado a API |
| Dashboard | `/app` | ✅ OK | Stats reales, negocios, páginas, tags |
| Negocios | `/app/businesses` | ✅ OK | CRUD completo |
| Páginas | `/app/pages` | ✅ OK | CRUD + editor de botones + publish |
| NFC Tags | `/app/nfc-tags` | ✅ OK | CRUD + asignar + QR |
| Analíticas | `/app/analytics` | ✅ OK | Métricas por página |
| Página pública | `/p/[slug]` | ⚠️ Parcial | Muestra slug pero NO carga datos reales |
| Resolución NFC | `/t/[token]` | ✅ OK | Redirige o muestra error |

### Base de Datos

| Componente | Estado | Detalles |
|---|---|---|
| Esquema Prisma | ✅ OK | 17 modelos, 11 enums |
| Migraciones | ✅ OK | Aplicadas y versionadas |
| Seed | ✅ OK | 5 plantillas predeterminadas |
| Restricciones SQL | ✅ OK | Índices parciales + CHECK constraints |
| Modelo QrCode | ✅ OK | Agregado y migrado |

### Pruebas Automatizadas

| Suite | Pruebas | Estado |
|---|---|---|
| Auth | 7 | ✅ Pasando |
| Businesses | 11 | ✅ Pasando |
| Public | 5 | ✅ Pasando |
| QR | 5 | ✅ Pasando |
| **Total** | **27** | **✅ 27/27 pasando** |

### Documentación

| Documento | Estado |
|---|---|
| `docs/architecture/overview.md` | ✅ |
| `docs/architecture/modules.md` | ✅ |
| `docs/architecture/decisions.md` | ✅ |
| `docs/database/erd.md` | ✅ |
| `docs/database/schema.md` | ✅ |
| `docs/database/migrations.md` | ✅ |
| `docs/api/endpoints.md` | ✅ |
| `docs/api/contracts.md` | ✅ |
| `docs/security/authentication.md` | ✅ |
| `docs/security/authorization.md` | ✅ |
| `docs/security/privacy.md` | ✅ (Ley 1581, ARCO) |
| `docs/nfc/workflow.md` | ✅ |
| `docs/analytics/events.md` | ✅ |
| `docs/billing/business-rules.md` | ✅ |
| `docs/development/setup.md` | ✅ |
| `docs/deployment/production.md` | ✅ |
| `docs/deployment/backup-restore.md` | ✅ |
| `docs/docker/development.md` | ✅ |
| `docs/docker/production.md` | ✅ |
| `docs/docker/troubleshooting.md` | ✅ |

**Total: 20 documentos técnicos** ✅

### Scripts de Automatización

| Script | Estado |
|---|---|
| `docker/backup.ps1` | ✅ Backup comprimido con retención |
| `docker/restore.ps1` | ✅ Restauración con confirmación |
| `docker-compose.prod.yml` | ✅ Límites CPU/memoria, log rotation |

---

## 🟡 Lo que funciona PARCIALMENTE

### 1. Página pública `/p/[slug]` — No carga datos reales

**Problema:** La página pública es un componente Server Component estático que solo muestra el slug. No hace fetch a la API para obtener el negocio, los botones configurados ni registra PAGE_VIEW.

**Impacto:** Cuando alguien escanea un NFC o QR, ve una página genérica sin la información del negocio ni los botones.

**Archivos afectados:**
- `apps/web/src/app/p/[slug]/page.tsx` — Solo muestra el slug, sin fetch a la API

**Solución requerida:**
- Convertir a Server Component con fetch a `GET /public/nfc/:token` o crear endpoint `GET /public/pages/:slug`
- Mostrar nombre del negocio, descripción y botones configurados
- Registrar evento PAGE_VIEW al cargar

### 2. NFC Resolution — Negocio debe estar ACTIVE

**Problema:** El endpoint `GET /public/nfc/:token` retorna `"Negocio no activo"` si el negocio no tiene status `ACTIVE`. Al crear un negocio con `POST /businesses`, el status por defecto no es `ACTIVE`.

**Impacto:** Las etiquetas NFC no resuelven si el negocio no está explícitamente activo.

**Archivos afectados:**
- `apps/api/src/public/public.service.ts` (línea 65) — Verifica `business.status !== 'ACTIVE'`
- `apps/api/src/businesses/businesses.service.ts` — Status por defecto al crear

**Solución requerida:**
- Verificar qué status se asigna por defecto al crear un negocio
- Si no es `ACTIVE`, cambiarlo o hacer que el frontend permita activar el negocio

### 3. Toggle de estado de negocios — Placeholder

**Problema:** El frontend tiene un botón para cambiar el estado del negocio (activo/pausado), pero la API no tiene un endpoint específico para cambiar solo el status. El `PATCH /businesses/:id` acepta `status` pero el frontend no lo usa correctamente.

**Impacto:** No se puede activar un negocio desde el panel para que las etiquetas NFC funcionen.

**Archivos afectados:**
- `apps/web/src/app/app/businesses/page.tsx` — `toggleStatus` es placeholder

**Solución requerida:**
- Verificar que `PATCH /businesses/:id` acepta `{ status: "ACTIVE" }` en el body
- Conectar el toggle del frontend a este endpoint

### 4. Editor de botones — Guarda en DRAFT, no visible hasta publicar

**Problema:** El editor de botones en `/app/pages` guarda los botones en la versión DRAFT. El usuario debe publicar manualmente para que aparezcan en la página pública. Además, la página pública no lee los botones.

**Impacto:** Los botones editados no se ven en la página pública aunque se publiquen.

**Archivos afectados:**
- `apps/api/src/pages/pages.service.ts` — Guarda botones en versión DRAFT ✅
- `apps/web/src/app/p/[slug]/page.tsx` — No lee botones ❌

**Solución requerida:**
- La página pública debe cargar la versión publicada y mostrar los botones

---

## 🔴 Lo que NO funciona o está incompleto

### 1. Contratos API — businessId como query param vs body

**Problema:** El backend usa `businessId` como **query param** (`?businessId=<uuid>`), pero el `CreatePageDto` no tiene `businessId` y el frontend a veces lo envía en el body. El `api.ts` está correcto, pero las páginas del frontend podrían tener inconsistencias.

**Estado:** El `api.ts` está sincronizado ✅, pero hay que verificar que todas las páginas del frontend usen los métodos correctos.

### 2. Página pública sin datos dinámicos

**Problema:** `/p/[slug]` es completamente estática. No consulta la API para obtener:
- Nombre y descripción del negocio
- Botones configurados en la versión publicada
- Imagen o logo del negocio

**Impacto:** La experiencia del usuario final es genérica y no refleja la personalización del negocio.

### 3. Sin endpoint `GET /public/pages/:slug`

**Problema:** No existe un endpoint público para obtener los datos de una página por slug. La página pública debería usar algo como `GET /public/pages/:slug` que retorne el negocio, la versión publicada y los botones.

**Impacto:** No hay forma de que el frontend público obtenga los datos sin autenticación.

### 4. Billing incompleto

**Problema:** El módulo de billing tiene solo productos y órdenes. Faltan:
- Endpoint `POST /billing/payments` — Procesar pagos
- Suscripciones workflow completo
- BusinessEntitlements — Derechos de uso
- Integración con Stripe (placeholder)

**Impacto:** No se puede cobrar ni gestionar suscripciones.

### 5. Sin endpoint de templates

**Problema:** No hay controller para `GET /templates`. El modelo Template existe en Prisma y tiene 5 templates en el seed, pero no hay forma de listarlos desde la API.

**Impacto:** Al crear una página, no se puede seleccionar una plantilla.

### 6. Frontend — Sin manejo de errores robusto

**Problema:** Las páginas del frontend tienen `try/catch` básico pero no muestran mensajes de error al usuario de forma consistente. Algunos errores de la API se muestran como texto crudo.

**Impacto:** Mala experiencia de usuario cuando algo falla.

### 7. Sin CI/CD

**Problema:** No hay GitHub Actions ni pipeline de CI/CD para:
- Ejecutar pruebas automáticamente en cada push
- Build de Docker en pull requests
- Deploy automático

**Impacto:** Las pruebas solo se ejecutan manualmente.

---

## 📋 Backlog Priorizado

### 🔥 Crítico — Bloquea el producto

| # | Tarea | Módulo | Esfuerzo | Descripción |
|---|---|---|---|---|
| 1 | **Endpoint público de páginas** | Backend | Medio | Crear `GET /public/pages/:slug` que retorne negocio, versión publicada y botones sin autenticación |
| 2 | **Página pública con datos reales** | Frontend | Medio | `/p/[slug]` debe fetch de `GET /public/pages/:slug` y mostrar nombre, descripción y botones clickeables |
| 3 | **Tracking PAGE_VIEW en página pública** | Frontend | Bajo | Al cargar `/p/[slug]`, enviar `POST /public/analytics/events` con tipo PAGE_VIEW |
| 4 | **Tracking BUTTON_CLICK** | Frontend | Bajo | Al hacer clic en un botón de `/p/[slug]`, enviar evento BUTTON_CLICK |
| 5 | **Activar negocio desde el panel** | Frontend | Bajo | Conectar `toggleStatus` en `/app/businesses` a `PATCH /businesses/:id` con `{ status: "ACTIVE" }` |

### ⚡ Alto — Mejora significativa

| # | Tarea | Módulo | Esfuerzo | Descripción |
|---|---|---|---|---|
| 6 | **Endpoint de templates** | Backend | Bajo | Crear `GET /templates` para listar plantillas disponibles |
| 7 | **Endpoint de pagos** | Backend | Medio | `POST /billing/payments` con webhook de Stripe (placeholder) |
| 8 | **Mejorar errores en frontend** | Frontend | Medio | Toast notifications consistentes para éxito/error en todas las páginas |
| 9 | **Despublicar página** | Backend | Bajo | Endpoint `POST /pages/:id/unpublish` para revertir publicación |
| 10 | **QR en página de NFC tags** | Frontend | Bajo | Mostrar el QR generado en la lista de etiquetas |

### 📊 Medio — Calidad y mantenibilidad

| # | Tarea | Módulo | Esfuerzo | Descripción |
|---|---|---|---|---|
| 11 | **CI/CD con GitHub Actions** | DevOps | Medio | Pipeline que ejecuta pruebas y build en cada push |
| 12 | **Pruebas de Pages y NfcTags** | Tests | Medio | Agregar suites de pruebas para Pages y NfcTags (actualmente solo Auth, Businesses, Public, QR) |
| 13 | **Tipado de respuestas API** | Frontend | Medio | Reemplazar `unknown` por tipos TypeScript en `api.ts` |
| 14 | **Validación de slug en frontend** | Frontend | Bajo | Validar que el slug no exista antes de crear página |
| 15 | **Scheduled event pruning** | Backend | Bajo | Comando NestJS o cron para eliminar eventos > 12 meses automáticamente |

### 🎨 Bajo — Mejoras cosméticas

| # | Tarea | Módulo | Esfuerzo | Descripción |
|---|---|---|---|---|
| 16 | **Logo y favicon** | Frontend | Bajo | Agregar logo de Taply y favicon |
| 17 | **Tema oscuro** | Frontend | Alto | Soporte para modo oscuro en el dashboard |
| 18 | **Gráficos en analíticas** | Frontend | Alto | Reemplazar barras CSS con librería de gráficos (Chart.js o Recharts) |
| 19 | **Exportar analíticas** | Backend | Medio | Endpoint `GET /analytics/export` para descargar CSV |
| 20 | **Panel de super-admin** | Backend | Alto | CRUD de usuarios, negocios y etiquetas desde un panel admin |

### 🚀 Rendimiento — Sprint 6

| # | Tarea | Módulo | Esfuerzo | Descripción |
|---|---|---|---|---|
| 21 | **[GitHub #30] Acotar y agregar consultas de analíticas** | Backend/DB | Alto | Filtrar por un rango predeterminado y agregar eventos en PostgreSQL; evaluar índices según el patrón de consulta |
| 22 | **[GitHub #31] Reducir latencia de páginas públicas** | Backend | Alto | Reducir lecturas de la página pública y evitar que el tracking síncrono prolongue la respuesta sin perder eventos |
| 23 | **[GitHub #32] Resumen eficiente del dashboard** | Backend/Frontend | Alto | Exponer conteos mínimos autenticados y dejar de descargar colecciones completas y versiones para las tarjetas |
| 24 | **[GitHub #29] Paralelizar métricas administrativas** | Backend | Medio | Ejecutar conteos independientes en paralelo o consolidarlos conservando resultados y autorización |
| 25 | **[GitHub #33] Navegación interna sin recarga completa** | Frontend | Medio | Usar `next/link` en la barra lateral del dashboard manteniendo estados activos y accesibilidad |

---

## 📊 Resumen Numérico

| Métrica | Valor |
|---|---|
| **Módulos backend** | 11 (health, auth, businesses, pages, nfc-tags, analytics, billing, public, qr, audit, prisma) |
| **Endpoints backend** | ~26 endpoints documentados en Swagger |
| **Páginas frontend** | 11 (landing, login, register, dashboard, businesses, pages, nfc-tags, analytics, public page, NFC resolve) |
| **Modelos Prisma** | 18 (17 originales + QrCode) |
| **Enums Prisma** | 11 |
| **Pruebas automatizadas** | 27/27 pasando (4 suites) |
| **Documentos técnicos** | 20 archivos |
| **Scripts de automatización** | backup.ps1, restore.ps1 |
| **Contenedores Docker** | 3 (postgres, api, web) |
| **Funcionalidades críticas pendientes** | 5 (página pública, tracking, activar negocio) |
| **Items en backlog** | 25 (20 originales + 5 de rendimiento en Sprint 6) |

---

## 🎯 Recomendación Inmediata

**Las 5 tareas críticas** son las que bloquean que un usuario real pueda usar Taply:

1. Sin `GET /public/pages/:slug`, la página pública no muestra nada útil.
2. Sin tracking PAGE_VIEW/BUTTON_CLICK, las analíticas no tienen datos reales.
3. Sin activar el negocio desde el panel, las etiquetas NFC no resuelven.

Estas 3 tareas se pueden completar en **1-2 sesiones de trabajo** y hacen que el producto sea funcional end-to-end: crear negocio → activar → crear página → publicar → asignar NFC → escanear → ver página con botones.
