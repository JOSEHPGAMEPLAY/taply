import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { vi } from 'vitest';
import { AuthModule } from '../../auth/auth.module.js';
import { DashboardModule } from '../../dashboard/dashboard.module.js';
import { PRISMA_CLIENT, PrismaModule } from '../../prisma/prisma.module.js';

describe('Dashboard summary (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;

  const prisma = {
    user: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'dashboard-owner-id',
        email: 'dashboard-owner@example.com',
        role: 'USER',
        status: 'ACTIVE',
      }),
    },
    businessMembership: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    business: {
      findUnique: vi.fn().mockResolvedValue({ id: 'business-1', ownerId: 'dashboard-owner-id' }),
      findMany: vi.fn().mockResolvedValue([{ id: 'business-1' }]),
      count: vi.fn().mockResolvedValue(2),
    },
    page: { count: vi.fn().mockResolvedValue(3) },
    nfcTag: { count: vi.fn().mockResolvedValue(4) },
    $disconnect: vi.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule, DashboardModule],
    })
      .overrideProvider(PRISMA_CLIENT)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    accessToken = moduleFixture.get(JwtService).sign({
      sub: 'dashboard-owner-id',
      email: 'dashboard-owner@example.com',
      role: 'USER',
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns resource counts for the authenticated user accessible businesses', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toStrictEqual({ businesses: 2, pages: 3, nfcTags: 4 });
    expect(prisma.business.count).toHaveBeenCalledWith({ where: { id: { in: ['business-1'] } } });
    expect(prisma.page.count).toHaveBeenCalledWith({ where: { businessId: { in: ['business-1'] } } });
    expect(prisma.nfcTag.count).toHaveBeenCalledWith({ where: { businessId: { in: ['business-1'] } } });
  });

  it('rejects requests without authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/dashboard/summary')
      .expect(401);
  });
});