import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import { CreateNfcTagDto } from './dto/create-nfc-tag.dto';
import { AssignTagDto } from './dto/assign-tag.dto';

/**
 * NfcTagsService - Gestiona las etiquetas NFC de un negocio.
 */
@Injectable()
export class NfcTagsService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(businessId: string, dto: CreateNfcTagDto) {
    const token = dto.token || Math.random().toString(36).substring(2, 15);
    return this.prisma.nfcTag.create({
      data: { businessId, token, status: 'INVENTORY' },
    });
  }

  async findAll(businessId: string, userId: string) {
    if (businessId) {
      const business = await this.prisma.business.findUnique({ where: { id: businessId } });
      if (!business || business.ownerId !== userId) {
        throw new ForbiddenException('No tienes permiso para ver este negocio');
      }
      return this.prisma.nfcTag.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
      });
    }
    const businesses = await this.prisma.business.findMany({ where: { ownerId: userId } });
    const businessIds = businesses.map((b: any) => b.id);
    return this.prisma.nfcTag.findMany({
      where: { businessId: { in: businessIds } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(businessId: string, tagId: string) {
    const tag = await this.prisma.nfcTag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('Etiqueta no encontrada');
    if (tag.businessId !== businessId) throw new ForbiddenException('No tienes permiso');
    return tag;
  }

  async assign(businessId: string, tagId: string, dto: AssignTagDto) {
    await this.verifyOwnership(businessId, tagId);
    await this.prisma.tagAssignment.create({
      data: { tagId, pageId: dto.pageId },
    });
    return this.prisma.nfcTag.update({
      where: { id: tagId },
      data: { status: 'ACTIVE' },
    });
  }

  async scan(tagId: string) {
    const tag = await this.prisma.nfcTag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('Etiqueta no encontrada');

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

  private async verifyOwnership(businessId: string, tagId: string) {
    const tag = await this.prisma.nfcTag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('Etiqueta no encontrada');
    if (tag.businessId !== businessId) throw new ForbiddenException('No tienes permiso');
  }
}
