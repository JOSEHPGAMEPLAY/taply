# Diagrama Entidad-Relación — Taply

## Diagrama Mermaid

```mermaid
erDiagram
    User ||--o{ AuthSession : has
    User ||--o{ AuthToken : has
    User ||--o{ Business : owns
    User ||--o{ AuditLog : performs

    Business ||--o{ Page : has
    Business ||--o{ NfcTag : has
    Business ||--o{ Order : has
    Business ||--o{ Subscription : has
    Business ||--o{ BusinessEntitlement : has

    Template ||--o{ Page : used-by

    Page ||--o{ PageVersion : has
    Page }o--|| PageVersion : "published version"
    Page ||--o{ TagAssignment : assigned-to
    Page ||--o{ AnalyticsEvent : tracked-in
    Page ||--o{ QrCode : has-qr

    NfcTag ||--o{ TagAssignment : assigned

    Order ||--o{ OrderItem : contains
    Order ||--o{ Payment : has

    BillingProduct ||--o{ OrderItem : referenced-in
    BillingProduct ||--o{ Subscription : referenced-in

    Order }o--|| BusinessEntitlement : "source of"
    Subscription }o--|| BusinessEntitlement : "source of"

    User {
        uuid id PK
        string email UK
        string passwordHash
        string name
        UserRole role
        datetime emailVerifiedAt
        datetime createdAt
        datetime updatedAt
    }

    AuthSession {
        uuid id PK
        uuid userId FK
        string sessionToken UK
        datetime expiresAt
        datetime createdAt
    }

    AuthToken {
        uuid id PK
        uuid userId FK
        string tokenHash UK
        string type
        datetime expiresAt
        datetime createdAt
    }

    Business {
        uuid id PK
        uuid ownerId FK
        string name
        string slug UK
        string description
        BusinessStatus status
        datetime createdAt
        datetime updatedAt
    }

    Template {
        uuid id PK
        string name
        string description
        json config
        string version
        datetime createdAt
        datetime updatedAt
    }

    Page {
        uuid id PK
        uuid businessId FK
        uuid templateId FK
        string slug UK
        PageStatus status
        uuid publishedVersionId UK
        datetime createdAt
        datetime updatedAt
    }

    PageVersion {
        uuid id PK
        uuid pageId FK
        PageVersionStatus status
        json config
        json buttons
        datetime createdAt
        datetime updatedAt
    }

    NfcTag {
        uuid id PK
        uuid businessId FK
        string token UK
        NfcTagStatus status
        string programmedUrl
        datetime programmedAt
        datetime verifiedAt
        datetime createdAt
        datetime updatedAt
    }

    TagAssignment {
        uuid id PK
        uuid tagId FK
        uuid pageId FK
        datetime startedAt
        datetime endedAt
        datetime createdAt
    }

    AnalyticsEvent {
        uuid id PK
        uuid pageId FK
        uuid tagId FK
        AnalyticsEventType type
        string buttonKey
        json metadata
        datetime createdAt
    }

    QrCode {
        uuid id PK
        uuid pageId FK
        string dataUrl
        datetime createdAt
    }

    BillingProduct {
        uuid id PK
        string name
        string description
        string type
        decimal price
        string currency
        string interval
        datetime createdAt
        datetime updatedAt
    }

    Order {
        uuid id PK
        uuid businessId FK
        string number UK
        OrderStatus status
        decimal subtotal
        decimal total
        string currency
        datetime createdAt
        datetime updatedAt
    }

    OrderItem {
        uuid id PK
        uuid orderId FK
        uuid productId FK
        int quantity
        decimal unitPrice
        decimal total
    }

    Payment {
        uuid id PK
        uuid orderId FK
        PaymentStatus status
        decimal amount
        string currency
        string provider
        string providerReference
        string eventId UK
        datetime createdAt
        datetime updatedAt
    }

    Subscription {
        uuid id PK
        uuid businessId FK
        uuid productId FK
        SubscriptionStatus status
        datetime startedAt
        datetime endsAt
        datetime nextBillingAt
        datetime createdAt
        datetime updatedAt
    }

    BusinessEntitlement {
        uuid id PK
        uuid businessId FK
        string feature
        string source
        uuid sourceId FK
        EntitlementStatus status
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
    }

    AuditLog {
        uuid id PK
        uuid actorId FK
        string entity
        string entityId
        AuditAction action
        json details
        datetime createdAt
    }
```

## Relaciones clave

| Relación | Cardinalidad | Descripción |
|---|---|---|
| User → Business | 1:N | Un usuario puede tener múltiples negocios. |
| Business → Page | 1:N | Un negocio puede tener múltiples páginas. |
| Page → PageVersion | 1:N | Una página tiene múltiples versiones; una es la publicada. |
| Page ↔ PageVersion | N:1 (published) | La página referencia una versión publicada específica. |
| NfcTag → TagAssignment | 1:N | Una etiqueta puede tener múltiples asignaciones a lo largo del tiempo. |
| Page → TagAssignment | 1:N | Una página puede ser asignada a múltiples etiquetas. |
| Order → OrderItem | 1:N | Una orden contiene múltiples items. |
| Order → Payment | 1:N | Una orden puede tener múltiples pagos. |
| Business → BusinessEntitlement | 1:N | Un negocio tiene múltiples derechos de uso. |
| Order/Subscription → BusinessEntitlement | 1:N | Una orden o suscripción genera derechos de uso. |

## Restricciones especiales

1. **Una sola versión publicada por página**: `publishedVersionId` es único en Page.
2. **Una sola asignación activa por etiqueta**: Índice parcial único sobre TagAssignment donde `endedAt IS NULL`.
3. **Importes no negativos**: CHECK constraints en Payment.amount, Order.total, BillingProduct.price.
4. **Cantidades positivas**: CHECK constraint en OrderItem.quantity > 0.
5. **Eventos de pago únicos**: `eventId` es único en Payment para evitar duplicados.
