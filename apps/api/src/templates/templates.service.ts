import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';
import { AccessControlService, AuthenticatedUser } from '../authorization/access-control.service.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';

/**
 * TemplatesService - Gestiona los templates globales.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo maneja la lógica de templates.
 * - DIP: Depende de PrismaClient inyectado vía token.
 *
 * Los templates son globales, sin verificación de ownership.
 */
@Injectable()
export class TemplatesService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
    private readonly accessControl: AccessControlService,
  ) {}

  /**
   * Lista todos los templates.
   */
  async findAll() {
    return this.prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene un template por ID.
   */
  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template no encontrado');
    }
    return template;
  }

  /**
   * Crea un nuevo template.
   */
  async create(dto: CreateTemplateDto, user: AuthenticatedUser) {
    this.accessControl.assertGlobalAdmin(user);
    const template = await this.prisma.template.create({
      data: {
        name: dto.name,
        description: dto.description,
        config: dto.config,
        version: dto.version || '1.0.0',
      },
    });
    return template;
  }

  /**
   * Actualiza un template por ID.
   */
  async update(id: string, dto: UpdateTemplateDto, user: AuthenticatedUser) {
    this.accessControl.assertGlobalAdmin(user);
    await this.findOne(id);
    const template = await this.prisma.template.update({
      where: { id },
      data: dto,
    });
    return template;
  }

  /**
   * Elimina un template por ID.
   */
  async remove(id: string, user: AuthenticatedUser) {
    this.accessControl.assertGlobalAdmin(user);
    await this.findOne(id);
    await this.prisma.template.delete({ where: { id } });
  }
}
