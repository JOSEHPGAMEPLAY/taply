import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';

export interface DashboardSummary {
  businesses: number;
  pages: number;
  nfcTags: number;
}

@Injectable()
export class DashboardService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async getSummary(userId: string): Promise<DashboardSummary> {
    const [businesses, pages, nfcTags] = await Promise.all([
      this.prisma.business.count({ where: { ownerId: userId } }),
      this.prisma.page.count({ where: { business: { ownerId: userId } } }),
      this.prisma.nfcTag.count({ where: { business: { ownerId: userId } } }),
    ]);

    return { businesses, pages, nfcTags };
  }
}