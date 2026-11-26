import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
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

    // Totales por tipo de evento
    const totalViews = events.filter((e: any) => e.type === 'PAGE_VIEW').length;
    const totalClicks = events.filter((e: any) => e.type === 'BUTTON_CLICK').length;
    const totalScans = events.filter((e: any) => e.type === 'TAG_SCAN').length;

    // Visitas agrupadas por día
    const viewsByDayMap: Record<string, number> = {};
    events
      .filter((e: any) => e.type === 'PAGE_VIEW')
      .forEach((e: any) => {
        const day = e.createdAt.toISOString().slice(0, 10);
        viewsByDayMap[day] = (viewsByDayMap[day] || 0) + 1;
      });
    const viewsByDay = Object.entries(viewsByDayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Clics agrupados por botón
    const clicksByButtonMap: Record<string, number> = {};
    events
      .filter((e: any) => e.type === 'BUTTON_CLICK' && e.buttonKey)
      .forEach((e: any) => {
        const key = e.buttonKey || 'unknown';
        clicksByButtonMap[key] = (clicksByButtonMap[key] || 0) + 1;
      });
    const clicksByButton = Object.entries(clicksByButtonMap)
      .map(([button, count]) => ({ button, count }))
      .sort((a, b) => b.count - a.count);

    return {
      pageId: dto.pageId,
      total: events.length,
      totalViews,
      totalClicks,
      totalScans,
      viewsByDay,
      clicksByButton,
      byType: { PAGE_VIEW: totalViews, BUTTON_CLICK: totalClicks, TAG_SCAN: totalScans },
    };
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
