# Configuración Local — Taply

## Requisitos

- **Docker Desktop**: Instalado y en ejecución.
- **Node.js**: Versión 24 o superior (si quieres ejecutar comandos fuera de Docker).
- **Git**: Para clonar el repositorio.

## Clonar el repositorio

```bash
git clone https://github.com/JOSEHPGAMEPLAY/taply.git
cd taply
```

## Instalar dependencias

Cada app tiene sus propias dependencias:

```bash
# API
cd apps/api && npm install

# Web
cd apps/web && npm install
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
| `cd apps/api && npm run dev` | Iniciar API en modo desarrollo |
| `cd apps/web && npm run dev` | Iniciar Web en modo desarrollo |
| `cd apps/api && npm run build` | Compilar API |
| `cd apps/web && npm run build` | Compilar Web |
| `cd apps/api && npm run lint` | Ejecutar ESLint en API |
| `cd apps/api && npm run test` | Ejecutar pruebas del API |
| `npm run docker:up` | Levantar contenedores Docker |
| `npm run docker:down` | Detener contenedores Docker |
| `npm run docker:logs` | Ver logs de contenedores |
| `npm run docker:build` | Reconstruir imágenes Docker |
| `cd apps/api && npx prisma generate` | Generar Prisma Client |
| `cd apps/api && npx prisma validate` | Validar esquema Prisma |
| `cd apps/api && npx prisma migrate dev` | Ejecutar migraciones |
| `cd apps/api && npx tsx prisma/seed.ts` | Ejecutar seed de datos |
| `cd apps/api && npx prisma studio` | Abrir Prisma Studio |

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
