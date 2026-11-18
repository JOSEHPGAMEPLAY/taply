---
sessionId: session-261117-130807-bxwo
---

# Sprint 0 — Completado ✅

| Issue | Título | Estado |
|---|---|---|
| US-0.1 | Activar negocio desde el panel | ✅ Fixado (Sprint 2) |
| US-0.2 | Página pública con datos reales | ✅ Implementado |
| US-0.3 | Tracking PAGE_VIEW | ✅ Implementado |
| US-0.4 | Tracking BUTTON_CLICK | ✅ Implementado (`ButtonWithTracking.tsx`) |
| US-0.5 | Botones visibles en página pública | ✅ Fixado (Sprint 2) |

# Sprint 1 — Completado ✅

| Issue | Título | Estado |
|---|---|---|
| US-1.1 | Endpoint de templates | ✅ Implementado |
| US-1.2 | Despublicar página | ✅ Implementado |
| US-1.3 | QR en página de NFC tags | ✅ Ya implementado |
| US-1.4 | Scheduled event pruning | ✅ Implementado |

# Sprint 2 — Fixes Críticos — Completado ✅

| Issue | Título | Estado |
|---|---|---|
| US-0.1 | Toggle publish roto | ✅ Fixado |
| US-0.5 | Botones no se actualizan | ✅ Fixado |
| Preview templates | Preview en vivo de templates | ✅ Implementado |

# Sprint 3 — Mejoras de Botones (Nuevo)

## Requirements

### Overview & Goals
Mejorar la experiencia de gestión de botones en el panel de administración con:
1. Una vista dedicada para gestionar botones de una página (separada del modal actual).
2. Un selector visual de iconos predefinidos (WhatsApp, Facebook, TikTok, etc.) al crear botones.

### User Stories

**US-3.1: Vista de gestión de botones**
- Como administrador/dueno/usuario de un negocio, quiero una vista dedicada para ver y gestionar los botones de mi página, para tener un mejor control sobre ellos.

**US-3.2: Selector de iconos en creación de botones**
- Como administrador/dueno/usuario, quiero ver un selector de iconos predefinidos (WhatsApp, Facebook, TikTok, Instagram, etc.) al crear un botón, para no tener que escribir el nombre del icono manualmente.

### Acceptance Criteria

**US-3.1:**
- Nueva página `/app/pages/:pageId/buttons` con una tabla/lista de botones.
- Posibilidad de agregar, editar y eliminar botones.
- Drag & drop para reordenar botones (opcional, nice-to-have).
- Preview en tiempo real de cómo se verán los botones.

**US-3.2:**
- Grid de iconos predefinidos con categorías (redes sociales, contacto, utilidades).
- Al menos 30+ iconos comunes: WhatsApp, Facebook, Instagram, TikTok, Twitter/X, YouTube, LinkedIn, Telegram, Email, Teléfono, Web, Ubicación, Horarios, Menú, etc.
- Búsqueda de iconos por nombre.
- Preview del icono seleccionado antes de guardar.

## Technical Design

### Current Implementation
- Botones se gestionan en un modal dentro de `apps/web/src/app/app/pages/page.tsx`.
- El campo "icon" es un input de texto libre donde el usuario escribe el nombre del icono.
- En la página pública (`/p/[slug]/ButtonWithTracking.tsx`), el icono se renderiza como texto plano: `{icon && <span className="text-xl">{icon}</span>}`.
- No hay validación ni sugerencia de iconos.

### Key Decisions

1. **Vista dedicada vs modal:** Crear una página separada `/app/pages/[pageId]/buttons` en lugar del modal actual para mejor UX con más espacio.
2. **Iconos predefinidos:** Usar una librería de iconos (lucide-react ya está instalada) con un grid visual seleccionable.
3. **Mapeo de iconos:** Crear un mapeo de nombres de iconos a componentes de lucide-react para renderizarlos correctamente en la página pública.

### Proposed Changes

**US-3.1 — Vista de botones:**
- Crear `apps/web/src/app/app/pages/[pageId]/buttons/page.tsx` como página dedicada.
- Mover la lógica de botones del modal actual a esta nueva página.
- Agregar navegación desde la tabla de páginas (botón "Gestionar botones").
- Mostrar preview en vivo de los botones como se verían en la página pública.

