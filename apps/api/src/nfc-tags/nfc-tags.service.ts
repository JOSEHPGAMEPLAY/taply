import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';
import { AccessControlService, AuthenticatedUser } from '../authorization/access-control.service.js';
import { CreateNfcTagDto } from './dto/create-nfc-tag.dto.js';
import { AssignTagDto } from './dto/assign-tag.dto.js';

/**
 * NfcTagsService - Gestiona las etiquetas NFC de un negocio.
 */
@Injectable()
export class NfcTagsService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
    private readonly accessControl: AccessControlService,
  ) {}

  async create(businessId: string, dto: CreateNfcTagDto, user: AuthenticatedUser) {
    await this.accessControl.requireBusinessRole(businessId, user, ['OWNER', 'ADMIN']);
    const token = dto.token || Math.random().toString(36).substring(2, 15);
    return this.prisma.nfcTag.create({
      data: { businessId, token, status: 'INVENTORY' },
    });
  }

  async findAll(businessId: string, user: AuthenticatedUser) {
    if (businessId) {
      await this.accessControl.requireBusinessRole(businessId, user, ['OWNER', 'ADMIN', 'VIEWER']);
      const tags = await this.prisma.nfcTag.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        include: this.activeAssignmentInclude,
      });
      return tags.map((tag: any) => this.formatTag(tag));
    }
    const businessIds = await this.accessControl.getAccessibleBusinessIds(user, ['OWNER', 'ADMIN', 'VIEWER']);
    const tags = await this.prisma.nfcTag.findMany({
      where: { businessId: { in: businessIds } },
      orderBy: { createdAt: 'desc' },
      include: this.activeAssignmentInclude,
    });
    return tags.map((tag: any) => this.formatTag(tag));
  }

  async findOne(businessId: string, tagId: string, user: AuthenticatedUser) {
    await this.accessControl.requireBusinessRole(businessId, user, ['OWNER', 'ADMIN', 'VIEWER']);
    const tag = await this.prisma.nfcTag.findUnique({
      where: { id: tagId },
      include: this.activeAssignmentInclude,
    });
    if (!tag) throw new NotFoundException('Etiqueta no encontrada');
    if (tag.businessId !== businessId) throw new ForbiddenException('No tienes permiso');
    return this.formatTag(tag);
  }

  async assign(businessId: string, tagId: string, dto: AssignTagDto, user: AuthenticatedUser) {
    await this.verifyTagAccess(businessId, tagId, user, ['OWNER', 'ADMIN']);
    const page = await this.prisma.page.findUnique({
      where: { id: dto.pageId },
      select: { businessId: true },
    });
    if (!page) throw new NotFoundException('Página no encontrada');
    if (page.businessId !== businessId) throw new ForbiddenException('La página pertenece a otro negocio');

    return this.prisma.$transaction(async (tx: any) => {
      await tx.tagAssignment.create({ data: { tagId, pageId: dto.pageId } });
      return tx.nfcTag.update({ where: { id: tagId }, data: { status: 'ACTIVE' } });
    });
  }

  async unassign(businessId: string, tagId: string, user: AuthenticatedUser) {
    await this.verifyTagAccess(businessId, tagId, user, ['OWNER', 'ADMIN']);

    return this.prisma.$transaction(async (tx: any) => {
      const { count } = await tx.tagAssignment.updateMany({
        where: { tagId, endedAt: null },
        data: { endedAt: new Date() },
      });

      if (count === 0) {
        throw new BadRequestException('La etiqueta no tiene una asignación activa');
      }

      return tx.nfcTag.update({
        where: { id: tagId },
        data: { status: 'INVENTORY' },
      });
    });
  }

  async remove(businessId: string, tagId: string, user: AuthenticatedUser) {
    await this.verifyTagAccess(businessId, tagId, user, ['OWNER', 'ADMIN']);
    await this.prisma.nfcTag.delete({ where: { id: tagId } });
    return { message: 'Etiqueta eliminada exitosamente' };
  }

  async scan(tagId: string, user: AuthenticatedUser) {
    const tag = await this.prisma.nfcTag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('Etiqueta no encontrada');
    await this.accessControl.requireBusinessRole(tag.businessId, user, ['OWNER', 'ADMIN']);

    const assignment = await this.prisma.tagAssignment.findFirst({
      where: { tagId, endedAt: null },
    });

    if (assignment) {
      await this.prisma.analyticsEvent.create({
        data: { pageId: assignment.pageId, tagId, type: 'TAG_SCAN' },
      });
    }

    return { scanned: true, tagId };
  }

  private async verifyTagAccess(
    businessId: string,
    tagId: string,
    user: AuthenticatedUser,
    allowedRoles: readonly ('OWNER' | 'ADMIN' | 'VIEWER')[],
  ) {
    await this.accessControl.requireBusinessRole(businessId, user, allowedRoles);
    const tag = await this.prisma.nfcTag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('Etiqueta no encontrada');
    if (tag.businessId !== businessId) throw new ForbiddenException('No tienes permiso');
    return tag;
  }

  private readonly activeAssignmentInclude = {
    assignments: {
      where: { endedAt: null },
      orderBy: { startedAt: 'desc' as const },
      take: 1,
      include: { page: { select: { slug: true } } },
    },
  };

  private formatTag(tag: any) {
    const { assignments, ...tagData } = tag;
    const assignment = assignments?.[0];
    return {
      ...tagData,
      assignedPageId: assignment?.pageId ?? null,
      assignment: assignment
        ? { pageId: assignment.pageId, pageSlug: assignment.page.slug }
        : undefined,
    };
  }
}
