# Autorización — Taply

## Verificación de ownership

Taply usa un modelo de autorización basado en ownership. Cada recurso pertenece a un negocio, y cada negocio pertenece a un usuario. Solo el owner del negocio puede modificar sus recursos.

### Flujo de verificación

1. El usuario autenticado envía una request a un endpoint protegido.
2. El backend extrae el `userId` del token JWT.
3. El backend verifica que el `userId` coincide con el `ownerId` del negocio asociado al recurso.
4. Si coincide, permite la operación. Si no, retorna `403 Forbidden`.

### Ejemplo

```typescript
// En BusinessesService
const business = await this.prisma.business.findUnique({ where: { id } });
if (!business) throw new NotFoundException('Negocio no encontrado');
if (business.ownerId !== userId) throw new ForbiddenException('No tienes permiso');
```

## Roles

| Rol | Descripción |
|---|---|
| USER | Usuario regular, puede gestionar sus propios negocios. |
| ADMIN | Administrador de Taply (reservado para futuro uso). |

Actualmente solo existe el rol USER. El rol ADMIN se implementará cuando se necesite un panel administrativo de super-admins.

## Multi-tenancy

Taply es una aplicación multi-tenant por diseño. Cada negocio es un tenant independiente:

- **Aislamiento de datos**: Las consultas siempre filtran por `businessId` o `ownerId`. Un usuario nunca puede ver los datos de otro negocio.
- **Slugs únicos**: Los slugs de negocios y páginas son únicos a nivel global para evitar colisiones en URLs públicas.
- **Tokens NFC únicos**: Los tokens de etiquetas NFC son únicos a nivel global para evitar colisiones en la resolución pública.

## Aislamiento entre negocios

- Un usuario puede tener múltiples negocios, pero solo puede acceder a los suyos.
- Las páginas, etiquetas NFC, órdenes y suscripciones están vinculadas a un negocio específico.
- Las analíticas solo muestran los eventos de las páginas del negocio del usuario autenticado.
- Los endpoints públicos (`/public/nfc/:token`, `/public/analytics/events`) no requieren autenticación, pero no exponen datos sensibles.
