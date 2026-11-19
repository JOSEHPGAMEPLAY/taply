#!/bin/sh
# Entrypoint script: aplica migraciones de Prisma antes de iniciar la API
# Esto asegura que las tablas existan antes de que NestJS arranque

echo "🔄 Aplicando migraciones de Prisma..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migraciones aplicadas exitosamente"
else
  echo "⚠️ Advertencia: no se pudieron aplicar migraciones automáticamente"
  echo "   Asegúrate de que DATABASE_URL esté configurado correctamente"
fi

# Iniciar la API
echo "🚀 Iniciando Taply API..."
exec "$@"
