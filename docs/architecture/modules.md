# Módulos — Taply

## Responsabilidad de cada módulo

Cada módulo de NestJS sigue el patrón **Controller → Service → DTO** con inyección de dependencias vía `@Inject(PRISMA_CLIENT)`. Los módulos son independientes entre sí y no importan otros módulos de negocio directamente.

### Health Module
- **Archivo**: `apps/api/src/health/`
- **Responsabilidad**: Endpoints de liveness y readiness para healthchecks de Docker.
- **Endpoints**: `GET /api/v1/health` (liveness), `GET /api/v1/health/ready` (readiness con verificación de DB).
- **Dependencias**: PrismaClient.

### Auth Module
- **Archivo**: `apps/api/src/auth/`
- **Responsabilidad**: Registro, login, refresco de tokens y obtención de perfil.
- **Endpoints**: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`.
- **Dependencias**: PrismaClient, JWT Service, Passport.
- **Patrones**: JwtStrategy para validar tokens, JwtAuthGuard para proteger rutas.

### Businesses Module
- **Archivo**: `apps/api/src/businesses/`
- **Responsabilidad**: CRUD de negocios con verificación de ownership.
- **Endpoints**: `POST/GET/PATCH/DELETE /businesses`.
- **Dependencias**: PrismaClient.
- **Patrones**: Ownership verification — solo el owner puede modificar un negocio.

### Pages Module
- **Archivo**: `apps/api/src/pages/`
- **Responsabilidad**: CRUD de páginas, gestión de versiones y workflow de publicación.
- **Endpoints**: `POST/GET/PATCH/DELETE /pages`, `POST /pages/:id/publish`.
- **Dependencias**: PrismaClient.
- **Patrones**: Transacción para crear página + versión inicial, publish workflow con versiones.

### NFC Tags Module
- **Archivo**: `apps/api/src/nfc-tags/`
- **Responsabilidad**: Creación, asignación y escaneo de etiquetas NFC.
- **Endpoints**: `POST/GET /nfc-tags`, `POST /nfc-tags/:id/assign`, `POST /nfc-tags/:id/scan`.
- **Dependencias**: PrismaClient.
- **Patrones**: Token único generado automáticamente, asignación con startedAt/endedAt.

### Analytics Module
- **Archivo**: `apps/api/src/analytics/`
- **Responsabilidad**: Agregación de estadísticas de eventos por página.
- **Endpoints**: `GET /analytics/stats`.
- **Dependencias**: PrismaClient.
- **Patrones**: Agrupación por tipo de evento y período de tiempo.

### Billing Module
- **Archivo**: `apps/api/src/billing/`
- **Responsabilidad**: Gestión de productos y órdenes de facturación.
- **Endpoints**: `POST/GET /billing/products`, `POST /billing/orders`.
- **Dependencias**: PrismaClient.
- **Patrones**: Items dentro de órdenes, validación de montos no negativos.

### Public Module
- **Archivo**: `apps/api/src/public/`
- **Responsabilidad**: Endpoints públicos sin autenticación para resolución NFC y tracking de eventos.
- **Endpoints**: `GET /public/nfc/:token`, `POST /public/analytics/events`.
- **Dependencias**: PrismaClient.
- **Patrones**: Resolución NFC con verificación de estado, registro de eventos anónimos.

### QR Module
- **Archivo**: `apps/api/src/qr/`
- **Responsabilidad**: Generación de códigos QR como alternativa a NFC.
- **Endpoints**: `POST /qr/generate`, `GET /qr/:pageId`.
- **Dependencias**: PrismaClient, paquete `qrcode`.
- **Patrones**: Data URL SVG almacenado en DB, relación con Page.

### Audit Module
- **Archivo**: `apps/api/src/audit/`
- **Responsabilidad**: Logging automático de operaciones críticas.
- **Componentes**: AuditService (escritura en DB), AuditInterceptor (interceptor global).
- **Dependencias**: PrismaClient.
- **Patrones**: Interceptor global que mapea rutas a entidades y acciones.

### Prisma Module
- **Archivo**: `apps/api/src/prisma/`
- **Responsabilidad**: Proveedor global de PrismaClient con inyección de dependencias.
- **Dependencias**: Ninguna.
- **Patrones**: Token de inyección `PRISMA_CLIENT`, `OnModuleInit` para conectar a DB.

## Dependencias entre módulos

```
┌───────────┐     ┌──────────┐
│  Health   │────▶│  Prisma  │
└───────────┘     └──────────┘
┌───────────┐     ┌──────────┐
│   Auth    │────▶│  Prisma  │
└───────────┘     └──────────┘
┌───────────┐     ┌──────────┐
│ Businesses│────▶│  Prisma  │
└───────────┘     └──────────┘
┌───────────┐     ┌──────────┐
│  Pages    │────▶│  Prisma  │
└───────────┘     └──────────┘
┌───────────┐     ┌──────────┐
│  NFC Tags │────▶│  Prisma  │
└───────────┘     └──────────┘
┌───────────┐     ┌──────────┐
│ Analytics │────▶│  Prisma  │
└───────────┘     └──────────┘
┌───────────┐     ┌──────────┐
│  Billing  │────▶│  Prisma  │
└───────────┘     └──────────┘
┌───────────┐     ┌──────────┐
│  Public   │────▶│  Prisma  │
└───────────┘     └──────────┘
┌───────────┐     ┌──────────┐
│    QR     │────▶│  Prisma  │
└───────────┘     └──────────┘
┌───────────┐     ┌──────────┐
│  Audit    │────▶│  Prisma  │
└───────────┘     └──────────┘
```

Todos los módulos dependen exclusivamente de PrismaModule. No hay dependencias cruzadas entre módulos de negocio.

## Patrones comunes

1. **Inyección de Prisma**: Todos los servicios usan `@Inject(PRISMA_CLIENT)` en lugar de instanciar PrismaClient directamente.
2. **DTOs con validación**: Cada controller usa DTOs con decoradores de `class-validator` para validar los datos de entrada.
3. **Excepciones HTTP**: Se usan `HttpException` de NestJS (`NotFoundException`, `ForbiddenException`, `ConflictException`) en lugar de `throw new Error()`.
4. **Swagger decorators**: Cada endpoint tiene `@ApiTags`, `@ApiOperation` y `@ApiResponse` para la documentación automática.
5. **JSDoc en español**: Cada clase y método tiene documentación que explica su propósito y los principios SOLID aplicados.
