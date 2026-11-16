import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

/**
 * BusinessesService - Gestiona los negocios del usuario autenticado.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo maneja la lógica de negocio de Businesses.
 * - DIP: Depende de PrismaClient inyectado vía token.
 * - OCP: Extensible para agregar nuevas operaciones sin modificar existentes.
 *
 * Responsabilidades:
 * - Crear negocios asociados al owner
 * - Listar negocios del owner
 * - Obtener, actualizar y eliminar negocios
 * - Verificar ownership antes de operaciones sensibles
 */
@Injectable()
export class BusinessesService {
  /**
   * Constructor que inyecta el cliente Prisma.
   *
   * @param prisma - Cliente de base de datos Prisma
   */
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  /**
   * Crea un nuevo negocio para el usuario owner.
   *
   * @param ownerId - ID del usuario que crea el negocio
   * @param dto - Datos del negocio a crear
   * @returns Negocio creado con slug generado automáticamente
   */
  async create(ownerId: string, dto: CreateBusinessDto) {
    // Generar slug único a partir del nombre
    const baseSlug = this.generateSlug(dto.name);
    let slug = baseSlug;
    let suffix = 1;

    // Asegurar unicidad del slug
    while (await this.prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const business = await this.prisma.business.create({
      data: {
        ownerId,
        name: dto.name,
        slug,
        description: dto.description,
        status: 'ACTIVE',
      },
    });

    return business;
  }

  /**
   * Lista todos los negocios del usuario owner.
   *
   * @param ownerId - ID del usuario owner
   * @returns Array de negocios del owner
   */
  async findAll(ownerId: string) {
    return this.prisma.business.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene un negocio por ID verificando ownership.
   *
   * @param id - ID del negocio
   * @param ownerId - ID del usuario que solicita
   * @returns Negocio si existe y pertenece al owner
   * @throws Error si no existe o no pertenece al owner
   */
  async findOne(id: string, ownerId: string) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }
    if (business.ownerId !== ownerId) {
      throw new ForbiddenException('No tienes permiso para acceder a este negocio');
    }
    return business;
  }

  /**
   * Actualiza un negocio verificando ownership.
   *
   * @param id - ID del negocio
   * @param ownerId - ID del usuario que actualiza
   * @param dto - Datos a actualizar
   * @returns Negocio actualizado
   * @throws Error si no existe o no pertenece al owner
   */
  async update(id: string, ownerId: string, dto: UpdateBusinessDto) {
    // Verificar ownership primero
    await this.verifyOwnership(id, ownerId);

    // Generar nuevo slug si el nombre cambia
    const data: any = { ...dto };
    if (dto.name) {
      const baseSlug = this.generateSlug(dto.name);
      let slug = baseSlug;
      let suffix = 1;

      // Asegurar unicidad del slug (excluyendo el negocio actual)
      while (
        await this.prisma.business.findFirst({
          where: { slug, id: { not: id } },
        })
      ) {
        slug = `${baseSlug}-${suffix}`;
        suffix++;
      }
      data.slug = slug;
    }

    const business = await this.prisma.business.update({
      where: { id },
      data,
    });

    return business;
  }

  /**
   * Elimina un negocio verificando ownership.
   *
   * @param id - ID del negocio
   * @param ownerId - ID del usuario que elimina
   * @throws Error si no existe o no pertenece al owner
   */
  async remove(id: string, ownerId: string) {
    // Verificar ownership primero
    await this.verifyOwnership(id, ownerId);

    await this.prisma.business.delete({ where: { id } });
  }

  /**
   * Verifica que el usuario es el owner del negocio.
   *
   * @param id - ID del negocio
   * @param ownerId - ID del usuario
   * @throws Error si no existe o no pertenece al owner
   */
  private async verifyOwnership(id: string, ownerId: string) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }
    if (business.ownerId !== ownerId) {
      throw new ForbiddenException('No tienes permiso para modificar este negocio');
    }
  }

  /**
   * Genera un slug URL-friendly a partir de un nombre.
   *
   * @param name - Nombre del negocio
   * @returns Slug en minúsculas con guiones
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  }
}
