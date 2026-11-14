# Troubleshooting Docker

## Los contenedores no inician

### Verificar el estado

```bash
docker compose ps
docker compose logs
```

### Puerto en uso

Si el puerto 3000, 3001 o 5432 ya está en uso:

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Detener el proceso que ocupa el puerto
taskkill /PID <PID> /F
```

### Reconstruir las imágenes

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## PostgreSQL no responde

### Verificar el healthcheck

```bash
docker compose logs postgres
```

### Conectar manualmente

```bash
docker compose exec postgres psql -U taply_user -d taply
```

### Reiniciar PostgreSQL

```bash
docker compose restart postgres
```

## El API no se conecta a la base de datos

### Verificar la conexión

Asegúrate de que `DATABASE_URL` usa `postgres` como host (nombre del servicio Docker), no `localhost`:

```env
DATABASE_URL=postgresql://taply_user:change_me@postgres:5432/taply?schema=public
```

### Verificar los logs

```bash
docker compose logs api
```

## El frontend no carga

### Verificar NEXT_PUBLIC_API_URL

En desarrollo, el frontend se comunica con el backend a través de `localhost`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Limpiar el caché de Next.js

```bash
docker compose down
docker compose build --no-cache web
docker compose up -d web
```

## Los datos de PostgreSQL se pierden

### Verificar el volumen

```bash
docker volume ls | grep taply_postgres_data
```

### Si el volumen no existe

Los datos se perdieron. Para restaurar desde un backup:

```bash
docker compose exec -T postgres psql -U taply_user -d taply < backup.sql
```

## Errores de permisos

### Verificar que no se ejecuta como root

```bash
docker compose exec api whoami
docker compose exec web whoami
```

Debería mostrar `nodejs`, no `root`.

## Imágenes muy grandes

### Limpiar imágenes no usadas

```bash
docker image prune -a
```

### Ver el tamaño de las imágenes

```bash
docker image ls | grep taply
```

## Reconstruir desde cero

```bash
# Detener todo
docker compose down -v

# Limpiar imágenes
docker image prune -a

# Reconstruir y levantar
docker compose up --build -d
```
