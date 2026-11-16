# restore.ps1 — Restaurar backup de PostgreSQL para Taply
#
# Restaura un backup comprimido (.sql.gz) en el contenedor PostgreSQL.
#
# Uso:
#   .\docker\restore.ps1 -BackupFile "D:\backups\taply\taply_backup_20261116_013000.sql.gz"
#   .\docker\restore.ps1 -BackupFile "D:\backups\taply\taply_backup_20261116_013000.sql.gz" -Database "taply" -User "taply_user"

param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,
    [string]$Container = "taply-postgres",
    [string]$Database = "taply",
    [string]$User = "taply_user"
)

# Verificar que el archivo existe
if (-not (Test-Path $BackupFile)) {
    Write-Host "ERROR: El archivo '$BackupFile' no existe." -ForegroundColor Red
    exit 1
}

Write-Host "=== Taply PostgreSQL Restore ===" -ForegroundColor Cyan
Write-Host "Contenedor: $Container"
Write-Host "Base de datos: $Database"
Write-Host "Archivo: $BackupFile"
Write-Host ""

# Confirmar con el usuario
Write-Host "ADVERTENCIA: Esto borrará todos los datos existentes en la base de datos '$Database'." -ForegroundColor Red
Write-Host "¿Estás seguro? (Escribe 'yes' para continuar): " -NoNewline -ForegroundColor Yellow
$confirmation = Read-Host
if ($confirmation -ne 'yes') {
    Write-Host "Restauración cancelada." -ForegroundColor Gray
    exit 0
}

# Verificar que el contenedor está corriendo
$containerStatus = docker inspect --format='{{.State.Running}}' $Container 2>$null
if ($containerStatus -ne 'true') {
    Write-Host "ERROR: El contenedor '$Container' no está corriendo." -ForegroundColor Red
    exit 1
}

# Descomprimir y restaurar
Write-Host ""
Write-Host "Descomprimiendo y restaurando..." -ForegroundColor Yellow

# Usar gunzip para descomprimir y pipe a psql dentro del contenedor
$backupExt = [System.IO.Path]::GetExtension($BackupFile)
if ($backupExt -eq '.gz') {
    # Archivo comprimido: descomprimir y restaurar
    $process = Start-Process -FilePath "gunzip" -ArgumentList "-c `"$BackupFile`"" -NoNewWindow -PassThru -RedirectStandardOutput $null
    if ($LASTEXITCODE -ne 0) {
        # Si gunzip no está disponible, usar 7z
        $process = Start-Process -FilePath "7z" -ArgumentList "x -so `"$BackupFile`"" -NoNewWindow -PassThru
    }
    # Alternativa: descomprimir a archivo temporal
    $tempFile = [System.IO.Path]::ChangeExtension($BackupFile, '.sql')
    try {
        # Usar .NET para descomprimir
        $inputStream = [System.IO.File]::OpenRead($BackupFile)
        $gzipStream = New-Object System.IO.Compression.GzipStream($inputStream, [System.IO.Compression.CompressionMode]::Decompress)
        $outputStream = [System.IO.File]::OpenWrite($tempFile)
        $gzipStream.CopyTo($outputStream)
        $outputStream.Close()
        $gzipStream.Close()
        $inputStream.Close()
    } catch {
        Write-Host "ERROR: No se pudo descomprimir el archivo." -ForegroundColor Red
        exit 1
    }
} else {
    $tempFile = $BackupFile
}

# Restaurar el SQL en la base de datos
Write-Host "Restaurando datos en PostgreSQL..." -ForegroundColor Yellow
docker exec -i $Container psql -U $User -d $Database < $tempFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Restauración completada exitosamente!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: La restauración falló." -ForegroundColor Red
    exit 1
}

# Limpiar archivo temporal si se creó
if ($backupExt -eq '.gz' -and (Test-Path $tempFile)) {
    Remove-Item $tempFile -Force
}

Write-Host "=== Restauración finalizada ===" -ForegroundColor Cyan
