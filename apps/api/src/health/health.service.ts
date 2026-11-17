import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getReady() {
    const database = await this.checkDatabase();

    return {
      status: database ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: database ? 'ok' : 'unavailable',
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const adapter = new PrismaPg(process.env.DATABASE_URL!);
      const prisma = new PrismaClient({ adapter });
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      return true;
    } catch {
      return false;
    }
  }
}
