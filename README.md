<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
</div>

<br />

<div align="center">
  <h1>📱 Taply</h1>
  <p><strong>Plataforma SaaS para crear páginas digitales accesibles con un solo toque</strong></p>
  <p>Crea páginas personalizadas con botones de redirección, accesibles mediante etiquetas NFC y códigos QR.</p>
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/github/stars/JOSEHPGAMEPLAY/taply?style=flat-square" alt="Stars" />
  <img src="https://img.shields.io/github/forks/JOSEHPGAMEPLAY/taply?style=flat-square" alt="Forks" />
  <img src="https://img.shields.io/github/issues/JOSEHPGAMEPLAY/taply?style=flat-square" alt="Issues" />
  <img src="https://img.shields.io/github/license/JOSEHPGAMEPLAY/taply?style=flat-square" alt="License" />
  <img src="https://img.shields.io/github/last-commit/JOSEHPGAMEPLAY/taply?style=flat-square" alt="Last Commit" />
  <img src="https://img.shields.io/github/repo-size/JOSEHPGAMEPLAY/taply?style=flat-square" alt="Repo Size" />
  <img src="https://img.shields.io/github/languages/top/JOSEHPGAMEPLAY/taply?style=flat-square" alt="Top Language" />
</div>

<br />

<div align="center">
  <img src="https://github.com/JOSEHPGAMEPLAY/taply/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI Status" />
  <img src="https://github.com/JOSEHPGAMEPLAY/taply/actions/workflows/codeql.yml/badge.svg" alt="CodeQL" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
</div>

<br />

---

