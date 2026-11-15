# Decisiones Técnicas — Taply

## Decisiones clave y su rationale

### 1. Monolito modular en lugar de microservicios

**Decisión**: Un solo proceso NestJS con módulos bien delimitados.

**Rationale**:
- Taply es un producto en fase temprana; la complejidad de microservicios no se justifica.
- Un monolito modular permite compartir código (Prisma, DTOs, utilidades) sin duplicación.
- Se puede escalar verticalmente antes de necesitar horizontalmente.
- Si un módulo crece demasiado, se puede extraer a un microservicio en el futuro.

### 2. Monorepo con pnpm workspace

**Decisión**: Frontend y backend en un solo repositorio con pnpm workspaces.

**Rationale**:
- Frontend y backend comparten configuración (TypeScript, ESLint) y tipos.
- Los cambios en la API y el frontend se coordinan en el mismo commit.
- pnpm es más rápido y eficiente en disco que npm o yarn.
- Docker Compose puede construir ambos servicios desde el mismo contexto.

### 3. Prisma como ORM

**Decisión**: Prisma en lugar de TypeORM, Sequelize o raw SQL.

**Rationale**:
- Tipado fuerte: Prisma genera tipos TypeScript automáticamente desde el esquema.
- Migraciones versionadas: `prisma migrate dev` crea migraciones SQL reproducibles.
- IDE-friendly: autocompletado y detección de errores en tiempo de desarrollo.
- Soporte nativo para PostgreSQL, UUID, JSON y enums.

### 4. Docker-first desde el día uno

**Decisión**: Todo se ejecuta en contenedores Docker, incluyendo el desarrollo local.

**Rationale**:
- Entorno reproducible: cualquier desarrollador puede levantar el proyecto con un comando.
- Sin dependencias del host: no se necesita instalar Node.js, PostgreSQL o pnpm localmente.
- Preparado para producción: la misma configuración se usa en desarrollo y despliegue.
- Healthchecks integrados: Docker puede verificar la salud de los servicios.

### 5. UUID para todas las entidades

**Decisión**: Todos los IDs son UUID (string en Prisma) en lugar de auto-incremental.

**Rationale**:
- Distribución uniforme: los UUID no revelan el número de registros ni el orden de creación.
- Mejor para sistemas distribuidos: si en el futuro se particiona la base de datos, los UUID no colisionan.
- Seguridad: un atacante no puede adivinar IDs secuenciales.

### 6. JWT para autenticación

**Decisión**: JSON Web Tokens con access token (15 min) y refresh token (7 días).

**Rationale**:
- Stateless: el servidor no necesita almacenar sesiones en memoria.
- Escalable: cualquier instancia del backend puede validar un token sin consultar la base de datos.
- Refresh tokens: el access token es corto para minimizar el riesgo si se filtra; el refresh token permite obtener nuevos tokens sin re-autenticar.
- bcrypt para contraseñas: hash lento y seguro con salt automático.

### 7. Next.js standalone output para Docker

**Decisión**: `output: 'standalone'` en `next.config.ts` para optimizar la imagen Docker.

**Rationale**:
- La imagen final contiene solo los archivos necesarios para ejecutar la app, no todo el `node_modules`.
- Reduce el tamaño de la imagen de ~1GB a ~150MB.
- Next.js genera automáticamente un subconjunto de `node_modules` en `.next/standalone`.

### 8. Separación de variables de entorno

**Decisión**: Diferenciar variables del contenedor, del navegador (`NEXT_PUBLIC_*`) y del build.

**Rationale**:
- Seguridad: las variables `NEXT_PUBLIC_*` se exponen al navegador; nunca deben contener secretos.
- `DATABASE_URL` usa `postgres` como host (nombre del servicio Docker), no `localhost`.
- `.env.example` documenta todas las variables sin valores reales.

### 9. Swagger/OpenAPI para documentación API

**Decisión**: `@nestjs/swagger` para generar documentación interactiva.

**Rationale**:
- Documentación automática: los decoradores en el código generan la documentación.
- UI interactiva: los desarrolladores pueden probar los endpoints directamente desde el navegador.
- Contrato claro: el frontend sabe exactamente qué esperar de cada endpoint.

### 10. SOLID y Clean Code como estándar

**Decisión**: Cada módulo sigue los principios SOLID y Clean Code.

**Rationale**:
- **Single Responsibility**: Cada clase tiene una sola razón para cambiar.
- **Open/Closed**: Los módulos están abiertos para extensión pero cerrados para modificación.
- **Dependency Inversion**: Los servicios dependen de abstracciones (PrismaClient vía inyección), no de implementaciones concretas.
- **Clean Code**: Nombres descriptivos, funciones cortas, comentarios en español que explican el "por qué", no el "qué".

### 11. Prisma migrate deploy en producción

**Decisión**: `prisma migrate deploy` en producción, `prisma migrate dev` en desarrollo.

**Rationale**:
- `migrate dev` pide confirmación y crea migraciones; no es seguro para producción.
- `migrate deploy` aplica las migraciones existentes de forma automática y segura.
- Las migraciones están versionadas y pueden revertirse si es necesario.

### 12. Seed idempotente

**Decisión**: El script de seed verifica si los datos existen antes de insertar.

**Rationale**:
- Se puede ejecutar múltiples veces sin duplicar datos.
- Útil para entornos de prueba y desarrollo donde la base de datos se reconstruye frecuentemente.
- No incluye credenciales de usuario en producción.
