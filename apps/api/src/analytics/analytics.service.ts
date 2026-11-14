import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

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
}
