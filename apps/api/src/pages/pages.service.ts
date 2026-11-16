import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
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
   * Si el slug ya existe para ese negocio, retorna 409 Conflict.
   */
  async create(businessId: string, dto: CreatePageDto) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Negocio no encontrado');

    // Verificar que el slug no exista ya para este negocio
    const existing = await this.prisma.page.findUnique({
      where: { businessId_slug: { businessId, slug: dto.slug } },
    });
    if (existing) {
      throw new ConflictException(`Ya existe una página con el slug "${dto.slug}" para este negocio. Elige otro slug.`);
    }

    // Crear página y versión inicial en una transacción
    const page = await this.prisma.$transaction(async (tx: any) => {
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
   * Lista todas las páginas. Si businessId está vacío, retorna todas las páginas
   * de los negocios del usuario autenticado (filtrado por ownerId en el controller).
   */
  async findAll(businessId: string, userId: string) {
    if (businessId) {
      // Verificar que el negocio pertenece al usuario
      const business = await this.prisma.business.findUnique({ where: { id: businessId } });
      if (!business || business.ownerId !== userId) {
        throw new ForbiddenException('No tienes permiso para ver este negocio');
      }
      return this.prisma.page.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        include: { versions: true },
      });
    }
    // Sin filtro: retornar páginas de todos los negocios del usuario
    const businesses = await this.prisma.business.findMany({ where: { ownerId: userId } });
    const businessIds = businesses.map((b) => b.id);
    return this.prisma.page.findMany({
      where: { businessId: { in: businessIds } },
      orderBy: { createdAt: 'desc' },
      include: { versions: true },
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

    // Si se actualizan botones, actualizar la versión DRAFT más reciente
    if (dto.buttons !== undefined) {
      const draftVersion = await this.prisma.pageVersion.findFirst({
        where: { pageId, status: 'DRAFT' },
        orderBy: { createdAt: 'desc' },
      });

      if (draftVersion) {
        await this.prisma.pageVersion.update({
          where: { id: draftVersion.id },
          data: { buttons: dto.buttons },
        });
      }
    }

    const updateData: any = {};
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.templateId !== undefined) updateData.templateId = dto.templateId;

    return this.prisma.page.update({ where: { id: pageId }, data: updateData });
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
