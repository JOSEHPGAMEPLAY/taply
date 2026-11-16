# Desarrollo Local con Docker

## Requisitos

- Docker Desktop instalado y en ejecución
- Node.js 24+ (opcional, para desarrollo fuera de Docker)

## Iniciar el entorno

```bash
# Construir y levantar todos los servicios
docker compose up --build -d

# Ver el estado de los servicios
docker compose ps

# Ver los logs en tiempo real
docker compose logs -f
```

## Servicios disponibles

| Servicio | URL | Puerto |
|----------|-----|--------|
| Frontend (Next.js) | http://localhost:3000 | 3000 |
| Backend (NestJS) | http://localhost:3001 | 3001 |
| PostgreSQL | localhost | 5432 |

## Hot Reload

Los cambios en el código fuente se reflejan automáticamente:

- **Frontend**: Los cambios en `apps/web/src/` activan hot reload de Next.js.
- **Backend**: Los cambios en `apps/api/src/` reinician NestJS automáticamente.

## Base de datos

### Conectar desde una herramienta externa

Puedes conectar PostgreSQL desde DBeaver, pgAdmin o cualquier cliente:

- **Host**: localhost
- **Puerto**: 5432
- **Base de datos**: taply
- **Usuario**: taply_user
- **Contraseña**: change_me

### Ejecutar migraciones Prisma

```bash
# Desde el contenedor del API
docker compose exec api npx prisma migrate dev

# Abrir Prisma Studio
docker compose exec api npx prisma studio
```

## Scripts útiles

```bash
# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (borra los datos)
docker compose down -v

# Reconstruir las imágenes
docker compose build

# Ver logs de un servicio específico
docker compose logs -f api
docker compose logs -f web
docker compose logs -f postgres
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

Las variables se leen automáticamente desde `.env` al ejecutar `docker compose`.

## Limpiar y reiniciar

```bash
# Detener todo y eliminar volúmenes
docker compose down -v

# Reconstruir desde cero
docker compose up --build -d
```
