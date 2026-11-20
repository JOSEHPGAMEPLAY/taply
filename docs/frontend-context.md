# Contexto Técnico — Taply Frontend

> Última actualización: 2026-11-19

## Stack Tecnológico

### Frontend (`apps/web`)
- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript 6
- **Estilos**: TailwindCSS v4
- **Iconos**: lucide-react
- **Componentes UI**: class-variance-authority (cva) + clsx + tailwind-merge
- **Estado**: React hooks (useState, useEffect, useContext)
- **Navegación**: next/navigation (useRouter, usePathname, useSearchParams, Link)
- **Analytics**: @vercel/analytics

### Backend (`apps/api`)
- **Framework**: NestJS
- **ORM**: Prisma
- **Base de datos**: PostgreSQL
- **Auth**: JWT custom (accessToken + refreshToken en localStorage)
- **Tests**: Jest + E2E tests

### Infraestructura
- **Docker**: docker-compose para dev y prod
- **Deploy**: Vercel (frontend), Render (backend)

## Estructura de Carpetas Frontend

```
apps/web/src/
├── app/
│   ├── (auth)/          # Rutas de auth (login, register)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── app/             # Dashboard protegido (layout con sidebar)
│   │   ├── layout.tsx   # DashboardLayout con AuthProvider + Sidebar
│   │   ├── page.tsx     # Dashboard principal
│   │   ├── businesses/page.tsx
│   │   ├── pages/page.tsx
│   │   ├── pages/[pageId]/buttons/page.tsx
│   │   ├── templates/page.tsx
│   │   ├── templates/[id]/page.tsx
│   │   ├── nfc-tags/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── admin/users/page.tsx
│   ├── p/[slug]/        # Página pública del cliente (la que ven los usuarios finales)
│   │   ├── page.tsx     # Server component, carga datos de API pública
│   │   └── ButtonWithTracking.tsx
│   ├── t/[token]/       # Página de NFC tag
│   ├── page.tsx         # Landing page
│   ├── layout.tsx       # Root layout
│   └── globals.css
├── components/
│   ├── ui/button.tsx    # Botón con cva variants
│   ├── icon-selector.tsx # Selector de iconos con búsqueda
│   └── contact-form.tsx
└── lib/
    ├── api.ts           # Cliente API con JWT
    ├── auth-context.tsx # Contexto de autenticación
    ├── icon-map.ts      # Mapeo de iconos lucide-react
    ├── session-error.ts # Error custom para sesión expirada
    └── utils.ts         # cn() utility (clsx + tailwind-merge)
```

## Autenticación

### Flujo
1. Login → POST /auth/login → recibe accessToken + refreshToken
2. Tokens se guardan en localStorage
3. `api.ts` agrega `Authorization: Bearer <token>` a cada request
4. Si la API responde 401 → se limpian tokens y se lanza SessionExpiredError
5. `auth-context.tsx` captura SessionExpiredError y muestra modal de sesión expirada

### Roles
- `ADMIN`: Acceso a /app/admin/users + todas las secciones
- `USER`: Acceso a businesses, pages, templates, nfc-tags, analytics

### Protección de Rutas
- `/app/*` → protegido con AuthProvider en `app/app/layout.tsx`
- `/login`, `/register` → redirigen a /app si ya hay sesión
- `/`, `/p/[slug]`, `/t/[token]` → públicas, sin validación

## Base de Datos (Prisma)

### Modelos Clave
- **User**: id, email, passwordHash, name, role (ADMIN/USER), status
- **Business**: id, ownerId, name, slug, description, status
- **Page**: id, businessId, templateId (FK), slug, status, publishedVersionId
- **PageVersion**: id, pageId, status, config (JSON), buttons (JSON)
- **Template**: id, name, description, config (JSON), version
- **NfcTag**: id, businessId, token, status, programmedUrl
- **AnalyticsEvent**: id, pageId, tagId, type (PAGE_VIEW/BUTTON_CLICK/TAG_SCAN), buttonKey

### Relaciones Importantes
- User → Business (1:N)
- Business → Page (1:N)
- Page → PageVersion (1:N)
- Page → Template (N:1, optional)
- Page → AnalyticsEvent (1:N)

## Componentes Reutilizables

