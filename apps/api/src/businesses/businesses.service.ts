import { Injectable, Inject, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';
import {
  AccessControlService,
  AuthenticatedUser,
  BusinessAccessRole,
  BusinessMemberRole,
} from '../authorization/access-control.service.js';
import { CreateBusinessDto } from './dto/create-business.dto.js';
import { UpdateBusinessDto } from './dto/update-business.dto.js';
import { CreateBusinessMembershipDto } from './dto/create-business-membership.dto.js';
import { UpdateBusinessMembershipDto } from './dto/update-business-membership.dto.js';

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
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
    private readonly accessControl: AccessControlService,
  ) {}

  /**
   * Crea un nuevo negocio para el usuario owner.
   *
   * @param ownerId - ID del usuario que crea el negocio
   * @param dto - Datos del negocio a crear
   * @returns Negocio creado con slug generado automáticamente
   */
  async create(user: AuthenticatedUser, dto: CreateBusinessDto) {
    const ownerId = user.userId;
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
  async findAll(user: AuthenticatedUser) {
    const businessIds = await this.accessControl.getAccessibleBusinessIds(user);
    const businesses = await this.prisma.business.findMany({
      where: { id: { in: businessIds } },
      orderBy: { createdAt: 'desc' },
    });
    const membership = user.role === 'ADMIN'
      ? null
      : await this.prisma.businessMembership.findUnique({
          where: { userId: user.userId },
          select: { businessId: true, role: true },
        });

    return businesses.map((business: { id: string; ownerId: string }) => {
      let accessRole: BusinessAccessRole = 'VIEWER';
      if (user.role === 'ADMIN') {
        accessRole = 'GLOBAL_ADMIN';
      } else if (business.ownerId === user.userId) {
        accessRole = 'OWNER';
      } else if (membership?.businessId === business.id) {
        accessRole = membership.role as BusinessAccessRole;
      }
      return { ...business, accessRole };
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
  async findOne(id: string, user: AuthenticatedUser) {
    await this.accessControl.requireBusinessRole(id, user, ['OWNER', 'ADMIN', 'EDITOR', 'ANALYST', 'VIEWER']);
    return this.prisma.business.findUnique({ where: { id } });
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
  async update(id: string, user: AuthenticatedUser, dto: UpdateBusinessDto) {
    await this.accessControl.requireBusinessRole(id, user, ['OWNER', 'ADMIN']);

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
  async remove(id: string, user: AuthenticatedUser) {
    await this.accessControl.requireBusinessRole(id, user, ['OWNER']);

    await this.prisma.business.delete({ where: { id } });
  }

  async findMembers(businessId: string, user: AuthenticatedUser) {
    await this.accessControl.requireBusinessOwner(businessId, user);
    return this.prisma.businessMembership.findMany({
      where: { businessId },
      select: {
        id: true,
        userId: true,
        role: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addMember(businessId: string, user: AuthenticatedUser, dto: CreateBusinessMembershipDto) {
    await this.accessControl.requireBusinessOwner(businessId, user);
    const email = dto.email.trim().toLowerCase();
    const member = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true, status: true },
    });
    if (!member) throw new NotFoundException('No existe una cuenta con ese correo electrónico');
    if (member.status !== 'ACTIVE') {
      throw new ConflictException('No se puede asignar una cuenta suspendida o desactivada');
    }

    const business = await this.prisma.business.findUnique({ where: { id: businessId }, select: { ownerId: true } });
    if (business?.ownerId === member.id) {
      throw new ConflictException('El propietario no puede añadirse como miembro');
    }

    const currentMembership = await this.prisma.businessMembership.findUnique({
      where: { userId: member.id },
      select: { businessId: true },
    });
    if (currentMembership) {
      throw new ConflictException(
        currentMembership.businessId === businessId
          ? 'El usuario ya es miembro de este negocio'
          : 'El usuario ya pertenece a otro negocio',
      );
    }

    try {
      return await this.prisma.businessMembership.create({
        data: { businessId, userId: member.id, role: dto.role },
        select: {
          id: true,
          userId: true,
          role: true,
          createdAt: true,
          user: { select: { email: true, name: true } },
        },
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('El usuario ya pertenece a un negocio');
      }
      throw error;
    }
  }

  async updateMemberRole(
    businessId: string,
    userId: string,
    user: AuthenticatedUser,
    dto: UpdateBusinessMembershipDto,
  ) {
    await this.accessControl.requireBusinessOwner(businessId, user);
    const { count } = await this.prisma.businessMembership.updateMany({
      where: { userId, businessId },
      data: { role: dto.role as BusinessMemberRole },
    });
    if (count === 0) throw new NotFoundException('Miembro no encontrado');

    const updatedMembership = await this.prisma.businessMembership.findFirst({
      where: { userId, businessId },
      select: {
        id: true,
        userId: true,
        role: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    });
    if (!updatedMembership) throw new NotFoundException('Miembro no encontrado');
    return updatedMembership;
  }

  async removeMember(businessId: string, userId: string, user: AuthenticatedUser) {
    await this.accessControl.requireBusinessOwner(businessId, user);
    const { count } = await this.prisma.businessMembership.deleteMany({
      where: { userId, businessId },
    });
    if (count === 0) throw new NotFoundException('Miembro no encontrado');
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
