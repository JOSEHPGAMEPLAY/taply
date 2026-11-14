# Despliegue en Producción

## Construir las imágenes

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```

## Levantar los servicios

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Diferencias con desarrollo

| Característica | Desarrollo | Producción |
|----------------|-----------|------------|
| PostgreSQL expuesto | Sí (puerto 5432) | No |
| Volúmenes de código | Sí (hot reload) | No |
| Imágenes | Multi-stage | Multi-stage optimizado |
| Reinicio | unless-stopped | unless-stopped |

## Variables de entorno

Configura un `.env` de producción con valores seguros:

```env
NODE_ENV=production
POSTGRES_PASSWORD=<contraseña_segura>
DATABASE_URL=postgresql://taply_user:<contraseña_segura>@postgres:5432/taply?schema=public
```

**No uses las contraseñas de ejemplo en producción.**

## Ejecutar migraciones

En producción, usa siempre `prisma migrate deploy`:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

**No uses `prisma migrate dev` en producción.**

## Backups de PostgreSQL

```bash
# Realizar backup
docker compose exec postgres pg_dump -U taply_user taply > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres psql -U taply_user -d taply < backup_20240101.sql
```

## Escalado

Para escalar el número de instancias del frontend:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale web=3
```

## Logs

```bash
# Ver todos los logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Ver logs de un servicio
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f api
```
