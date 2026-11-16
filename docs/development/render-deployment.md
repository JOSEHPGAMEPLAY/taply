# Despliegue en Render

Esta guía explica cómo desplegar el backend de Taply (NestJS) en Render.com como un Web Service.

## Configuración del Web Service

### 1. Crear el servicio

1. Ve a [render.com/dashboard](https://dashboard.render.com/)
2. Haz clic en **New +** → **Web Service**
3. Conecta el repositorio `JOSEHPGAMEPLAY/taply`

### 2. Configurar el servicio

| Campo | Valor |
|---|---|
| **Name** | `taply-api` |
| **Branch** | `main` |
| **Root Directory** | `apps/api` |
| **Environment** | `Docker` |
| **DockerfilePath** | `Dockerfile` (se detecta automáticamente) |
| **Build Command** | Déjalo vacío (Render usa el Dockerfile) |
| **Start Command** | Déjalo vacío (Render usa el Dockerfile) |
| **Type** | Free (gratuito) |

### 3. Variables de entorno

Ve a **Settings** → **Environment Variables** y agrega:

| Variable | Valor | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Tu connection string de Prisma Postgres (Neon) |
| `JWT_SECRET` | `(genera uno)` | Secreto para tokens JWT: `openssl rand -hex 32` |
| `REFRESH_SECRET` | `(genera otro)` | Secreto para tokens de refresco |
| `CORS_ORIGIN` | `*` | Origen permitido para CORS |

#### Cómo obtener la DATABASE_URL

1. Ve a [prisma.io/data](https://prisma.io/data)
2. Haz clic en tu base de datos
3. Copia el **Connection string** (Direct)

### 4. Desplegar

1. Haz clic en **Create Web Service**
2. Render clonará el repo, construirá la imagen Docker y desplegará
3. Espera ~3-5 minutos

### 5. Verificar

Después del deploy, verifica:

- **Health check**: `https://taply-api.onrender.com/api/v1/health`
- **Swagger docs**: `https://taply-api.onrender.com/api/v1/docs`

### 6. Configurar el frontend

En Vercel (taply-co), ve a **Settings** → **Environment Variables** y agrega:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://taply-api.onrender.com/api/v1` |

El frontend detectará automáticamente la URL del backend en producción.

## Logs

Para ver los logs del backend:

1. Ve a tu servicio en Render
2. Haz clic en **Logs** en la barra lateral
3. Verás los logs en tiempo real

## Troubleshooting

### Error: "Cannot find module '@nestjs/core'"

Este error ocurría cuando los `package-lock.json` no estaban versionados. Se solucionó agregando los lock files al repositorio.

### Error: "P1001: Can't reach database server"

Verifica que la variable `DATABASE_URL` esté configurada correctamente en Render.

### El servicio duerme después de 15 minutos

El plan gratuito de Render duerme el servicio después de 15 minutos de inactividad. La primera request después de dormir tarda ~30 segundos en responder. Para evitarlo, puedes:

- Usar un servicio como [cron-job.org](https://cron-job.org/) para hacer ping cada 14 minutos
- Actualizar al plan Starter ($7/mes) para mantener el servicio siempre activo

## Migración desde Vercel

Si tenías el backend en Vercel (`taply-back.vercel.app`), puedes eliminarlo después de verificar que Render funciona correctamente.
