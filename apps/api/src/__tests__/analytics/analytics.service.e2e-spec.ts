import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from '../../analytics/analytics.service.js';
import {
  AnalyticsQueryDto,
  DEFAULT_ANALYTICS_RANGE_DAYS,
  MAX_ANALYTICS_RANGE_DAYS,
} from '../../analytics/dto/analytics-query.dto.js';
import { vi } from 'vitest';

describe('AnalyticsService.getStats', () => {
  const pageId = 'page-1';
  let prisma: {
    analyticsEvent: {
      count: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
    $queryRaw: ReturnType<typeof vi.fn>;
  };
  let service: AnalyticsService;

  beforeEach(() => {
    prisma = {
      analyticsEvent: {
        count: vi.fn(),
        groupBy: vi.fn(),
      },
      $queryRaw: vi.fn(),
    };
    service = new AnalyticsService(prisma as unknown as PrismaClient);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the aggregated stats for events within the requested range', async () => {
    prisma.analyticsEvent.count.mockResolvedValue(6);
    prisma.analyticsEvent.groupBy
      .mockResolvedValueOnce([
        { type: 'PAGE_VIEW', _count: { _all: 3 } },
        { type: 'BUTTON_CLICK', _count: { _all: 2 } },
        { type: 'TAG_SCAN', _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([
        { buttonKey: 'menu', _count: { _all: 1 } },
        { buttonKey: 'contact', _count: { _all: 2 } },
      ]);
    prisma.$queryRaw.mockResolvedValue([
      { date: '2025-01-10', count: 1 },
      { date: '2025-01-11', count: 2 },
    ]);

    const dto = Object.assign(new AnalyticsQueryDto(), {
      pageId,
      startDate: '2025-01-10T00:00:00.000Z',
      endDate: '2025-01-12T00:00:00.000Z',
    });
    const stats = await service.getStats(dto);
    const expectedWhere = {
      pageId,
      createdAt: {
        gte: new Date(dto.startDate!),
        lte: new Date(dto.endDate!),
      },
    };

    expect(stats).toEqual({
      pageId,
      total: 6,
      totalViews: 3,
      totalClicks: 2,
      totalScans: 1,
      viewsByDay: [
        { date: '2025-01-10', count: 1 },
        { date: '2025-01-11', count: 2 },
      ],
      clicksByButton: [
        { button: 'contact', count: 2 },
        { button: 'menu', count: 1 },
      ],
      byType: { PAGE_VIEW: 3, BUTTON_CLICK: 2, TAG_SCAN: 1 },
    });
    expect(prisma.analyticsEvent.count).toHaveBeenCalledWith({ where: expectedWhere });
    expect(prisma.analyticsEvent.groupBy).toHaveBeenNthCalledWith(1, {
      by: ['type'],
      where: expectedWhere,
      _count: { _all: true },
    });
    expect(prisma.analyticsEvent.groupBy).toHaveBeenNthCalledWith(2, {
      by: ['buttonKey'],
      where: {
        ...expectedWhere,
        type: 'BUTTON_CLICK',
        buttonKey: { not: null },
      },
      _count: { _all: true },
    });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    const [queryTemplate, ...queryParameters] = prisma.$queryRaw.mock.calls[0];
    const queryText = (queryTemplate as TemplateStringsArray).join('?');
    expect(queryText).toContain('FROM "analytics_events"');
    expect(queryText).toContain('WHERE "pageId" = ?');
    expect(queryText).toContain('"createdAt" >= ?');
    expect(queryText).toContain('"createdAt" <= ?');
    expect(queryText).toContain('GROUP BY DATE_TRUNC');
    expect(queryParameters).toEqual([
      pageId,
      new Date(dto.startDate!),
      new Date(dto.endDate!),
    ]);
  });

  it('should return empty stats and use the configured bounded default range when no events match', async () => {
    const now = new Date('2025-01-31T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);
    prisma.analyticsEvent.count.mockResolvedValue(0);
    prisma.analyticsEvent.groupBy.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    prisma.$queryRaw.mockResolvedValue([]);

    const dto = Object.assign(new AnalyticsQueryDto(), { pageId, rangeDays: 7 });
    const stats = await service.getStats(dto);

    expect(stats).toEqual({
      pageId,
      total: 0,
      totalViews: 0,
      totalClicks: 0,
      totalScans: 0,
      viewsByDay: [],
      clicksByButton: [],
      byType: { PAGE_VIEW: 0, BUTTON_CLICK: 0, TAG_SCAN: 0 },
    });
    expect(prisma.analyticsEvent.count).toHaveBeenCalledWith({
      where: {
        pageId,
        createdAt: {
          gte: new Date('2025-01-24T12:00:00.000Z'),
          lte: now,
        },
      },
    });
    expect(new AnalyticsQueryDto().rangeDays).toBe(DEFAULT_ANALYTICS_RANGE_DAYS);
  });

  it('should reject explicit date ranges wider than the configured maximum', async () => {
    const dto = Object.assign(new AnalyticsQueryDto(), {
      pageId,
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2025-01-01T00:00:00.000Z',
    });

    await expect(service.getStats(dto)).rejects.toThrow(
      `El rango de analíticas no puede superar ${MAX_ANALYTICS_RANGE_DAYS} días`,
    );
    expect(prisma.analyticsEvent.count).not.toHaveBeenCalled();
    expect(prisma.analyticsEvent.groupBy).not.toHaveBeenCalled();
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });
});