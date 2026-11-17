import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';
import * as QRCode from 'qrcode';

/**
* Servicio para generar y gestionar códigos QR.
*
* Principios SOLID aplicados:
* - Single Responsibility: Solo maneja la lógica de códigos QR.
* - Dependency Inversion: Depende de PrismaService (abstracción).
*/
@Injectable()
export class QrService {
  /**
   * URL base del frontend para las páginas públicas.
   */
  private readonly publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  constructor(
    @Inject(PRISMA_CLIENT) private prisma: PrismaClient,
  ) {}

  /**
   * Genera un código QR para la URL pública de una página.
   * Si ya existe un QR para esa página, lo actualiza.
   *
   * @param pageId - ID de la página
   * @returns QR code con dataUrl y pageId
   */
  async generateQr(pageId: string) {
    // Verificar que la página existe
    const page = await this.prisma.page.findUnique({
      where: { id: pageId },
      include: {
        business: true,
      },
    });

    if (!page) {
      throw new NotFoundException('Página no encontrada');
    }

    // Construir la URL pública de la página
    const publicUrl = `${this.publicBaseUrl}/p/${page.slug}`;

    // Generar el QR como PNG data URL
    const dataUrl = await QRCode.toDataURL(publicUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Guardar o actualizar el QR en la base de datos (upsert)
    const qr = await this.prisma.qrCode.upsert({
      where: { pageId },
      update: { dataUrl },
      create: {
        pageId,
        dataUrl,
      },
    });

    return {
      id: qr.id,
      pageId: qr.pageId,
      dataUrl: qr.dataUrl,
      publicUrl,
      createdAt: qr.createdAt,
    };
  }

  /**
   * Obtiene el código QR existente para una página.
   *
   * @param pageId - ID de la página
   * @returns QR code con dataUrl y pageId
   */
  async getQrByPageId(pageId: string) {
    const qr = await this.prisma.qrCode.findUnique({
      where: { pageId },
      include: {
        page: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!qr) {
      throw new NotFoundException('Código QR no encontrado para esta página');
    }

    return {
      id: qr.id,
      pageId: qr.pageId,
      dataUrl: qr.dataUrl,
      publicUrl: `${this.publicBaseUrl}/p/${qr.page.slug}`,
      page: {
        slug: qr.page.slug,
        businessName: qr.page.business.name,
      },
      createdAt: qr.createdAt,
    };
  }
}
