import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';
import {
  AnalyticsQueryDto,
  DEFAULT_ANALYTICS_RANGE_DAYS,
  MAX_ANALYTICS_RANGE_DAYS,
} from './dto/analytics-query.dto.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function escapeCsvCell(value: string | null): string {
  const normalized = value ?? '';
  const safeValue = /^[\u0000-\u0020]*[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

type AnalyticsAggregationResults = [
  total: number,
  eventTypeCounts: Array<{
    type: 'PAGE_VIEW' | 'BUTTON_CLICK' | 'TAG_SCAN';
    _count: { _all: number };
  }>,
  dailyViews: Array<{ date: string; count: number }>,
  buttonClickCounts: Array<{
    buttonKey: string | null;
    _count: { _all: number };
  }>,
];

/**
 * AnalyticsService - Obtiene estadísticas de analíticas por página.
 */
@Injectable()
export class AnalyticsService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async getStats(dto: AnalyticsQueryDto, userId: string) {
    await this.ensurePageOwnership(dto.pageId, userId);
    const { startDate, endDate } = this.getDateRange(dto);
    const where = {
      pageId: dto.pageId,
      createdAt: { gte: startDate, lte: endDate },
    };

    const [total, eventTypeCounts, dailyViews, buttonClickCounts]: AnalyticsAggregationResults = await Promise.all([
      this.prisma.analyticsEvent.count({ where }),
      this.prisma.analyticsEvent.groupBy({
        by: ['type'],
        where,
        _count: { _all: true },
      }),
      this.prisma.$queryRaw<{ date: string; count: number }[]>`
        SELECT TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS "date",
               COUNT(*)::int AS "count"
        FROM "analytics_events"
        WHERE "pageId" = ${dto.pageId}
          AND "type" = 'PAGE_VIEW'
          AND "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY DATE_TRUNC('day', "createdAt") ASC
      `,
      this.prisma.analyticsEvent.groupBy({
        by: ['buttonKey'],
        where: {
          ...where,
          type: 'BUTTON_CLICK',
          buttonKey: { not: null },
        },
        _count: { _all: true },
      }),
    ]);

    const eventCounts = new Map(eventTypeCounts.map(({ type, _count }) => [type, _count._all]));
    const totalViews = eventCounts.get('PAGE_VIEW') ?? 0;
    const totalClicks = eventCounts.get('BUTTON_CLICK') ?? 0;
    const totalScans = eventCounts.get('TAG_SCAN') ?? 0;
    const clicksByButton = buttonClickCounts
      .filter(({ buttonKey }) => Boolean(buttonKey))
      .map(({ buttonKey, _count }) => ({ button: buttonKey!, count: _count._all }))
      .sort((a, b) => b.count - a.count);

    return {
      pageId: dto.pageId,
      total,
      totalViews,
      totalClicks,
      totalScans,
      viewsByDay: dailyViews,
      clicksByButton,
      byType: { PAGE_VIEW: totalViews, BUTTON_CLICK: totalClicks, TAG_SCAN: totalScans },
    };
  }

  async exportCsv(dto: AnalyticsQueryDto, userId: string): Promise<string> {
    await this.ensurePageOwnership(dto.pageId, userId);
    const { startDate, endDate } = this.getDateRange(dto);
    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        pageId: dto.pageId,
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, type: true, buttonKey: true, tagId: true },
    });
    const rows = [
      ['fecha', 'tipo', 'boton', 'tagId'],
      ...events.map((event: { createdAt: Date; type: string; buttonKey: string | null; tagId: string | null }) => [
        event.createdAt.toISOString(),
        event.type,
        event.buttonKey,
        event.tagId,
      ]),
    ];

    return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')}`;
  }

  private async ensurePageOwnership(pageId: string, userId: string): Promise<void> {
    const page = await this.prisma.page.findFirst({
      where: { id: pageId, business: { is: { ownerId: userId } } },
      select: { id: true },
    });
    if (!page) throw new NotFoundException('Página no encontrada');
  }

  private getDateRange(dto: AnalyticsQueryDto): { startDate: Date; endDate: Date } {
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();
    const rangeDays = dto.rangeDays ?? DEFAULT_ANALYTICS_RANGE_DAYS;
    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : new Date(endDate.getTime() - rangeDays * MS_PER_DAY);
    if (startDate > endDate || endDate.getTime() - startDate.getTime() > MAX_ANALYTICS_RANGE_DAYS * MS_PER_DAY) {
      throw new BadRequestException(`El rango de analíticas no puede superar ${MAX_ANALYTICS_RANGE_DAYS} días`);
    }
    return { startDate, endDate };
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

  /**
   * Cron job que se ejecuta cada noche a las 3 AM para eliminar eventos antiguos.
   * Elimina eventos mayores a 12 meses automáticamente.
   */
  @Cron('0 3 * * *')
  async autoPruneEvents() {
    const logger = new Logger('AnalyticsService');
    logger.log('Iniciando pruning automático de eventos antiguos...');
    try {
      const result = await this.pruneEvents(12);
      logger.log(`Pruning completado: ${result.deleted} eventos eliminados (corte: ${result.cutoffDate})`);
    } catch (error) {
      logger.error('Error al hacer pruning de eventos', error);
    }
  }
}