### `components/ui/button.tsx`
- Usa `class-variance-authority` para variantes
- Variantes: default, destructive, outline, ghost, link
- Tamaños: default, sm, lg, icon

### `components/ui/modal.tsx` ✨ NUEVO
- Modal genérico con overlay, cierre con Escape y click fuera
- Tamaños: sm, md, lg, xl
- Soporta title, description y children

### `components/ui/alert.tsx` ✨ NUEVO
- Alertas con variantes: success, error, info, warning
- Soporta title, message, children y onClose

### `components/ui/status-badge.tsx` ✨ NUEVO
- Badges de estado con colores predefinidos
- Soporta: PUBLISHED, DRAFT, PAUSED, ARCHIVED, ACTIVE, SUSPENDED, etc.

### `components/ui/empty-state.tsx` ✨ NUEVO
- EmptyState: icono, título, descripción y acción opcional
- LoadingState: spinner con mensaje opcional

### `components/layout/dashboard-sidebar.tsx` ✨ NUEVO
- Sidebar del dashboard con navegación, info de usuario y logout
- Responsive: overlay en mobile, fijo en desktop

### `components/layout/dashboard-header.tsx` ✨ NUEVO
- Header del dashboard con título y botón de menú mobile
- Soporta contenido personalizado a la derecha

### `components/icon-selector.tsx`
- Grid de iconos con búsqueda y filtro por categoría
- 50+ iconos de lucide-react organizados en categorías

### `lib/icon-map.ts`
- Mapeo de 50+ iconos con key, label, category, component
- Funciones: getIconByKey(), getIconComponent()

## API Client (`lib/api.ts`)

Métodos principales:
- Auth: register(), login(), getMe(), refresh()
- Businesses: getBusinesses(), createBusiness(), updateBusiness(), deleteBusiness()
- Pages: getPages(), createPage(), getPage(), updatePage(), deletePage(), publishPage(), updatePageStatus(), checkSlugAvailable()
- Templates: getTemplates(), createTemplate(), getTemplate(), updateTemplate(), deleteTemplate()
- NFC Tags: getNfcTags(), createNfcTag(), assignTagToPage(), programNfcTag()
- Analytics: getAnalytics()
- QR: generateQrCode(), getQrCode()

## Página Pública `/p/[slug]` (Rediseñada 2026-11-19)

- **Server Component** que fetcha datos de la API pública
- Endpoint: GET /public/pages/:slug
- Retorna: business, page, publishedVersion (con buttons y config)
- Cada botón usa `ButtonWithTracking` para registrar clicks
- **Diseño moderno**: fondo oscuro con gradientes, decoraciones de fondo, glassmorphism
- **Soporte para templates**: lee `publishedVersion.config.template` para aplicar:
  - `bgGradient`: gradiente de fondo
  - `buttonStyle`: forma de botones (rounded, square, pill)
  - `logoUrl`: logo personalizado del negocio
- **ButtonWithTracking**: botones con glassmorphism, animaciones hover/active, iconos lucide-react

## Templates (Actualizado 2026-11-19)

- Modelo existe en DB con campo `config` (JSON) para personalización
- La página de templates ahora incluye un **editor visual completo**:
  - **8 gradientes de fondo** predefinidos (oscuros y claros)
  - **3 formas de botón**: redondeado, cuadrado, píldora
  - **URL de logo** personalizable con preview
  - **Vista previa en tiempo real** dentro del modal
- Los templates se muestran como **grid de cards** con preview visual
- Al crear una página, se puede **asignar un template** desde el modal
- La página pública `/p/[slug]` lee la config del template y aplica:
  - Gradiente de fondo personalizado
  - Forma de botones (rounded, square, pill)
  - Logo del negocio si está configurado
  - Botones con glassmorphism y animaciones

## Problemas Resueltos (2026-11-19)

1. ✅ **Componentización**: Sidebar, Header, Modal, Alert, StatusBadge, EmptyState extraídos como componentes reutilizables
2. ✅ **Bug botones en mobile**: La tabla de páginas ahora muestra cards en mobile con todos los botones visibles
3. ✅ **Página /p/[slug] rediseñada**: Fondo oscuro con glassmorphism, decoraciones, soporte para templates
4. ✅ **Templates con personalización real**: Editor visual con colores, formas, logo y preview
5. ✅ **Asignación de templates**: Al crear una página se puede elegir un template
