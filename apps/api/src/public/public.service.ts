import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import { RecordEventDto } from './dto/record-event.dto';

/**
 * PublicService - Maneja los endpoints públicos sin autenticación.
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo gestiona resolución NFC y tracking de eventos.
 * - Dependency Inversion: Depende de PrismaClient a través de inyección.
 */
@Injectable()
export class PublicService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  /**
   * Resuelve un token NFC y devuelve la información de la página asignada.
   *
   * Flujo:
   * 1. Buscar etiqueta por token
   * 2. Verificar que la etiqueta esté activa
   * 3. Buscar asignación activa (sin endedAt)
   * 4. Obtener página y negocio
   * 5. Verificar que el negocio esté activo
   * 6. Registrar evento TAG_SCAN
   * 7. Devolver información de redirección
   *
   * @param token - Token único de la etiqueta NFC
   * @returns Información de la página para redirección o null si no hay asignación
   */
  async resolveNfcToken(token: string) {
    // Buscar la etiqueta por token
    const tag = await this.prisma.nfcTag.findUnique({ where: { token } });
    if (!tag) {
      return { error: 'Etiqueta no encontrada', statusCode: 404 };
    }

    // Verificar que la etiqueta esté activa
    if (tag.status !== 'ACTIVE') {
      return { error: 'Etiqueta no activa', statusCode: 400 };
    }

    // Buscar asignación activa (sin endedAt)
    const assignment = await this.prisma.tagAssignment.findFirst({
      where: { tagId: tag.id, endedAt: null },
      include: {
        page: {
          include: {
            business: true,
          },
        },
      },
    });

    // Si no hay asignación, devolver información para pantalla de etiqueta sin asignación
    if (!assignment) {
      return { error: 'Etiqueta sin asignación', statusCode: 404 };
    }

    const { page } = assignment;
    const business = page.business;

    // Verificar que el negocio esté activo
    if (business.status !== 'ACTIVE') {
      return { error: 'Negocio no activo', statusCode: 400 };
    }

    // Verificar que la página tenga una versión publicada
    if (!page.publishedVersionId) {
      return { error: 'Página sin versión publicada', statusCode: 400 };
    }

    // Obtener la versión publicada
    const publishedVersion = await this.prisma.pageVersion.findUnique({
      where: { id: page.publishedVersionId },
    });

    if (!publishedVersion) {
      return { error: 'Versión publicada no encontrada', statusCode: 400 };
    }

    // Registrar evento TAG_SCAN
    await this.prisma.analyticsEvent.create({
      data: {
        pageId: page.id,
        tagId: tag.id,
        type: 'TAG_SCAN',
      },
    });

    // Devolver información para redirección
    return {
      redirectUrl: `/p/${page.slug}`,
      page: {
        id: page.id,
        slug: page.slug,
      },
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
      },
      publishedVersion,
    };
  }

  /**
   * Registra un evento de analíticas sin autenticación.
   *
   * Permite registrar PAGE_VIEW, BUTTON_CLICK y TAG_SCAN desde el frontend
   * público sin necesidad de autenticación.
   *
   * @param dto - Datos del evento a registrar
   * @returns El evento creado con ID generado
   */
  async recordEvent(dto: RecordEventDto) {
    // Verificar que la página exista
    const page = await this.prisma.page.findUnique({ where: { id: dto.pageId } });
    if (!page) {
      throw new NotFoundException('Página no encontrada');
    }

    // Registrar el evento
    const event = await this.prisma.analyticsEvent.create({
      data: {
        pageId: dto.pageId,
        tagId: dto.tagId,
        type: dto.type,
        buttonKey: dto.buttonKey,
        metadata: dto.metadata as any,
      },
    });

    return {
      id: event.id,
      type: event.type,
      pageId: event.pageId,
      createdAt: event.createdAt,
    };
  }
}
