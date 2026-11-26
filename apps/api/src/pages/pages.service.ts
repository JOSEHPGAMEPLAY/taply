import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';
import { AccessControlService, AuthenticatedUser, BusinessAccessRole } from '../authorization/access-control.service.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';

/**
 * PagesService - Gestiona las páginas digitales de un negocio.
 *
 * Principios SOLID: SRP (solo páginas), DIP (Prisma inyectado), OCP (extensible).
 */
@Injectable()
export class PagesService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
    private readonly accessControl: AccessControlService,
  ) {}

  /**
   * Crea una nueva página para un negocio.
   * Si el slug ya existe para ese negocio, retorna 409 Conflict.
   * Si se asigna un template, copia su config a la PageVersion inicial.
   */
  async create(businessId: string, dto: CreatePageDto, user: AuthenticatedUser) {
    await this.accessControl.requireBusinessRole(businessId, user, ['OWNER', 'ADMIN', 'EDITOR']);
    // Verificar que el slug no exista ya para este negocio
    const existing = await this.prisma.page.findUnique({
      where: { businessId_slug: { businessId, slug: dto.slug } },
    });
    if (existing) {
      throw new ConflictException(`Ya existe una página con el slug "${dto.slug}" para este negocio. Elige otro slug.`);
    }

    // Si se asigna un template, obtener su config para copiarla a la versión
    let versionConfig: Record<string, unknown> = {};
    if (dto.templateId) {
      const template = await this.prisma.template.findUnique({ where: { id: dto.templateId } });
      if (!template) throw new NotFoundException('Plantilla no encontrada');
      versionConfig = { template: this.getTemplateConfig(template.config) };
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

      // Crear versión inicial con la config del template (si aplica)
      await tx.pageVersion.create({
        data: {
          pageId: page.id,
          status: 'DRAFT',
          config: versionConfig,
          buttons: [],
        },
      });

      return page;
    });

    return page;
  }

  /**
   * Lista todas las páginas accesibles para el usuario autenticado.
   */
  async findAll(businessId: string, user: AuthenticatedUser) {
    if (businessId) {
      await this.accessControl.requireBusinessRole(
        businessId,
        user,
        ['OWNER', 'ADMIN', 'EDITOR', 'ANALYST', 'VIEWER'],
      );
      return this.prisma.page.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        include: { versions: true },
      });
    }
    const businessIds = await this.accessControl.getAccessibleBusinessIds(user);
    return this.prisma.page.findMany({
      where: { businessId: { in: businessIds } },
      orderBy: { createdAt: 'desc' },
      include: { versions: true },
    });
  }

  /**
   * Obtiene una página por ID verificando ownership.
   */
  async findOne(businessId: string, pageId: string, user: AuthenticatedUser) {
    await this.requirePageAccess(businessId, pageId, user, ['OWNER', 'ADMIN', 'EDITOR', 'ANALYST', 'VIEWER']);
    return this.prisma.page.findUnique({
      where: { id: pageId },
      include: { versions: true },
    });
  }

  /**
   * Actualiza una página.
   * Si la página está publicada, los botones se actualizan en la versión PUBLISHED directamente.
   */
  async update(businessId: string, pageId: string, dto: UpdatePageDto, user: AuthenticatedUser) {
    const page = await this.requirePageAccess(businessId, pageId, user, ['OWNER', 'ADMIN', 'EDITOR']);
    const updateData: any = {};
    if (dto.slug !== undefined) {
      const existing = await this.prisma.page.findUnique({
        where: { businessId_slug: { businessId, slug: dto.slug } },
      });
      if (existing && existing.id !== pageId) {
        throw new ConflictException(`Ya existe una página con el slug "${dto.slug}" para este negocio. Elige otro slug.`);
      }
      updateData.slug = dto.slug;
    }

    let template: any = null;
    const templateChangeRequested = dto.templateId !== undefined;
    if (templateChangeRequested && dto.templateId !== null) {
      template = await this.prisma.template.findUnique({ where: { id: dto.templateId } });
      if (!template) throw new NotFoundException('Plantilla no encontrada');
      updateData.templateId = dto.templateId;
    } else if (templateChangeRequested) {
      updateData.templateId = null;
    }

    if (!templateChangeRequested && dto.buttons === undefined) {
      return this.prisma.page.update({ where: { id: pageId }, data: updateData });
    }

    return this.prisma.$transaction(async (tx: any) => {
      let draft = await tx.pageVersion.findFirst({
        where: { pageId, status: 'DRAFT' },
        orderBy: { createdAt: 'desc' },
      });

      if (!draft) {
        let baseVersion = page.publishedVersionId
          ? await tx.pageVersion.findUnique({ where: { id: page.publishedVersionId } })
          : null;
        if (!baseVersion) {
          baseVersion = await tx.pageVersion.findFirst({
            where: { pageId, status: 'PUBLISHED' },
            orderBy: { createdAt: 'desc' },
          });
        }
        draft = await tx.pageVersion.create({
          data: {
            pageId,
            status: 'DRAFT',
            config: baseVersion?.config ?? {},
            buttons: baseVersion?.buttons ?? [],
          },
        });
      }

      const versionData: any = {};
      if (templateChangeRequested) {
        const baseConfig = draft.config && typeof draft.config === 'object' && !Array.isArray(draft.config)
          ? { ...(draft.config as Record<string, unknown>) }
          : {};
        if (template) {
          versionData.config = { ...baseConfig, template: this.getTemplateConfig(template.config) };
        } else {
          delete baseConfig.template;
          versionData.config = baseConfig;
        }
      }
      if (dto.buttons !== undefined) versionData.buttons = dto.buttons as any;
      if (Object.keys(versionData).length > 0) {
        await tx.pageVersion.update({ where: { id: draft.id }, data: versionData });
      }

      return tx.page.update({ where: { id: pageId }, data: updateData });
    });
  }

  /**
   * Elimina una página.
   */
  async remove(businessId: string, pageId: string, user: AuthenticatedUser) {
    await this.requirePageAccess(businessId, pageId, user, ['OWNER', 'ADMIN', 'EDITOR']);
    await this.prisma.page.delete({ where: { id: pageId } });
  }

  /**
   * Publica el snapshot DRAFT actual, sin volver a cargar la configuración de la plantilla.
   */
  async publish(businessId: string, pageId: string, user: AuthenticatedUser) {
    await this.requirePageAccess(businessId, pageId, user, ['OWNER', 'ADMIN', 'EDITOR']);

    return this.prisma.$transaction(async (tx: any) => {
      const page = await tx.page.findUnique({ where: { id: pageId } });
      if (!page) throw new NotFoundException('Página no encontrada');

      let version = await tx.pageVersion.findFirst({
        where: { pageId, status: 'DRAFT' },
        orderBy: { createdAt: 'desc' },
      });
      if (!version) {
        version = await tx.pageVersion.findFirst({
          where: { pageId, status: 'SUPERSEDED' },
          orderBy: { createdAt: 'desc' },
        });
        if (!version) throw new BadRequestException('No hay versión para publicar');
      }

      if (page.publishedVersionId && page.publishedVersionId !== version.id) {
        await tx.pageVersion.update({
          where: { id: page.publishedVersionId },
          data: { status: 'SUPERSEDED' },
        });
      }

      await tx.pageVersion.update({
        where: { id: version.id },
        data: { status: 'PUBLISHED' },
      });

      return tx.page.update({
        where: { id: pageId },
        data: { publishedVersionId: version.id, status: 'PUBLISHED' },
      });
    });
  }

  /**
   * Despublica una página, cambiando su estado a DRAFT y marcando la versión publicada como SUPERSEDED.
   * Crea una nueva versión DRAFT para que publish() pueda encontrarla al reactivar.
   */
  async unpublish(businessId: string, pageId: string, user: AuthenticatedUser) {
    await this.requirePageAccess(businessId, pageId, user, ['OWNER', 'ADMIN', 'EDITOR']);

    return this.prisma.$transaction(async (tx: any) => {
      const page = await tx.page.findUnique({ where: { id: pageId } });
      if (!page) throw new NotFoundException('Página no encontrada');
      if (page.status !== 'PUBLISHED') throw new BadRequestException('La página no está publicada');

      let publishedConfig = {};
      let publishedButtons = [];
      if (page.publishedVersionId) {
        const publishedVersion = await tx.pageVersion.findUnique({
          where: { id: page.publishedVersionId },
        });
        if (publishedVersion) {
          publishedConfig = publishedVersion.config || {};
          publishedButtons = publishedVersion.buttons || [];
          await tx.pageVersion.update({
            where: { id: page.publishedVersionId },
            data: { status: 'SUPERSEDED' },
          });
        }
      }

      await tx.pageVersion.create({
        data: {
          pageId,
          status: 'DRAFT',
          config: publishedConfig as any,
          buttons: publishedButtons as any,
        },
      });

      return tx.page.update({
        where: { id: pageId },
        data: { status: 'DRAFT', publishedVersionId: null },
      });
    });
  }

  /**
   * Cambia el estado de la página (DRAFT, PUBLISHED, PAUSED, ARCHIVED).
   */
  async updateStatus(businessId: string, pageId: string, status: string, user: AuthenticatedUser) {

    // Validar el estado
    const validStatuses = ['DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
    }

    const allowedRoles: BusinessAccessRole[] = ['OWNER', 'ADMIN'];
    if (status === 'DRAFT' || status === 'PUBLISHED') allowedRoles.push('EDITOR');
    const page = await this.requirePageAccess(businessId, pageId, user, allowedRoles);

    // Si cambia a PUBLISHED, ejecutar publish
    if (status === 'PUBLISHED') {
      return page.status === 'PUBLISHED' ? page : this.publish(businessId, pageId, user);
    }

    // Si cambia de PUBLISHED a otro estado, ejecutar unpublish primero
    if (page.status === 'PUBLISHED' && status !== 'PUBLISHED') {
      await this.unpublish(businessId, pageId, user);
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
  async checkSlugAvailable(businessId: string, slug: string, user: AuthenticatedUser): Promise<boolean> {
    await this.accessControl.requireBusinessRole(
      businessId,
      user,
      ['OWNER', 'ADMIN', 'EDITOR', 'ANALYST', 'VIEWER'],
    );
    const existing = await this.prisma.page.findUnique({
      where: { businessId_slug: { businessId, slug } },
    });
    return !existing;
  }

  private async requirePageAccess(
    businessId: string,
    pageId: string,
    user: AuthenticatedUser,
    allowedRoles: readonly BusinessAccessRole[],
  ) {
    await this.accessControl.requireBusinessRole(businessId, user, allowedRoles);
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Página no encontrada');
    if (page.businessId !== businessId) throw new ForbiddenException('No tienes permiso');
    return page;
  }

  private getTemplateConfig(config: unknown): Record<string, unknown> {
    if (!config || typeof config !== 'object' || Array.isArray(config)) return {};
    const configObject = config as Record<string, unknown>;
    const templateConfig = configObject.template;
    if (templateConfig && typeof templateConfig === 'object' && !Array.isArray(templateConfig)) {
      return templateConfig as Record<string, unknown>;
    }

    return {
      ...(typeof configObject.backgroundColor === 'string' ? { bgColor: configObject.backgroundColor } : {}),
      ...(typeof configObject.accentColor === 'string' ? { primaryColor: configObject.accentColor } : {}),
      ...(typeof configObject.bgGradient === 'string' ? { bgGradient: configObject.bgGradient } : {}),
      ...(typeof configObject.buttonStyle === 'string' ? { buttonStyle: configObject.buttonStyle } : {}),
      ...(typeof configObject.logoUrl === 'string' ? { logoUrl: configObject.logoUrl } : {}),
    };
  }
}
