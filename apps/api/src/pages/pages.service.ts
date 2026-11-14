import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

/**
 * PagesService - Gestiona las páginas digitales de un negocio.
 *
 * Principios SOLID: SRP (solo páginas), DIP (Prisma inyectado), OCP (extensible).
 */
@Injectable()
export class PagesService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  /**
   * Crea una nueva página para un negocio.
   */
  async create(businessId: string, dto: CreatePageDto) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Negocio no encontrado');

    // Crear página y versión inicial en una transacción
    const page = await this.prisma.$transaction(async (tx: PrismaClient) => {
      const page = await tx.page.create({
        data: {
          businessId,
          slug: dto.slug,
          templateId: dto.templateId,
          status: 'DRAFT',
        },
      });

      // Crear versión inicial
      await tx.pageVersion.create({
        data: {
          pageId: page.id,
          status: 'DRAFT',
          config: {},
          buttons: [],
        },
      });

      return page;
    });

    return page;
  }

  /**
   * Lista todas las páginas de un negocio.
   */
  async findAll(businessId: string) {
    return this.prisma.page.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: { publishedVersion: true },
    });
  }

  /**
   * Obtiene una página por ID verificando ownership.
   */
  async findOne(businessId: string, pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Página no encontrada');
    if (page.businessId !== businessId) throw new ForbiddenException('No tienes permiso');
    return page;
  }

  /**
   * Actualiza una página.
   */
  async update(businessId: string, pageId: string, dto: UpdatePageDto) {
    await this.verifyOwnership(businessId, pageId);
    return this.prisma.page.update({ where: { id: pageId }, data: dto });
  }

  /**
   * Elimina una página.
   */
  async remove(businessId: string, pageId: string) {
    await this.verifyOwnership(businessId, pageId);
    await this.prisma.page.delete({ where: { id: pageId } });
  }

  /**
   * Publica una versión de la página.
   */
  async publish(businessId: string, pageId: string) {
    await this.verifyOwnership(businessId, pageId);

    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new Error('Página no encontrada');

    // Obtener la versión más reciente en DRAFT
    const version = await this.prisma.pageVersion.findFirst({
      where: { pageId, status: 'DRAFT' },
      orderBy: { createdAt: 'desc' },
    });

    if (!version) throw new BadRequestException('No hay versión en borrador para publicar');

    // Marcar versión anterior como SUPERSEDED si existe
    if (page.publishedVersionId) {
      await this.prisma.pageVersion.update({
        where: { id: page.publishedVersionId },
        data: { status: 'SUPERSEDED' },
      });
    }

    // Publicar la nueva versión
    await this.prisma.pageVersion.update({
      where: { id: version.id },
      data: { status: 'PUBLISHED' },
    });

    return this.prisma.page.update({
      where: { id: pageId },
      data: { publishedVersionId: version.id, status: 'PUBLISHED' },
    });
  }

  private async verifyOwnership(businessId: string, pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Página no encontrada');
    if (page.businessId !== businessId) throw new ForbiddenException('No tienes permiso');
  }
}
