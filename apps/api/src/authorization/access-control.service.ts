import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';

export const BUSINESS_MEMBER_ROLES = ['ADMIN', 'EDITOR', 'ANALYST', 'VIEWER'] as const;
export type BusinessMemberRole = (typeof BUSINESS_MEMBER_ROLES)[number];
export type BusinessAccessRole = 'OWNER' | BusinessMemberRole | 'GLOBAL_ADMIN';

export interface AuthenticatedUser {
  userId: string;
  role?: string;
}

@Injectable()
export class AccessControlService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async requireBusinessRole(
    businessId: string,
    user: AuthenticatedUser,
    allowedRoles: readonly BusinessAccessRole[],
  ): Promise<BusinessAccessRole> {
    if (!businessId) throw new BadRequestException('businessId es requerido');
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    });
    if (!business) throw new NotFoundException('Negocio no encontrado');

    if (user.role === 'ADMIN') return 'GLOBAL_ADMIN';

    let role: BusinessAccessRole | undefined;
    if (business.ownerId === user.userId) {
      role = 'OWNER';
    } else {
      const membership = await this.prisma.businessMembership.findUnique({
        where: { userId: user.userId },
        select: { businessId: true, role: true },
      });
      if (membership?.businessId === businessId) role = membership.role as BusinessMemberRole;
    }

    if (!role || !allowedRoles.includes(role)) {
      throw new ForbiddenException('No tienes permiso para acceder a este negocio');
    }
    return role;
  }

  async requireBusinessOwner(businessId: string, user: AuthenticatedUser): Promise<void> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });
    if (!business) throw new NotFoundException('Negocio no encontrado');
    if (business.ownerId !== user.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Solo el propietario puede administrar los miembros del negocio');
    }
  }

  assertGlobalAdmin(user: AuthenticatedUser): void {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador global puede realizar esta acción');
    }
  }

  async getAccessibleBusinessIds(
    user: AuthenticatedUser,
    allowedRoles?: readonly BusinessAccessRole[],
  ): Promise<string[]> {
    if (user.role === 'ADMIN') {
      const businesses = await this.prisma.business.findMany({ select: { id: true } });
      return businesses.map((business: { id: string }) => business.id);
    }

    const [ownedBusinesses, memberships] = await Promise.all([
      allowedRoles && !allowedRoles.includes('OWNER')
        ? Promise.resolve([])
        : this.prisma.business.findMany({
            where: { ownerId: user.userId },
            select: { id: true },
          }),
      this.prisma.businessMembership.findMany({
        where: {
          userId: user.userId,
          ...(allowedRoles ? { role: { in: allowedRoles.filter((role) => role !== 'OWNER' && role !== 'GLOBAL_ADMIN') } } : {}),
        },
        select: { businessId: true },
      }),
    ]);

    return [...new Set([
      ...ownedBusinesses.map((business: { id: string }) => business.id),
      ...memberships.map(({ businessId }: { businessId: string }) => businessId),
    ])];
  }
}