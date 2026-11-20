# Flujo de Trabajo Git — Taply

## Regla Obligatoria: Sincronizar `develop` con `main` después de cada Sprint

Después de completar un sprint y hacer squash merge hacia `main`, **SIEMPRE** sincronizar la rama `develop` con `main` antes de continuar trabajando.

---

## Flujo Completo por Sprint

### 1. Trabajar en `develop`
```bash
git checkout develop
git pull origin develop
# ... hacer cambios, commits y pushes en develop ...
```

### 2. Completar el Sprint
Cuando todas las issues del sprint estén implementadas y probadas:
```bash
git checkout develop
git push origin develop
```

### 3. Squash Merge hacia `main`
```bash
git checkout main
git pull origin main
git merge develop --squash -m "Sprint N: descripción del sprint (#issue1, #issue2)"
git commit --trailer "Co-authored-by: Junie <junie@jetbrains.com>"
git push origin main
```

### 4. ⚠️ Sincronizar `develop` con `main` (OBLIGATORIO)
```bash
git checkout develop
git merge main -m "chore: sync develop with main after Sprint N merge"
git push origin develop
```

**Este paso es crítico** porque:
- `develop` debe reflejar el estado actual de `main` después del squash merge.
- Sin este paso, `develop` queda desincronizada y los siguientes merges tendrán conflictos o perderán cambios.
- El squash merge en `main` crea un nuevo commit que no existe en `develop`.

### 5. Cerrar Issues en GitHub
Cerrar las issues completadas del sprint en GitHub.

### 6. Continuar con el siguiente Sprint
```bash
git checkout develop
# ... empezar a trabajar en el siguiente sprint ...
```

---

## Resumen Visual

```
develop ──┐
           ├──→ squash merge ──→ main (despliegue en Vercel)
main ──────┘           │
                       ↓
              merge main → develop (sincronización)
                       ↓
              develop lista para siguiente sprint
```

---

## Verificación

Después de cada sprint, verificar que:
1. ✅ `main` incluye el squash merge del sprint.
2. ✅ `develop` está sincronizada con `main` (mismo commit base).
3. ✅ Ambas ramas están pushadas a `origin`.
4. ✅ Las issues del sprint están cerradas en GitHub.

---

## Notas

- **NUNCA** trabajar directamente en `main`.
- **NUNCA** saltar el paso de sincronización (paso 4).
- **SIEMPRE** hacer squash merge para mantener `main` limpio.
- **SIEMPRE** incluir `--trailer "Co-authored-by: Junie <junie@jetbrains.com>"` en commits.
