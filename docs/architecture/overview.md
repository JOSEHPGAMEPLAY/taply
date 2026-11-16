# Arquitectura General — Taply

## Visión general

Taply es una plataforma SaaS monolítica modular que permite a los negocios crear páginas digitales accesibles mediante etiquetas NFC y códigos QR. La arquitectura sigue el patrón **monolito modular** con separación clara entre frontend y backend, cada uno como proyecto independiente con npm.

## Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente (Navegador)                  │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Panel Cliente │  │ Páginas      │  │ Resolución NFC   │  │
│  │ (Next.js)     │  │ Públicas     │  │ /t/[token]       │  │
│  │ /app/*        │  │ /p/[slug]    │  │                  │  │
│  └──────┬────────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
└─────────┼─────────────────┼────────────────────┼────────────┘
          │                 │                    │
          ▼                 ▼                    ▼
┌───────────────────────────────────────────────────────────┐
│                     API Gateway (NestJS)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Auth     │ │Businesses│ │ Pages    │ │ NFC Tags     │  │
│  │ Module   │ │ Module   │ │ Module   │ │ Module       │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Analytics │ │ Billing  │ │ Public   │ │ QR           │  │
│  │ Module   │ │ Module   │ │ Module   │ │ Module       │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│         │                                                 │
│         ▼ (Prisma Client)                                 │
└─────────┼─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL 16 (Docker)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Esquema Prisma: 17 modelos, 11 enums, restricciones  │   │
│  │ Volumen persistente: taply_postgres_data             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | Next.js + React | 15.x |
| Backend | NestJS | 10.x |
| Base de datos | PostgreSQL | 16-alpine |
| ORM | Prisma | 6.x |
| Estilos | Tailwind CSS | 3.x |
| Componentes UI | shadcn/ui | — |
| Gestor de paquetes | npm | — |
| Contenedores | Docker + Docker Compose | — |
| Lenguaje | TypeScript | 5.x |
| Documentación API | Swagger / OpenAPI | — |
| Pruebas | Jest + Supertest | — |

## Flujo de datos

1. **Autenticación**: El usuario se registra o inicia sesión → el backend genera tokens JWT → el frontend almacena los tokens en localStorage → cada request incluye el token en el header `Authorization`.

2. **Gestión de negocios**: El usuario crea un negocio → el backend valida ownership → se almacena en PostgreSQL → el frontend muestra el dashboard con los datos.

3. **Páginas y botones**: El usuario crea una página con botones → se genera una versión DRAFT → al publicar se crea una nueva versión PUBLISHED → la página es accesible públicamente en `/p/[slug]`.

4. **Etiquetas NFC**: El usuario crea una etiqueta → se genera un token único → al asignar a una página se crea un TagAssignment → al escanear, el endpoint público resuelve el token y redirige a la página.

5. **Códigos QR**: El usuario genera un QR para una página → se crea un data URL SVG → al escanear el QR se accede a la URL pública de la página.

6. **Analíticas**: Cada visita, clic o escaneo genera un AnalyticsEvent → el módulo de analíticas agrega las estadísticas → el dashboard muestra las métricas.

7. **Auditoría**: Cada operación crítica (login, crear, actualizar, eliminar, publicar) genera una entrada en AuditLog → los administradores pueden consultar el historial.

## Principios de diseño

- **Monolito modular**: Un solo proceso que contiene módulos bien delimitados. Cada módulo tiene su propio controller, service y DTOs.
- **Separación frontend/backend**: Next.js y NestJS son aplicaciones independientes que se comunican vía REST.
- **Proyectos independientes**: API y Web son proyectos npm independientes, cada uno con sus propias dependencias y configuración.
- **Docker-first**: El entorno se levanta con `docker compose up --build`. No hay dependencias del host.
- **Prisma como fuente de verdad**: El esquema de base de datos se define en `prisma/schema.prisma` y se migra de forma versionada.
- **SOLID y Clean Code**: Cada módulo sigue los principios SOLID, con inyección de dependencias, responsabilidad única y código documentado.
