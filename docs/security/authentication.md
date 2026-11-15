# Autenticación — Taply

## Flujo JWT

Taply usa JSON Web Tokens (JWT) para autenticación stateless. El flujo es:

1. **Registro**: El usuario envía email, contraseña y nombre → el backend hashea la contraseña con bcrypt → crea el usuario → genera access token y refresh token → retorna ambos tokens.

2. **Login**: El usuario envía email y contraseña → el backend verifica el hash con bcrypt → genera access token y refresh token → retorna ambos tokens.

3. **Acceso protegido**: El frontend incluye el access token en el header `Authorization: Bearer <token>` → el backend valida el token con JwtStrategy → si es válido, permite el acceso.

4. **Refresco**: Cuando el access token expira (15 minutos), el frontend envía el refresh token → el backend verifica que el refresh token es válido y no expirado (7 días) → genera un nuevo par de tokens.

## Tokens

| Token | Duración | Propósito |
|---|---|---|
| Access Token | 15 minutos | Acceso a endpoints protegidos |
| Refresh Token | 7 días | Obtener nuevos access tokens |

## bcrypt

Las contraseñas se hashean con bcrypt antes de almacenarse en la base de datos. El hash incluye un salt automático, por lo que dos contraseñas iguales producen hashes diferentes.

- **Cost factor**: 10 (equilibrio entre seguridad y rendimiento).
- **Verificación**: `bcrypt.compare()` compara la contraseña plana con el hash almacenado.

## Guards y Strategies

### JwtAuthGuard
Protege las rutas que requieren autenticación. Si el token es inválido o falta, retorna `401 Unauthorized`.

### JwtStrategy
Valida el access token JWT. Extrae el token del header `Authorization`, verifica la firma con `JWT_SECRET` y retorna el payload (userId, email, role).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Secreto para firmar los access tokens |
| `JWT_EXPIRATION` | Duración del access token (ej: "15m") |
| `REFRESH_SECRET` | Secreto para firmar los refresh tokens |
| `REFRESH_EXPIRATION` | Duración del refresh token (ej: "7d") |

## Seguridad

- Los tokens nunca se almacenan en la base de datos (excepto el hash del refresh token en AuthToken).
- Los secretos JWT no se exponen en variables `NEXT_PUBLIC_*`.
- Si se filtra un secreto, se debe rotar inmediatamente y invalidar todos los tokens existentes.
