# Migraciones de Base de Datos — Taply

## Resumen

Taply usa **Prisma ORM** con **PostgreSQL** como base de datos. Las migraciones se gestionan con `prisma migrate dev` (desarrollo) y `prisma migrate deploy` (producción).

## Esquema

El esquema Prisma se encuentra en `prisma/schema.prisma` y contiene:

- **11 enums**: UserRole, BusinessStatus, PageStatus, PageVersionStatus, NfcTagStatus, OrderStatus, PaymentStatus, SubscriptionStatus, EntitlementStatus, AnalyticsEventType, AuditAction
- **17 modelos**: User, AuthSession, AuthToken, Business, Template, Page, PageVersion, NfcTag, TagAssignment, AnalyticsEvent, BillingProduct, Order, OrderItem, Payment, Subscription, BusinessEntitlement, AuditLog

## Comandos

### Desarrollo

```bash
# Validar el esquema
pnpm db:validate

# Generar Prisma Client
pnpm db:generate

# Crear y aplicar una nueva migración
pnpm db:migrate

# Abrir Prisma Studio (UI para explorar datos)
pnpm db:studio

# Ejecutar el seed
pnpm db:seed
```

### Producción

```bash
# Aplicar migraciones existentes (sin crear nuevas)
pnpm db:deploy
```

## Restricciones SQL personalizadas

Algunas restricciones no son soportadas nativamente por Prisma y se aplican mediante SQL personalizado:

- **Índice parcial único**: `uq_tag_assignment_active` — solo una asignación activa por etiqueta
- **CHECK constraints**: precios no negativos, cantidades positivas, fuente válida

El archivo `prisma/migrations/20261114165833/custom_constraints.sql` contiene estas restricciones. Se aplican manualmente después de la migración de Prisma:

```bash
docker compose exec postgres psql -U taply_user -d taply -f prisma/migrations/20261114165833/custom_constraints.sql
```

## Seed

El seed (`prisma/seed.ts`) crea 5 plantillas predeterminadas:

1. **Business Card** — Tarjeta de presentación digital
2. **Restaurant Menu** — Menú digital para restaurantes
3. **Event Landing** — Landing page para eventos
4. **Portfolio** — Portafolio personal
5. **Product Showcase** — Showcase de productos

El seed es idempotente: se puede ejecutar múltiples veces sin duplicar datos.

## Relación Page ↔ PageVersion

La relación entre Page y PageVersion es especial:

- `Page.publishedVersionId` → referencia opcional a un PageVersion específico (la versión publicada)
- `Page.versions` → lista de todas las versiones de la página
- `PageVersion.page` → referencia a la página padre
- `PageVersion.pageAsPublishedPage` → referencia inversa cuando esta versión es la publicada

`publishedVersionId` tiene `@unique` para garantizar que solo una página puede publicar una versión específica.

## Notas importantes

- **No usar `prisma db push`** en entornos compartidos o producción
- **No usar `prisma migrate dev` en producción** — usar `prisma migrate deploy`
- Las migraciones están versionadas en `prisma/migrations/`
- El seed no crea credenciales de usuario en producción
