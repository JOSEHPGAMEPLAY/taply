import { vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { AdminService } from '../../admin/admin.service.js';

describe('Admin analytics overview', () => {
  it('runs independent counts concurrently and preserves the overview response', async () => {
    const pendingResolutions: Array<(value: number) => void> = [];
    const createPendingCount = () => vi.fn(() => new Promise<number>((resolve) => {
      pendingResolutions.push(resolve);
    }));

    const prisma = {
      user: { count: createPendingCount() },
      business: { count: createPendingCount() },
      page: { count: createPendingCount() },
      nfcTag: { count: createPendingCount() },
      analyticsEvent: { count: createPendingCount() },
    } as unknown as PrismaClient;
    const service = new AdminService(prisma, {} as never);

    const overviewPromise = service.getAnalyticsOverview();

    expect(pendingResolutions).toHaveLength(15);
    pendingResolutions.forEach((resolve, index) => resolve(index + 1));

    await expect(overviewPromise).resolves.toStrictEqual({
      users: { total: 1, active: 2, last30Days: 14 },
      businesses: { total: 3, active: 4, last30Days: 15 },
      pages: { total: 5, published: 6 },
      tags: { total: 7, active: 8 },
      events: { total: 9, pageViews: 10, buttonClicks: 11, tagScans: 12, last30Days: 13 },
    });
  });
});