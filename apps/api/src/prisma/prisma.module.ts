import { Global, Module, OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

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
        // PrismaPg adapter no soporta SSL; usar solo con DB locales
        if (process.env.DATABASE_URL?.includes('sslmode=require')) {
          return new PrismaClient();
        }
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
   * Conecta a la base de datos y crea el usuario admin por defecto si está configurado.
   * Las migraciones se ejecutan en el build (Vercel) o en docker-compose (Docker),
   * no en runtime para evitar cold starts lentos en serverless.
   */
  async onModuleInit() {
    this.logger.log('✅ PrismaModule inicializado');

    // Crear usuario admin por defecto si las variables están configuradas
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      try {
        const existing = await this.prisma.user.findUnique({ where: { email: adminEmail } });
        if (!existing) {
          const passwordHash = await bcrypt.hash(adminPassword, 10);
          await this.prisma.user.create({
            data: {
              email: adminEmail,
              passwordHash,
              name: 'Admin',
              role: 'ADMIN',
            },
          });
          this.logger.log(`✅ Usuario admin creado por defecto: ${adminEmail}`);
        }
      } catch (error) {
        this.logger.warn(`⚠️ No se pudo crear usuario admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Cierra la conexión al destruir el módulo.
   */
  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
