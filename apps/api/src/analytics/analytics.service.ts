import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaClient, Prisma } from '../generated/prisma/client.js';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';
import { AnalyticsQueryDto } from './dto/analytics-query.dto.js';

/**
 * AnalyticsService - Obtiene estadísticas de analíticas por página.
 */
@Injectable()
export class AnalyticsService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async getStats(dto: AnalyticsQueryDto) {
    const where: any = { pageId: dto.pageId };
    if (dto.startDate || dto.endDate) {
      where.createdAt = {};
      if (dto.startDate) where.createdAt.gte = new Date(dto.startDate);
      if (dto.endDate) where.createdAt.lte = new Date(dto.endDate);
    }

    const events = await this.prisma.analyticsEvent.findMany({ where });
    const stats = events.reduce((acc: Record<string, number>, event: any) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { pageId: dto.pageId, total: events.length, byType: stats };
  }

  /**
   * Elimina eventos AnalyticsEvent mayores a N meses de retención.
   * Por defecto elimina eventos mayores a 12 meses según la política del plan maestro.
   * Retorna la cantidad de eventos eliminados.
   */
  async pruneEvents(retentionMonths: number = 12) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

    const result = await this.prisma.analyticsEvent.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    return { deleted: result.count, retentionMonths, cutoffDate: cutoffDate.toISOString() };
  }
}
