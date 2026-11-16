# backup.ps1 — Backup de PostgreSQL para Taply
#
# Ejecuta pg_dump dentro del contenedor Docker y comprime el resultado.
# Los backups se almacenan en un directorio configurable con timestamp.
#
# Uso:
#   .\docker\backup.ps1
#   .\docker\backup.ps1 -BackupDir "D:\backups\taply"
#   .\docker\backup.ps1 -Container "taply-postgres" -Database "taply" -User "taply_user"

param(
    [string]$BackupDir = "D:\backups\taply",
    [string]$Container = "taply-postgres",
    [string]$Database = "taply",
    [string]$User = "taply_user",
    [int]$RetentionDays = 30  # Eliminar backups mayores a N días
)

# Crear directorio de backups si no existe
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Generar nombre del archivo con timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filename = "taply_backup_$timestamp.sql.gz"
$filepath = Join-Path $BackupDir $filename

Write-Host "=== Taply PostgreSQL Backup ===" -ForegroundColor Cyan
Write-Host "Contenedor: $Container"
Write-Host "Base de datos: $Database"
Write-Host "Archivo: $filepath"
Write-Host ""

# Verificar que el contenedor está corriendo
$containerStatus = docker inspect --format='{{.State.Running}}' $Container 2>$null
if ($containerStatus -ne 'true') {
    Write-Host "ERROR: El contenedor '$Container' no está corriendo." -ForegroundColor Red
    exit 1
}

# Ejecutar pg_dump y comprimir con .NET GzipStream (gzip no existe en Windows)
Write-Host "Ejecutando pg_dump..." -ForegroundColor Yellow
$tempSql = [System.IO.Path]::ChangeExtension($filepath, '.sql')

# Guardar dump SQL sin comprimir primero
docker exec $Container pg_dump -U $User -d $Database > $tempSql
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: pg_dump falló." -ForegroundColor Red
    if (Test-Path $tempSql) { Remove-Item $tempSql -Force }
    exit 1
}

# Comprimir con .NET GzipStream
try {
    $inputStream = [System.IO.File]::OpenRead($tempSql)
    $outputStream = [System.IO.File]::OpenWrite($filepath)
    $gzipStream = New-Object System.IO.Compression.GzipStream($outputStream, [System.IO.Compression.CompressionMode]::Compress)
    $inputStream.CopyTo($gzipStream)
    $gzipStream.Close()
    $outputStream.Close()
    $inputStream.Close()
} catch {
    Write-Host "ERROR: No se pudo comprimir el archivo." -ForegroundColor Red
    if (Test-Path $tempSql) { Remove-Item $tempSql -Force }
    if (Test-Path $filepath) { Remove-Item $filepath -Force }
    exit 1
}

# Eliminar archivo temporal SQL
if (Test-Path $tempSql) { Remove-Item $tempSql -Force }

if (Test-Path $filepath) {
    $size = (Get-Item $filepath).Length
    $sizeMB = [math]::Round($size / 1MB, 2)
    Write-Host ""
    Write-Host "Backup completado exitosamente!" -ForegroundColor Green
    Write-Host "Archivo: $filepath"
    Write-Host "Tamaño: ${sizeMB} MB"
} else {
    Write-Host ""
    Write-Host "ERROR: El backup falló." -ForegroundColor Red
    exit 1
}

# Limpiar backups antiguos
Write-Host ""
Write-Host "Limpiando backups mayores a $RetentionDays días..." -ForegroundColor Yellow
$oldBackups = Get-ChildItem -Path $BackupDir -Filter "taply_backup_*.sql.gz" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) }
if ($oldBackups.Count -gt 0) {
    $oldBackups | Remove-Item -Force
    Write-Host "Eliminados $($oldBackups.Count) backup(s) antiguo(s)." -ForegroundColor Yellow
} else {
    Write-Host "No hay backups antiguos para eliminar." -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Backup finalizado ===" -ForegroundColor Cyan