**US-3.2 — Selector de iconos:**
- Crear `apps/web/src/components/icon-selector.tsx` como componente reutilizable.
- Definir un array de iconos predefinidos con categorías.
- Reemplazar el input de texto por un grid visual con búsqueda.
- Actualizar `ButtonWithTracking.tsx` para renderizar iconos de lucide-react en lugar de texto plano.

### File Structure

**Nuevos archivos:**
- `apps/web/src/app/app/pages/[pageId]/buttons/page.tsx` — vista dedicada de botones
- `apps/web/src/components/icon-selector.tsx` — selector visual de iconos
- `apps/web/src/lib/icon-map.ts` — mapeo de iconos predefinidos a componentes lucide-react

**Archivos modificados:**
- `apps/web/src/app/app/pages/page.tsx` — agregar enlace a la vista de botones
- `apps/web/src/app/p/[slug]/ButtonWithTracking.tsx` — renderizar iconos de lucide-react
- `apps/web/src/app/app/templates/[id]/page.tsx` — (si aplica)

### Architecture Diagram

``` mermaid
graph LR
  A[pages/page.tsx] -->|Enlace| B[pages/[pageId]/buttons/page.tsx]
  B --> C[icon-selector.tsx]
  C --> D[icon-map.ts]
  E[p/[slug]/ButtonWithTracking.tsx] --> D
  B -->|PATCH /pages/:id| F[API: PagesService.update]
```

## Testing

### Validation Approach
- Verificar que la nueva página de botones se pueda acceder desde la tabla de páginas.
- Verificar que el selector de iconos muestre los iconos predefinidos y permita búsqueda.
- Verificar que los iconos seleccionados se rendericen correctamente en la página pública.
- Compilar frontend y backend con `tsc --noEmit`.

### Key Scenarios
1. Crear botón con icono predefinido → verificar que aparezca en la página pública.
2. Reordenar botones → verificar que el orden se mantenga.
3. Buscar icono por nombre → verificar que filtre correctamente.
4. Navegar desde la tabla de páginas a la vista de botones.

# Delivery Steps

### ✓ Step 1: Crear mapeo de iconos y componente IconSelector
Crear la base de iconos predefinidos y el componente visual de selección.

- Crear `apps/web/src/lib/icon-map.ts` con un array de 30+ iconos organizados por categorías (redes sociales, contacto, utilidades).
- Cada icono tendrá: `key` (nombre único), `label` (nombre visible), `category` (redes sociales, contacto, etc.), y `icon` (componente lucide-react).
- Crear `apps/web/src/components/icon-selector.tsx` como componente reutilizable con:
  - Grid visual de iconos con preview.
  - Búsqueda por nombre.
  - Filtro por categoría.
  - Callback `onSelect(icon)` al seleccionar.
- Compilar con `tsc --noEmit` para verificar.

### ✓ Step 2: Crear vista dedicada de gestión de botones
Página separada para gestionar botones con mejor UX.

- Crear `apps/web/src/app/app/pages/[pageId]/buttons/page.tsx` como página dedicada.
- Cargar los botones actuales de la página con `api.getPage(pageId)`.
- Mostrar lista de botones existentes con opciones de editar/eliminar.
- Formulario para agregar nuevos botones con el `IconSelector` integrado.
- Preview en vivo de cómo se verán los botones (usando el mismo estilo que `ButtonWithTracking.tsx`).
- Botón de guardar que llama a `api.updatePage(pageId, businessId, { buttons })`.
- Agregar enlace "Gestionar botones" en la tabla de `pages/page.tsx`.
- Compilar con `tsc --noEmit` para verificar.

### ✓ Step 3: Actualizar ButtonWithTracking para renderizar iconos de lucide-react
Hacer que la página pública muestre los iconos correctamente.

- Actualizar `apps/web/src/app/p/[slug]/ButtonWithTracking.tsx` para importar el mapeo de iconos desde `icon-map.ts`.
- Reemplazar `{icon && <span className="text-xl">{icon}</span>}` por un componente que busque el icono en el mapeo y renderice el componente lucide-react correspondiente.
- Si el icono no está en el mapeo, mostrar un fallback genérico.
- Verificar que los botones existentes con iconos como texto sigan funcionando.
- Compilar con `tsc --noEmit` para verificar.
- Reconstruir y desplegar en Docker.