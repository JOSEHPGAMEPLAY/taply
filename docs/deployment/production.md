# Despliegue en Producción — Taply

## Build

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```

Esto construye las imágenes optimizadas sin herramientas de desarrollo.

## Migraciones

En producción se usa `prisma migrate deploy` (no `migrate dev`):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm api npx prisma migrate deploy
```

## Variables de entorno

En producción:

- `POSTGRES_PASSWORD`: Usa una contraseña fuerte y aleatoria.
- `JWT_SECRET`: Usa un valor aleatorio de al menos 32 caracteres.
- `REFRESH_SECRET`: Usa un valor aleatorio de al menos 32 caracteres.
- `NODE_ENV=production`.

Nunca uses los valores de `.env.example` en producción.

## Despliegue

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

El override `docker-compose.prod.yml`:

- No expone PostgreSQL al exterior.
- No monta volúmenes de código (imágenes optimizadas).
- Usa `restart: unless-stopped` para alta disponibilidad.

## Backups

### Backup manual

```bash
docker exec taply-postgres pg_dump -U taply_user taply > backup-$(date +%Y%m%d).sql
```

### Restaurar

```bash
docker exec -i taply-postgres psql -U taply_user taply < backup-20250101.sql
```

### Backup automático

Configura un cron job o GitHub Action que ejecute el backup diario y lo almacene en un servicio de almacenamiento en la nube (S3, GCS, etc.).

## Monitoreo

- **Healthchecks**: Docker verifica la salud de los servicios cada 30 segundos.
- **Logs**: `docker compose logs -f` para ver los logs en tiempo real.
- **Endpoints de salud**: `GET /api/v1/health` y `GET /api/v1/health/ready` para monitoreo externo.

## Escalabilidad

- **Vertical**: Aumenta los recursos (CPU, RAM) del servidor.
- **Horizontal**: En el futuro, se pueden agregar múltiples instancias del backend detrás de un load balancer. PostgreSQL se mantiene como un solo nodo.