## 📋 Tabla de contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Inicio rápido](#-inicio-rápido)
- [Desarrollo con Docker](#-desarrollo-con-docker)
- [Base de datos](#-base-de-datos)
- [Endpoints de salud](#-endpoints-de-salud)
- [Documentación](#-documentación)
- [Próximas fases](#-próximas-fases)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

| Característica | Descripción |
|---|---|
| 📄 **Páginas digitales** | Crea páginas personalizadas con botones de redirección |
| 📡 **Etiquetas NFC** | Asocia páginas a etiquetas NFC para acceso con un toque |
| 📱 **Códigos QR** | Genera códigos QR que redirigen a las páginas |
| 📊 **Analíticas** | Rastrea interacciones y métricas de uso |
| 💳 **Facturación** | Planes y suscripciones para negocios |
| 🔐 **Autenticación** | Sistema seguro de usuarios y sesiones |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                  Navegador del usuario               │
└────────────────────┬────────────────────────────────┘
                     │ HTTP
                     ▼
┌─────────────────────────────────────────────────────┐
│  Frontend (Next.js 15)                              │
│  • App Router                                        │
│  • Tailwind CSS + shadcn/ui                          │
│  • Puerto: 3000                                      │
└────────────────────┬────────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────┐
│  Backend (NestJS 10)                                 │
│  • API REST versionada (/api/v1)                     │
│  • Prisma ORM                                        │
│  • Puerto: 3001                                      │
└────────────────────┬────────────────────────────────┘
                     │ SQL
                     ▼
┌─────────────────────────────────────────────────────┐
│  Base de datos (PostgreSQL 16)                       │
│  • Esquema versionado con migraciones                │
│  • Datos persistentes en volumen Docker              │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack tecnológico

| Componente | Tecnología | Versión |
|---|---|---|
| **Frontend** | Next.js | 15 |
| **Backend** | NestJS | 10 |
| **Base de datos** | PostgreSQL | 16 |
| **ORM** | Prisma | 6 |
| **Estilos** | Tailwind CSS | 4 |
| **Componentes UI** | shadcn/ui | — |
| **Gestor de paquetes** | pnpm | 9 |
| **Contenedores** | Docker | — |
| **Orquestación** | Docker Compose | — |
| **Lenguaje** | TypeScript | 5 |

---

## 📁 Estructura del proyecto

```
taply/
├── apps/
│   ├── web/              # Frontend Next.js
│   │   ├── Dockerfile
│   │   └── src/
│   └── api/              # Backend NestJS
│       ├── Dockerfile
│       └── src/
├── packages/
│   ├── contracts/        # Contratos de API
│   ├── eslint-config/    # Configuración ESLint
│   └── typescript-config/ # Configuración TypeScript
├── prisma/
│   ├── schema.prisma     # Esquema de base de datos
│   ├── migrations/       # Migraciones versionadas
│   └── seed.ts           # Datos iniciales
├── docs/                 # Documentación
│   └── docker/
├── docker-compose.yml    # Entorno de desarrollo
├── docker-compose.prod.yml # Entorno de producción
└── package.json          # Scripts y dependencias
```

---

## 🚀 Inicio rápido

### Requisitos

- **Docker Desktop** instalado y en ejecución
- **pnpm** (gestor de paquetes)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JOSEHPGAMEPLAY/taply.git
cd taply

# Instalar dependencias
pnpm install
```

### Ejecutar con Docker

```bash
# Levantar todos los servicios
docker compose up --build

# Los servicios estarán disponibles en:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# PostgreSQL: localhost:5432
```

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Iniciar modo desarrollo |
| `pnpm build` | Compilar frontend y backend |
| `pnpm lint` | Ejecutar linter |
| `pnpm test` | Ejecutar pruebas |
| `pnpm docker:up` | Levantar contenedores |
| `pnpm docker:down` | Detener contenedores |
| `pnpm docker:logs` | Ver logs de contenedores |
| `pnpm db:migrate` | Aplicar migraciones de base de datos |
| `pnpm db:seed` | Ejecutar seed de datos |
| `pnpm db:studio` | Abrir Prisma Studio |

---

## 🐳 Desarrollo con Docker

### Servicios

| Servicio | Imagen | Puerto | Descripción |
|---|---|---|---|
| **postgres** | postgres:16-alpine | 5432 | Base de datos PostgreSQL |
| **api** | apps/api/Dockerfile | 3001 | Backend NestJS |
| **web** | apps/web/Dockerfile | 3000 | Frontend Next.js |

### Volúmenes

- `taply_postgres_data` — Datos persistentes de PostgreSQL
- Código fuente montado en desarrollo para hot reload

### Variables de entorno

Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

---

## 🗄️ Base de datos

### Esquema

El esquema Prisma incluye **17 modelos** y **11 enums** que cubren:

- **Usuarios y autenticación**: User, AuthSession, AuthToken
- **Negocios**: Business
- **Páginas**: Page, PageVersion
- **Etiquetas NFC**: NfcTag, TagAssignment
- **Analíticas**: AnalyticsEvent
- **Facturación**: BillingProduct, Order, OrderItem, Payment, Subscription
- **Permisos**: BusinessEntitlement
- **Auditoría**: AuditLog

### Migraciones

```bash
# Generar cliente Prisma
pnpm db:generate

# Validar esquema
pnpm db:validate

# Aplicar migraciones
pnpm db:migrate

# Abrir Prisma Studio
pnpm db:studio
```

---

## 🏥 Endpoints de salud

| Endpoint | Descripción |
|---|---|
| `GET /api/v1/health` | Liveness — verifica que la API está ejecutándose |
| `GET /api/v1/health/ready` | Readiness — verifica que la API y la base de datos están operativas |

### Ejemplo de respuesta

```json
{
  "status": "ready",
  "checks": {
    "database": "ok"
  }
}
```

---

## 📚 Documentación

- [Desarrollo con Docker](docs/docker/development.md)
- [Despliegue en producción](docs/docker/production.md)
- [Solución de problemas](docs/docker/troubleshooting.md)
- [Migraciones de base de datos](docs/database/migrations.md)

---

## 📅 Próximas fases

| Fase | Descripción | Estado |
|---|---|---|
| ✅ **Fase 1** | Monorepo y scaffold | Completada |
| ✅ **Fase 2** | Docker e infraestructura | Completada |
| ✅ **Fase 3** | Esquema Prisma y migraciones | Completada |
| 🔄 **Fase 4** | Autenticación y usuarios | En progreso |
| ⏳ **Fase 5** | Módulo de negocios | Pendiente |
| ⏳ **Fase 6** | Gestión de páginas y etiquetas NFC | Pendiente |
| ⏳ **Fase 7** | Analíticas | Pendiente |
| ⏳ **Fase 8** | Facturación y pagos | Pendiente |

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para más información sobre cómo contribuir, consulta la guía de contribución del proyecto.

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nombre-feature`)
3. Haz commit de tus cambios (`git commit -m "feat: descripción"`)
4. Haz push a la rama (`git push origin feature/nombre-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

<div align="center">
  <p>Hecho con ❤️ por <strong>Jose Vera</strong></p>
  <p>
    <a href="https://github.com/JOSEHPGAMEPLAY">
      <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
    </a>
  </p>
</div>
