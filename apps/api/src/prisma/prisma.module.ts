import { Global, Module, OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Token inyectable para el cliente Prisma.
 */
export const PRISMA_CLIENT = 'PrismaClient';

/**
 * PrismaModule - Módulo global que proporciona el cliente Prisma.
 *
 * Sigue el principio de Responsabilidad Única (SRP):
 * Se encarga exclusivamente de gestionar el ciclo de vida de PrismaClient.
 *
 * Uso: Importar en AppModule y acceder a PrismaClient vía inyección de dependencias.
 */
@Global()
@Module({
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: () => {
        const adapter = new PrismaPg(process.env.DATABASE_URL!);
        return new PrismaClient({ adapter });
      },
    },
  ],
  exports: [PRISMA_CLIENT],
})
export class PrismaModule implements OnModuleInit, OnModuleDestroy {
  /**
   * Constructor que recibe el cliente Prisma inyectado.
   */
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  private readonly logger = new Logger(PrismaModule.name);

  /**
   * Aplica las migraciones pendientes y conecta a la base de datos.
   * Esto asegura que las tablas existan tanto en desarrollo como en producción (Vercel).
   */
  async onModuleInit() {
    // Ejecutar migraciones pendientes de forma idempotente
    try {
      const prismaPath = join(__dirname, '..', '..', 'prisma');
      execSync('npx prisma migrate deploy', {
        cwd: prismaPath,
        stdio: 'ignore',
        env: { ...process.env },
      });
      this.logger.log('✅ Migraciones de Prisma aplicadas exitosamente');
    } catch (error) {
      this.logger.warn('⚠️ Error al aplicar migraciones de Prisma:', error);
      // No lanzar error - la app puede funcionar con el esquema actual
    }

    // Conectar a la base de datos
    await this.prisma.$connect();
    this.logger.log('✅ Conexión a la base de datos establecida');
  }

  /**
   * Cierra la conexión al destruir el módulo.
   */
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
