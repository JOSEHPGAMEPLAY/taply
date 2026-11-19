import { Global, Module, OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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
   * Conecta a la base de datos al iniciar el módulo.
   * Las migraciones se ejecutan en el build (Vercel) o en docker-compose (Docker),
   * no en runtime para evitar cold starts lentos en serverless.
   */
  async onModuleInit() {
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
