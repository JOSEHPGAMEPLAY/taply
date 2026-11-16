# Security Policy

## Supported Versions

| Versión | Soporte |
|---|---|
| v0.x (actual) | ✅ Activo |

## Reportar una Vulnerabilidad

Si encuentras una vulnerabilidad de seguridad en Taply, por favor repórtala de forma responsable:

1. **No** abras un issue público en GitHub
2. Envía un correo a: **security@taply.app** (próximamente)
3. O contacta al desarrollador en: **JOSEHPGAMEPLAY** en GitHub

### Información requerida en el reporte

- Descripción de la vulnerabilidad
- Pasos para reproducirla
- Impacto potencial
- Posible solución (si la tienes)

### Tiempo de respuesta

- **Reconocimiento**: Dentro de 48 horas
- **Evaluación**: Dentro de 1 semana
- **Solución**: Dentro de 2-4 semanas según la gravedad

## Prácticas de Seguridad

### Autenticación
- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración corta (15 min)
- Refresh tokens almacenados como hashes
- Revocación de sesiones

### Autorización
- Verificación de ownership en cada endpoint
- Guards de autenticación en rutas protegidas
- Separación entre panel admin y panel de usuario

### Datos
- Validación de URLs externas (sin `javascript:`, `data:`, `file:`)
- HTTPS como protocolo predeterminado
- Retención de eventos de analíticas: 12 meses
- Sin almacenamiento de IPs completas innecesarias

### Infraestructura
- Contenedores Docker con usuario no-root
- Variables de entorno para secretos
- Sin secretos en el código fuente
- Dependencias revisadas con Dependency Review

## Dependencias Críticas

| Paquete | Propósito | Monitoreo |
|---|---|---|
| `@nestjs/jwt` | Autenticación JWT | GitHub Advisories |
| `bcrypt` | Hash de contraseñas | GitHub Advisories |
| `passport-jwt` | Estrategia JWT | GitHub Advisories |
| `next` | Framework frontend | GitHub Advisories |

## Compliance

- **Ley 1581 de 2012** (Colombia): Protección de datos personales
- **ARCO**: Derechos de Acceso, Rectificación, Cancelación y Oposición
- Política de privacidad en `docs/security/privacy.md`
