# Backup y Restauración de PostgreSQL

## Resumen

Taply incluye scripts de PowerShell para hacer backups y restauraciones de la base de datos PostgreSQL que corre dentro de Docker. Los backups se comprimen con gzip y se almacenan con timestamp para facilitar la gestión.

## Scripts disponibles

| Script | Descripción |
|---|---|
| `docker/backup.ps1` | Crea un backup comprimido de PostgreSQL |
| `docker/restore.ps1` | Restaura un backup comprimido en PostgreSQL |

## Backup manual

### Uso básico

```powershell
.\docker\backup.ps1
```

El backup se guarda en `D:\backups\taply\taply_backup_YYYYMMDD_HHMMSS.sql.gz`.

### Parámetros

| Parámetro | Descripción | Valor por defecto |
|---|---|---|
| `-BackupDir` | Directorio donde se guardan los backups | `D:\backups\taply` |
| `-Container` | Nombre del contenedor PostgreSQL | `taply-postgres` |
| `-Database` | Nombre de la base de datos | `taply` |
| `-User` | Usuario de PostgreSQL | `taply_user` |
| `-RetentionDays` | Días de retención de backups antiguos | `30` |

### Ejemplos

```powershell
# Backup con directorio personalizado
.\docker\backup.ps1 -BackupDir "D:\backups\taply"

# Backup con retención de 60 días
.\docker\backup.ps1 -RetentionDays 60

# Backup en otra ubicación
.\docker\backup.ps1 -BackupDir "E:\database-backups"
```

## Backup automático con Task Scheduler

Para automatizar los backups diarios en Windows:

### 1. Crear tarea programada

```powershell
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-File D:\Documents\proyectos\taply\docker\backup.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable

Register-ScheduledTask `
    -TaskName "Taply PostgreSQL Backup" `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -User "SYSTEM" `
    -RunLevel Highest
```

### 2. Verificar la tarea

```powershell
Get-ScheduledTask -TaskName "Taply PostgreSQL Backup" | Format-List
```

### 3. Ejecutar manualmente para probar

```powershell
Start-ScheduledTask -TaskName "Taply PostgreSQL Backup"
```

## Restauración

### Uso básico

```powershell
.\docker\restore.ps1 -BackupFile "D:\backups\taply\taply_backup_20261116_013000.sql.gz"
```

### Parámetros

| Parámetro | Descripción | Valor por defecto |
|---|---|---|
| `-BackupFile` | Ruta al archivo de backup (obligatorio) | — |
| `-Container` | Nombre del contenedor PostgreSQL | `taply-postgres` |
| `-Database` | Nombre de la base de datos | `taply` |
| `-User` | Usuario de PostgreSQL | `taply_user` |

### Advertencia

El script de restauración **borra todos los datos existentes** en la base de datos antes de restaurar. Siempre pide confirmación antes de proceder.

## Estrategia de retención

### Backups locales

- **Retención por defecto**: 30 días
- Los backups antiguos se eliminan automáticamente al ejecutar `backup.ps1`
- Configurable con `-RetentionDays`

### Recomendaciones para producción

| Frecuencia | Retención | Almacenamiento |
|---|---|---|
| Diaria | 30 días | Disco local |
| Semanal | 90 días | Disco externo o cloud |
| Mensual | 1 año | Cloud (S3, Azure Blob) |

### Copias en la nube

Para copiar backups a la nube, agrega al final de `backup.ps1`:

```powershell
# Ejemplo con AWS S3
aws s3 cp $filepath s3://tu-bucket/taply-backups/

# Ejemplo con Azure Blob
az storage blob upload --file $filepath --container backups --name $filename
```

## Pruebas de restauración

**Importante**: Prueba la restauración periódicamente para asegurar que los backups son válidos.

### Proceso de prueba

1. **Crear base de datos de prueba**:
   ```powershell
   docker exec taply-postgres psql -U taply_user -d taply -c "CREATE DATABASE taply_test;"
   ```

2. **Restaurar en la base de datos de prueba**:
   ```powershell
   .\docker\restore.ps1 `
       -BackupFile "D:\backups\taply\taply_backup_20261116_013000.sql.gz" `
       -Database "taply_test"
   ```

3. **Verificar los datos**:
   ```powershell
   docker exec taply-postgres psql -U taply_user -d taply_test -c "SELECT count(*) FROM users;"
   docker exec taply-postgres psql -U taply_user -d taply_test -c "SELECT count(*) FROM businesses;"
   ```

4. **Limpiar**:
   ```powershell
   docker exec taply-postgres psql -U taply_user -d taply -c "DROP DATABASE taply_test;"
   ```

## Solución de problemas

### El contenedor no está corriendo

```powershell
docker ps | Select-String "taply-postgres"
docker start taply-postgres
```

### No hay espacio en disco

```powershell
# Verificar espacio
Get-PSDrive D | Select-Object Used, Free

# Limpiar backups antiguos manualmente
Get-ChildItem "D:\backups\taply" -Filter "taply_backup_*.sql.gz" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item -Force
```

### El backup está vacío

Verifica que la base de datos tiene datos:

```powershell
docker exec taply-postgres psql -U taply_user -d taply -c "\dt"
```

### Error de permisos

Ejecuta PowerShell como administrador o asegúrate de tener permisos de escritura en el directorio de backups.

## Monitoreo

Para verificar que los backups automáticos funcionan:

```powershell
# Ver último backup
Get-ChildItem "D:\backups\taply" -Filter "taply_backup_*.sql.gz" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1 |
    Format-List Name, Length, LastWriteTime

# Ver tarea programada
Get-ScheduledTask -TaskName "Taply PostgreSQL Backup" |
    Get-ScheduledTaskInfo |
    Format-List LastRunTime, LastTaskResult
```
