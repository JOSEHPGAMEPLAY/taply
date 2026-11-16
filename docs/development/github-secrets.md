# GitHub Secrets y Variables de Entorno

Este documento describe los secretos y variables que se deben configurar en **GitHub Settings > Secrets and variables > Actions**.

## 🔒 Secrets (Secretos)

Estos valores son sensibles y se encriptan en GitHub Actions.

| Secret | Descripción | Valor de ejemplo (cambiar en producción) |
|---|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:password@host:5432/taply?schema=public` |
| `JWT_SECRET` | Secret para firmar tokens JWT | Generar con `openssl rand -hex 32` |
| `REFRESH_SECRET` | Secret para firmar refresh tokens | Generar con `openssl rand -hex 32` |
| `NEXT_PUBLIC_API_URL` | URL pública de la API | `https://api.taply.app/api/v1` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | Contraseña segura aleatoria |

### Cómo configurar los secrets

1. Ve a **https://github.com/JOSEHPGAMEPLAY/taply/settings/secrets/actions**
2. Haz clic en **New repository secret**
3. Agrega cada secret con su valor
4. En producción, usa valores únicos y seguros

## 🔧 Variables (Variables)

Estos valores no son sensibles y se muestran en claro.

| Variable | Descripción | Valor |
|---|---|---|
| `NODE_VERSION` | Versión de Node.js | `20` |
| `PNPM_VERSION` | Versión de pnpm | `9.15.0` |
| `POSTGRES_DB` | Nombre de la base de datos | `taply` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `taply_user` |
| `API_PORT` | Puerto del backend | `3001` |
| `WEB_PORT` | Puerto del frontend | `3000` |

### Cómo configurar las variables

1. Ve a **https://github.com/JOSEHPGAMEPLAY/taply/settings/variables/actions**
2. Haz clic en **New repository variable**
3. Agrega cada variable con su valor

## 🚀 Variables de Entorno por Ambiente

### Desarrollo (Local)
Usa el archivo `.env` basado en `.env.example`.

### Producción (GitHub Actions)
Los secrets y variables se inyectan automáticamente en los workflows.

### Docker Compose
Las variables se leen del archivo `.env` o del entorno del sistema.

## ⚠️ Importante

- **Nunca** commitees valores reales de secrets en el repositorio
- En producción, genera nuevos `JWT_SECRET` y `REFRESH_SECRET` con `openssl rand -hex 32`
- La `DATABASE_URL` debe apuntar a una base de datos PostgreSQL real
- `NEXT_PUBLIC_API_URL` debe ser la URL pública donde estará desplegada la API
