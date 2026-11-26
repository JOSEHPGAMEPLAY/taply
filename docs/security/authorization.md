# Autorización — Taply

## Modelo de acceso

Cada recurso operativo pertenece a un negocio. El propietario se mantiene en `Business.ownerId`; los accesos delegados se guardan en `BusinessMembership` y se consultan desde la base de datos en cada solicitud. El backend valida tanto la identidad autenticada como la empresa a la que pertenece el recurso; no confía únicamente en `businessId` o `pageId` enviados por el cliente.

Las cuentas de membresía son cuentas ya registradas. Una cuenta puede tener como máximo una membresía de negocio. El propietario y el administrador global no necesitan una membresía para acceder.

## Roles

`User.role` es global y distinto del rol de negocio.

| Rol global | Alcance |
|---|---|
| `USER` | Acceso a los negocios que posee o donde tiene una membresía activa. |
| `ADMIN` | Administrador global de Taply; acceso a todos los negocios, usuarios y plantillas. |

`BusinessMembership.role` controla el acceso delegado a un negocio. `OWNER` se deriva de `Business.ownerId` y no se asigna como membresía.

| Rol de negocio | Permisos |
|---|---|
| `OWNER` | Acceso completo; único rol de negocio que administra miembros y elimina el negocio. |
| `ADMIN` | Gestiona datos del negocio, páginas, publicación, etiquetas NFC/QR y analíticas; no administra miembros. |
| `EDITOR` | Crea y edita páginas y botones, cambia plantillas y publica; no gestiona negocio, etiquetas ni analíticas. |
| `ANALYST` | Consulta páginas y analíticas, sin cambios. |
| `VIEWER` | Consulta páginas y etiquetas NFC, sin cambios ni acceso a analíticas. |

El `ADMIN` global puede realizar todas las operaciones anteriores. Solo el `OWNER` o un `ADMIN` global puede agregar, cambiar el rol o retirar miembros. Las plantillas son un catálogo global: los usuarios autenticados pueden consultarlo, pero solo el `ADMIN` global puede modificarlo.

## Multi-tenancy

Taply es una aplicación multi-tenant por diseño. Cada negocio es un tenant independiente:

- **Aislamiento de datos**: las operaciones filtran por `businessId` y comprueban ownership o membresía; usuarios sin acceso reciben `403 Forbidden`.
- **Slugs únicos**: Los slugs de negocios y páginas son únicos a nivel global para evitar colisiones en URLs públicas.
- **Tokens NFC únicos**: Los tokens de etiquetas NFC son únicos a nivel global para evitar colisiones en la resolución pública.

## Aislamiento entre negocios

- Un usuario regular puede acceder a negocios que posee y, como máximo, a un negocio asignado como miembro; cada membresía queda limitada a su empresa.
- Las páginas, etiquetas NFC, órdenes y suscripciones están vinculadas a un negocio específico.
- Las analíticas solo muestran los eventos de las páginas del negocio del usuario autenticado.
- Los endpoints públicos (`/public/nfc/:token`, `/public/analytics/events`) no requieren autenticación, pero no exponen datos sensibles.
