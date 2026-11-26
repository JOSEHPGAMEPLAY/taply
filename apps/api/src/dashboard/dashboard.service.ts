import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';
import { AccessControlService, AuthenticatedUser } from '../authorization/access-control.service.js';

export interface DashboardSummary {
  businesses: number;
  pages: number;
  nfcTags: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
    private readonly accessControl: AccessControlService,
  ) {}

  async getSummary(user: AuthenticatedUser): Promise<DashboardSummary> {
    const businessIds = await this.accessControl.getAccessibleBusinessIds(user);
    const [businesses, pages, nfcTags] = await Promise.all([
      this.prisma.business.count({ where: { id: { in: businessIds } } }),
      this.prisma.page.count({ where: { businessId: { in: businessIds } } }),
      this.prisma.nfcTag.count({ where: { businessId: { in: businessIds } } }),
    ]);

    return { businesses, pages, nfcTags };
  }
}