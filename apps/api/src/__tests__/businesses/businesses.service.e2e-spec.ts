import { BusinessesService } from '../../businesses/businesses.service.js';
import { vi } from 'vitest';

describe('BusinessesService.findAll', () => {
  let prisma: any;
  let accessControl: any;
  let service: BusinessesService;

  beforeEach(() => {
    prisma = {
      business: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'business-1', ownerId: 'owner-1', name: 'Business One' },
        ]),
      },
      businessMembership: {
        findUnique: vi.fn().mockResolvedValue(null),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findFirst: vi.fn().mockResolvedValue({ id: 'membership-1', businessId: 'business-1', userId: 'member-1' }),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    accessControl = {
      getAccessibleBusinessIds: vi.fn().mockResolvedValue(['business-1']),
      requireBusinessOwner: vi.fn().mockResolvedValue(undefined),
    };
    service = new BusinessesService(prisma, accessControl);
  });

  it('includes OWNER access for businesses owned by the user', async () => {
    const businesses = await service.findAll({ userId: 'owner-1', role: 'USER' });

    expect(businesses[0].accessRole).toBe('OWNER');
    expect(prisma.business.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['business-1'] } },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('includes the persisted membership role for assigned users', async () => {
    prisma.businessMembership.findUnique.mockResolvedValue({ businessId: 'business-1', role: 'ANALYST' });

    const businesses = await service.findAll({ userId: 'analyst-1', role: 'USER' });

    expect(businesses[0].accessRole).toBe('ANALYST');
  });

  it('marks all businesses as GLOBAL_ADMIN for a global administrator', async () => {
    const businesses = await service.findAll({ userId: 'platform-admin', role: 'ADMIN' });

    expect(businesses[0].accessRole).toBe('GLOBAL_ADMIN');
    expect(prisma.businessMembership.findUnique).not.toHaveBeenCalled();
  });

  it('scopes role updates to both the business and member IDs', async () => {
    await service.updateMemberRole(
      'business-1',
      'member-1',
      { userId: 'owner-1', role: 'USER' },
      { role: 'ANALYST' },
    );

    expect(prisma.businessMembership.updateMany).toHaveBeenCalledWith({
      where: { userId: 'member-1', businessId: 'business-1' },
      data: { role: 'ANALYST' },
    });
  });

  it('scopes member removal to both the business and member IDs', async () => {
    await service.removeMember('business-1', 'member-1', { userId: 'owner-1', role: 'USER' });

    expect(prisma.businessMembership.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'member-1', businessId: 'business-1' },
    });
  });
});