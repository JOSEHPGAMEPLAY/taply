# Configuración Local — Taply

## Requisitos

- **Docker Desktop**: Instalado y en ejecución.
- **pnpm**: `npm install -g pnpm` (si quieres ejecutar comandos fuera de Docker).
- **Git**: Para clonar el repositorio.

## Clonar el repositorio

```bash
git clone https://github.com/JOSEHPGAMEPLAY/taply.git
cd taply
```

## Instalar dependencias

```bash
pnpm install
```

## Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores. Las variables más importantes:

- `POSTGRES_PASSWORD`: Contraseña de PostgreSQL (cámbiala en producción).
- `JWT_SECRET`: Secreto para firmar tokens JWT (usa un valor aleatorio largo).
- `REFRESH_SECRET`: Secreto para firmar refresh tokens.

## Levantar el entorno

```bash
docker compose up --build -d
```

Esto levanta 3 servicios:

- **postgres**: PostgreSQL 16 en `localhost:5432`.
- **api**: Backend NestJS en `localhost:3001`.
- **web**: Frontend Next.js en `localhost:3000`.

## Verificar que todo funciona

```bash
# Health checks
curl http://localhost:3001/api/v1/health
curl http://localhost:3001/api/v1/health/ready

# Swagger UI
# Abre http://localhost:3001/api/v1/docs en el navegador
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Iniciar frontend y backend en modo desarrollo |
| `pnpm build` | Compilar frontend y backend |
| `pnpm lint` | Ejecutar ESLint |
| `pnpm test` | Ejecutar pruebas |
| `pnpm docker:up` | Levantar contenedores Docker |
| `pnpm docker:down` | Detener contenedores Docker |
| `pnpm docker:logs` | Ver logs de contenedores |
| `pnpm docker:build` | Reconstruir imágenes Docker |
| `pnpm db:generate` | Generar Prisma Client |
| `pnpm db:validate` | Validar esquema Prisma |
| `pnpm db:migrate` | Ejecutar migraciones |
| `pnpm db:seed` | Ejecutar seed de datos |
| `pnpm db:studio` | Abrir Prisma Studio |

## Detener el entorno

```bash
docker compose down
```

Para eliminar también los datos de PostgreSQL:

```bash
docker compose down -v
```

## Solución de problemas

- **Puerto ocupado**: Si el puerto 5432, 3000 o 3001 está ocupado, cambia el puerto en `docker-compose.yml`.
- **Prisma no conecta**: Verifica que `DATABASE_URL` en `.env` usa `postgres` como host (no `localhost`).
- **Imágenes desactualizadas**: Ejecuta `docker compose build --no-cache` para reconstruir desde cero.
