import { ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';
import { AccessControlService } from '../../authorization/access-control.service.js';

describe('AccessControlService', () => {
  const business = { id: 'business-1', ownerId: 'owner-1' };
  let prisma: {
    business: { findUnique: ReturnType<typeof vi.fn> };
    businessMembership: { findUnique: ReturnType<typeof vi.fn> };
  };
  let service: AccessControlService;

  beforeEach(() => {
    prisma = {
      business: { findUnique: vi.fn().mockResolvedValue(business) },
      businessMembership: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    service = new AccessControlService(prisma as unknown as PrismaClient);
  });

  it('resolves the owner from Business.ownerId without relying on a membership row', async () => {
    await expect(service.requireBusinessRole('business-1', { userId: 'owner-1' }, ['OWNER']))
      .resolves.toBe('OWNER');
    expect(prisma.businessMembership.findUnique).not.toHaveBeenCalled();
  });

  it('loads the current membership role for each authorization check', async () => {
    prisma.businessMembership.findUnique.mockResolvedValue({ businessId: 'business-1', role: 'EDITOR' });

    await expect(service.requireBusinessRole('business-1', { userId: 'editor-1' }, ['EDITOR']))
      .resolves.toBe('EDITOR');
    await expect(service.requireBusinessRole('business-1', { userId: 'editor-1' }, ['ADMIN']))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.businessMembership.findUnique).toHaveBeenCalledTimes(2);
  });

  it('grants global ADMIN access without looking up a business membership', async () => {
    await expect(service.requireBusinessRole(
      'business-1',
      { userId: 'admin-1', role: 'ADMIN' },
      ['OWNER'],
    )).resolves.toBe('GLOBAL_ADMIN');
    expect(prisma.businessMembership.findUnique).not.toHaveBeenCalled();
  });

  it('allows global ADMIN to manage business memberships', async () => {
    await expect(service.requireBusinessOwner('business-1', { userId: 'admin-1', role: 'ADMIN' }))
      .resolves.toBeUndefined();
  });

  it('does not allow business members to manage memberships', async () => {
    prisma.businessMembership.findUnique.mockResolvedValue({ businessId: 'business-1', role: 'ADMIN' });

    await expect(service.requireBusinessOwner('business-1', { userId: 'member-1', role: 'USER' }))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not allow a membership in a different business to grant access', async () => {
    prisma.businessMembership.findUnique.mockResolvedValue({ businessId: 'other-business', role: 'ADMIN' });

    await expect(service.requireBusinessRole('business-1', { userId: 'member-1' }, ['ADMIN']))
      .rejects.toBeInstanceOf(ForbiddenException);
  });
});