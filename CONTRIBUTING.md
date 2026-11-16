# 🤝 Guía de Contribución — Taply

## 📋 Estrategia de Ramas Git

Taply utiliza un flujo de trabajo basado en **feature branches**. El proyecto tiene dos aplicaciones independientes (API y Web) que se desarrollan por separado pero se coordinan en el mismo repositorio.

### Ramas Principales

| Rama | Descripción | Protección |
|---|---|---|
| `main` | Rama principal, siempre funcional y desplegable | ✅ Protegida |
| `feature/*` | Nuevas funcionalidades y mejoras | Merge a `main` |
| `fix/*` | Correcciones de bugs | Merge a `main` |
| `docs/*` | Cambios solo en documentación | Merge a `main` |
| `refactor/*` | Refactorizaciones sin cambio de comportamiento | Merge a `main` |

### Flujo de Trabajo

```
main ← feature/phase-4-auth
  ↑           │
  │           ├─ Desarrollo
  │           ├─ Commits atómicos
  │           └─ Pull Request
  │
  └─ Merge después de revisión
```

### Pasos para Contribuir

1. **Actualiza `main`**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Crea una rama de feature**
   ```bash
   git checkout -b feature/nombre-de-la-feature
   ```

3. **Desarrolla y haz commits atómicos**
   ```bash
   git add .
   git commit -m "tipo: descripción corta"
   ```

4. **Sincroniza con `main`** (opcional, recomendado)
   ```bash
   git fetch origin
   git rebase origin/main
   ```

5. **Haz push a la rama**
   ```bash
   git push origin feature/nombre-de-la-feature
   ```

6. **Abre un Pull Request** en GitHub

### Tipos de Commit (Conventional Commits)

| Tipo | Descripción | Ejemplo |
|---|---|---|
| `feat` | Nueva funcionalidad | `feat: add login endpoint` |
| `fix` | Corrección de bug | `fix: validate email format` |
| `docs` | Documentación | `docs: update API reference` |
| `style` | Formato, punto y coma, etc. | `style: fix indentation` |
| `refactor` | Refactorización de código | `refactor: extract validation logic` |
| `test` | pruebas | `test: add auth unit tests` |
| `chore` | mantenimiento | `chore: update dependencies` |
| `perf` | mejora de rendimiento | `perf: optimize database query` |

### Ejemplos de Ramas

```bash
# Fases del proyecto
feature/phase-4-auth
feature/phase-5-businesses
feature/phase-6-nfc-tags
feature/phase-7-analytics
feature/phase-8-billing

# Features específicas
feature/user-registration
feature/page-customization
feature/nfc-tag-assignment
feature/qr-code-generation

# Bugs
fix/auth-token-expiration
fix/page-slug-uniqueness

# Documentación
docs/api-swagger-setup
docs/deployment-guide
```

### Reglas de Oro

1. **No commitees directamente a `main`** — Usa siempre una rama de feature.
2. **Commits atómicos** — Cada commit debe hacer una cosa y hacerla bien.
3. **Mantén tu rama actualizada** — Rebase periódicamente sobre `main`.
4. **Commits limpios** — Usa mensajes descriptivos y Convention Commits.
5. **No subas secretos** — Verifica que `.env`, claves API y contraseñas no estén en commits.
6. **Prueba antes de push** — Asegúrate que `npm run build` y `docker compose up` funcionen en cada app.

### Resolución de Conflictos

Si hay conflictos al hacer merge:

```bash
git checkout feature/tu-rama
git merge main
# Resuelve conflictos manualmente
git add .
git merge --continue
git push origin feature/tu-rama
```

### Limpieza de Ramas

Después de mergear una rama a `main`:

```bash
# Elimina rama remota
git push origin --delete feature/nombre-de-la-feature

# Elimina rama local
git branch -d feature/nombre-de-la-feature
```

---

> 💡 **Recuerda:** API y Web son proyectos independientes. Una feature que afecta ambos debe estar en la misma rama, pero cada app se instala y compila por separado con npm.
