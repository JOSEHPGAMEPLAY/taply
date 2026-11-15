# Esquema de Base de Datos — Taply

## Modelos

El esquema completo se define en `prisma/schema.prisma` con 17 modelos y 11 enums. A continuación se describe cada modelo en detalle.

### User
Representa un usuario del sistema. Puede ser administrador o usuario regular.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| email | String | Email único, usado para login |
| passwordHash | String | Hash de contraseña con bcrypt |
| name | String | Nombre completo |
| role | UserRole | ADMIN o USER |
| emailVerifiedAt | DateTime? | Fecha de verificación del email |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### AuthSession
Sesión de autenticación activa del usuario.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| userId | UUID (FK) | Referencia a User |
| sessionToken | String | Token único de sesión |
| expiresAt | DateTime | Fecha de expiración |
| createdAt | DateTime | Fecha de creación |

### AuthToken
Token de autenticación (JWT refresh token).

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| userId | UUID (FK) | Referencia a User |
| tokenHash | String | Hash del token único |
| type | String | Tipo de token |
| expiresAt | DateTime | Fecha de expiración |
| createdAt | DateTime | Fecha de creación |

### Business
Negocio del usuario. Cada negocio tiene páginas, etiquetas y órdenes asociadas.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| ownerId | UUID (FK) | Propietario del negocio (User) |
| name | String | Nombre del negocio |
| slug | String | Slug único para URLs |
| description | String? | Descripción del negocio |
| status | BusinessStatus | Estado del negocio |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### Template
Plantilla predeterminada para páginas.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| name | String | Nombre de la plantilla |
| description | String? | Descripción |
| config | JSON | Configuración predeterminada |
| version | String | Versión de la plantilla |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### Page
Página digital de un negocio. Tiene versiones y una versión publicada.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| businessId | UUID (FK) | Negocio al que pertenece |
| templateId | UUID? (FK) | Plantilla usada |
| slug | String | Slug único para URLs públicas |
| status | PageStatus | Estado de la página |
| publishedVersionId | UUID? | ID de la versión publicada |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### PageVersion
Versión de una página. Cada página puede tener múltiples versiones.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| pageId | UUID (FK) | Página a la que pertenece |
| status | PageVersionStatus | DRAFT, PUBLISHED o SUPERSEDED |
| config | JSON | Configuración de la página |
| buttons | JSON | Botones de redirección |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### NfcTag
Etiqueta NFC física asociada a un negocio.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| businessId | UUID (FK) | Negocio al que pertenece |
| token | String | Token único de la etiqueta |
| status | NfcTagStatus | Estado de la etiqueta |
| programmedUrl | String? | URL programada |
| programmedAt | DateTime? | Fecha de programación |
| verifiedAt | DateTime? | Fecha de verificación |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### TagAssignment
Asignación de una etiqueta NFC a una página.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| tagId | UUID (FK) | Etiqueta asignada |
| pageId | UUID (FK) | Página asignada |
| startedAt | DateTime | Fecha de inicio |
| endedAt | DateTime? | Fecha de fin (null = activa) |
| createdAt | DateTime | Fecha de creación |

### AnalyticsEvent
Evento de analítica (visita, clic, escaneo).

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| pageId | UUID (FK) | Página donde ocurrió |
| tagId | UUID? (FK) | Etiqueta que lo generó (opcional) |
| type | AnalyticsEventType | PAGE_VIEW, BUTTON_CLICK, TAG_SCAN |
| buttonKey | String? | Clave del botón clickeado |
| metadata | JSON? | Metadatos adicionales |
| createdAt | DateTime | Fecha del evento |

### QrCode
Código QR generado para una página.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| pageId | UUID (FK) | Página asociada |
| dataUrl | String | Data URL del QR (SVG) |
| createdAt | DateTime | Fecha de generación |

