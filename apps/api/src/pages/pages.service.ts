import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';

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
    const businessIds = businesses.map((b: any) => b.id);
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
   * Si la página está publicada, los botones se actualizan en la versión PUBLISHED directamente.
   */
  async update(businessId: string, pageId: string, dto: UpdatePageDto) {
    await this.verifyOwnership(businessId, pageId);

    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Página no encontrada');

    // Si se actualizan botones, actualizar la versión correcta según el estado
    if (dto.buttons !== undefined) {
      if (page.status === 'PUBLISHED' && page.publishedVersionId) {
        // Si está publicada, actualizar directamente la versión publicada
        await this.prisma.pageVersion.update({
          where: { id: page.publishedVersionId },
          data: { buttons: dto.buttons as any },
        });
      } else {
        // Si no está publicada, actualizar la versión DRAFT más reciente
        const draftVersion = await this.prisma.pageVersion.findFirst({
          where: { pageId, status: 'DRAFT' },
          orderBy: { createdAt: 'desc' },
        });

        if (draftVersion) {
          await this.prisma.pageVersion.update({
            where: { id: draftVersion.id },
            data: { buttons: dto.buttons as any },
          });
        }
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
   * Busca versión DRAFT primero, si no encuentra, busca SUPERSEDED más reciente y la reactiva.
   */
  async publish(businessId: string, pageId: string) {
    await this.verifyOwnership(businessId, pageId);

    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new Error('Página no encontrada');

    // Obtener la versión más reciente en DRAFT
    let version = await this.prisma.pageVersion.findFirst({
      where: { pageId, status: 'DRAFT' },
      orderBy: { createdAt: 'desc' },
    });

    // Si no hay DRAFT, buscar la versión SUPERSEDED más reciente y reactivarla
    if (!version) {
      version = await this.prisma.pageVersion.findFirst({
        where: { pageId, status: 'SUPERSEDED' },
        orderBy: { createdAt: 'desc' },
      });

      if (!version) throw new BadRequestException('No hay versión para publicar');
    }

    // Marcar versión anterior como SUPERSEDED si existe
    if (page.publishedVersionId && page.publishedVersionId !== version.id) {
      await this.prisma.pageVersion.update({
        where: { id: page.publishedVersionId },
        data: { status: 'SUPERSEDED' },
      });
    }

    // Publicar la versión
    await this.prisma.pageVersion.update({
      where: { id: version.id },
      data: { status: 'PUBLISHED' },
    });

    return this.prisma.page.update({
      where: { id: pageId },
      data: { publishedVersionId: version.id, status: 'PUBLISHED' },
    });
  }

  /**
   * Despublica una página, cambiando su estado a DRAFT y marcando la versión publicada como SUPERSEDED.
   * Crea una nueva versión DRAFT para que publish() pueda encontrarla al reactivar.
   */
  async unpublish(businessId: string, pageId: string) {
    await this.verifyOwnership(businessId, pageId);

    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Página no encontrada');
    if (page.status !== 'PUBLISHED') throw new BadRequestException('La página no está publicada');

    // Marcar la versión publicada actual como SUPERSEDED
    let publishedConfig = {};
    let publishedButtons = [];
    if (page.publishedVersionId) {
      const publishedVersion = await this.prisma.pageVersion.findUnique({
        where: { id: page.publishedVersionId },
      });
      if (publishedVersion) {
        publishedConfig = publishedVersion.config || {};
        publishedButtons = publishedVersion.buttons || [];
        await this.prisma.pageVersion.update({
          where: { id: page.publishedVersionId },
          data: { status: 'SUPERSEDED' },
        });
      }
    }

    // Crear una nueva versión DRAFT con los datos de la versión publicada
    await this.prisma.pageVersion.create({
      data: {
        pageId,
        status: 'DRAFT',
        config: publishedConfig as any,
        buttons: publishedButtons as any,
      },
    });

    // Cambiar el estado de la página a DRAFT y quitar la versión publicada
    return this.prisma.page.update({
      where: { id: pageId },
      data: { status: 'DRAFT', publishedVersionId: null },
    });
  }

  /**
   * Cambia el estado de la página (DRAFT, PUBLISHED, PAUSED, ARCHIVED).
   */
  async updateStatus(businessId: string, pageId: string, status: string) {
    await this.verifyOwnership(businessId, pageId);

    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Página no encontrada');

    // Validar el estado
    const validStatuses = ['DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
    }

    // Si cambia a PUBLISHED, ejecutar publish
    if (status === 'PUBLISHED' && page.status !== 'PUBLISHED') {
      return this.publish(businessId, pageId);
    }

    // Si cambia de PUBLISHED a otro estado, ejecutar unpublish primero
    if (page.status === 'PUBLISHED' && status !== 'PUBLISHED') {
      await this.unpublish(businessId, pageId);
    }

    // Actualizar el estado de la página
    return this.prisma.page.update({
      where: { id: pageId },
      data: { status: status as any },
    });
  }

  /**
   * Verifica si un slug está disponible para un negocio.
   * Retorna true si el slug no existe, false si ya está en uso.
   */
  async checkSlugAvailable(businessId: string, slug: string): Promise<boolean> {
    const existing = await this.prisma.page.findUnique({
      where: { businessId_slug: { businessId, slug } },
    });
    return !existing;
  }

  private async verifyOwnership(businessId: string, pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Página no encontrada');
    if (page.businessId !== businessId) throw new ForbiddenException('No tienes permiso');
  }
}
