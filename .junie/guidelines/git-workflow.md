# Git Workflow Guidelines

## Regla Obligatoria: Commit y Push por Cada Archivo

**Cada archivo que se modifique, cree o elimine DEBE ser commiteado y pushado inmediatamente después del cambio.**

### Flujo de Trabajo

1. **Modificar un archivo** → Editar el código.
2. **Commit inmediato** → `git add <archivo>` + `git commit -m "descripción concisa" --trailer "Co-authored-by: Junie <junie@jetbrains.com>"`
3. **Push inmediato** → `git push origin main` (o la rama actual)
4. **Repetir** para el siguiente archivo.

### Reglas

- **NUNCA** acumular cambios de múltiples archivos en un solo commit, a menos que sean cambios atómicos en el mismo archivo.
- **NUNCA** dejar cambios sin commit al finalizar una tarea o sesión.
- **SIEMPRE** usar mensajes de commit claros y descriptivos.
- **SIEMPRE** incluir `--trailer "Co-authored-by: Junie <junie@jetbrains.com>"` en cada commit.
- **SIEMPRE** pushar después de cada commit para mantener el repositorio sincronizado.
- **VERIFICAR** que el push fue exitoso antes de continuar con el siguiente archivo.

### Excepciones

- Archivos generados automáticamente (`.tsbuildinfo`, `node_modules/`, `.next/`) NO se commitean.
- Si un cambio requiere múltiples archivos para funcionar (ej: un nuevo endpoint con controller + service + DTO), se puede hacer un solo commit con todos los archivos relacionados, pero DEBE ser pushado inmediatamente.

### Mensajes de Commit

Usar el formato convencional:
- `feat:` para nuevas funcionalidades
- `fix:` para correcciones de bugs
- `refactor:` para refactorizaciones
- `docs:` para documentación
- `chore:` para tareas de mantenimiento

Ejemplo: `feat(sprint-3): add icon selector component`