### BillingProduct
Producto de facturación (pago único o suscripción).

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| name | String | Nombre del producto |
| description | String? | Descripción |
| type | String | ONE_TIME o SUBSCRIPTION |
| price | Decimal | Precio (≥ 0) |
| currency | String | Moneda (USD, COP, etc.) |
| interval | String? | Intervalo para recurrentes (month, year) |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### Order
Orden de compra.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| businessId | UUID (FK) | Negocio que compró |
| number | String | Número único de orden |
| status | OrderStatus | Estado de la orden |
| subtotal | Decimal | Subtotal |
| total | Decimal | Total (≥ 0) |
| currency | String | Moneda |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### OrderItem
Item dentro de una orden.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| orderId | UUID (FK) | Orden a la que pertenece |
| productId | UUID (FK) | Producto comprado |
| quantity | Int | Cantidad (> 0) |
| unitPrice | Decimal | Precio unitario |
| total | Decimal | Total del item |

### Payment
Pago asociado a una orden.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| orderId | UUID (FK) | Orden pagada |
| status | PaymentStatus | Estado del pago |
| amount | Decimal | Monto (≥ 0) |
| currency | String | Moneda |
| provider | String | Proveedor (Stripe, etc.) |
| providerReference | String? | Referencia del proveedor |
| eventId | String? | ID único del evento de pago |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### Subscription
Suscripción recurrente de un negocio.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| businessId | UUID (FK) | Negocio suscrito |
| productId | UUID (FK) | Producto suscrito |
| status | SubscriptionStatus | Estado de la suscripción |
| startedAt | DateTime? | Fecha de inicio |
| endsAt | DateTime? | Fecha de fin |
| nextBillingAt | DateTime? | Próximo cobro |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### BusinessEntitlement
Derecho de uso de una funcionalidad para un negocio.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| businessId | UUID (FK) | Negocio beneficiario |
| feature | String | Funcionalidad (ej: "nfc_tags") |
| source | String | Fuente: ORDER o SUBSCRIPTION |
| sourceId | UUID? | ID de la orden o suscripción |
| status | EntitlementStatus | Estado del derecho |
| expiresAt | DateTime? | Fecha de expiración |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

### AuditLog
Registro de auditoría de operaciones críticas.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| actorId | UUID? (FK) | Usuario que realizó la acción |
| entity | String | Entidad afectada (User, Business, Page, etc.) |
| entityId | String | ID de la entidad afectada |
| action | AuditAction | Acción realizada |
| details | JSON? | Detalles adicionales |
| createdAt | DateTime | Fecha de la acción |

## Enums

| Enum | Valores |
|---|---|
| UserRole | ADMIN, USER |
| BusinessStatus | PROSPECT, ACTIVE, PAUSED, SUSPENDED, CLOSED |
| PageStatus | DRAFT, PUBLISHED, PAUSED, ARCHIVED |
| PageVersionStatus | DRAFT, PUBLISHED, SUPERSEDED |
| NfcTagStatus | INVENTORY, PENDING_PROGRAMMING, PROGRAMMED, ACTIVE, INACTIVE, LOST, DAMAGED |
| OrderStatus | DRAFT, PENDING_PAYMENT, PAID, PARTIALLY_REFUNDED, REFUNDED, CANCELLED |
| PaymentStatus | PENDING, APPROVED, DECLINED, REFUNDED, PARTIALLY_REFUNDED |
| SubscriptionStatus | PENDING, ACTIVE, PAST_DUE, PAUSED, CANCELLED, EXPIRED |
| EntitlementStatus | ACTIVE, SUSPENDED, REVOKED, EXPIRED |
| AnalyticsEventType | PAGE_VIEW, BUTTON_CLICK, TAG_SCAN |
| AuditAction | CREATE, UPDATE, DELETE, PUBLISH, UNPUBLISH, ASSIGN, UNASSIGN, LOGIN, LOGOUT, PAYMENT, SUBSCRIPTION |
