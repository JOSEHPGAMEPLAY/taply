import { NfcTagsService } from '../../nfc-tags/nfc-tags.service.js';
import { vi } from 'vitest';

describe('NfcTagsService.findAll', () => {
  it('returns the active assignment used by the QR action', async () => {
    const prisma = {
      nfcTag: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'tag-1',
            businessId: 'business-1',
            token: 'token-1',
            assignments: [{ pageId: 'page-1', page: { slug: 'public-page' } }],
          },
        ]),
      },
    };
    const accessControl = {
      requireBusinessRole: vi.fn().mockResolvedValue('VIEWER'),
      getAccessibleBusinessIds: vi.fn(),
    };
    const service = new NfcTagsService(prisma as any, accessControl as any);

    const tags = await service.findAll('business-1', { userId: 'viewer-1', role: 'USER' });

    expect(tags[0]).toMatchObject({
      id: 'tag-1',
      assignedPageId: 'page-1',
      assignment: { pageId: 'page-1', pageSlug: 'public-page' },
    });
    expect(prisma.nfcTag.findMany).toHaveBeenCalledWith({
      where: { businessId: 'business-1' },
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          where: { endedAt: null },
          orderBy: { startedAt: 'desc' },
          take: 1,
          include: { page: { select: { slug: true } } },
        },
      },
    });
  });
});