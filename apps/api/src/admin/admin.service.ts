import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';

/**
 * AdminService - Gestiona las operaciones de administración de usuarios.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo maneja lógica de gestión de usuarios (listar, cambiar rol, eliminar, stats).
 * - DIP: Depende de abstracciones (PrismaClient) inyectadas.
 * - OCP: Extensible para agregar nuevos métodos sin modificar existentes.
 *
 * Responsabilidades:
 * - Listar todos los usuarios sin información sensible
 * - Cambiar el rol de un usuario
 * - Eliminar usuarios (con protecciones contra auto-eliminación)
 * - Obtener estadísticas de usuarios
 */
@Injectable()
export class AdminService {
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
  ) {}

  /**
   * Lista todos los usuarios del sistema sin información sensible.
   *
   * @returns Array de usuarios sin passwordHash
   */
  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  /**
   * Cambia el rol de un usuario.
   *
   * @param userId - ID del usuario a modificar
   * @param newRole - Nuevo rol (ADMIN o USER)
   * @returns Usuario actualizado sin información sensible
   * @throws Error si el usuario no existe o quedaría sin admins
   */
  async updateUserRole(userId: string, newRole: 'ADMIN' | 'USER') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se va a cambiar de ADMIN a USER, verificar que quede al menos un admin
    if (user.role === 'ADMIN' && newRole === 'USER') {
      const adminCount = await this.prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw new BadRequestException('No se puede eliminar el último administrador');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Elimina un usuario del sistema.
   *
   * @param userId - ID del usuario a eliminar
   * @param adminId - ID del administrador que realiza la acción
   * @returns Mensaje de confirmación
   * @throws Error si el usuario no existe o intenta eliminarse a sí mismo
   */
  async deleteUser(userId: string, adminId: string) {
    if (userId === adminId) {
      throw new BadRequestException('No puedes eliminarte a ti mismo');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // No permitir eliminar el último admin
    if (user.role === 'ADMIN') {
      const adminCount = await this.prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw new BadRequestException('No se puede eliminar el último administrador');
      }
    }

    await this.prisma.user.delete({ where: { id: userId } });

    return { message: 'Usuario eliminado correctamente' };
  }

  /**
   * Obtiene estadísticas de usuarios del sistema.
   *
   * @returns Conteo por rol y fecha del último registro
   */
  async getStats() {
    const total = await this.prisma.user.count();
    const admins = await this.prisma.user.count({ where: { role: 'ADMIN' } });
    const users = await this.prisma.user.count({ where: { role: 'USER' } });

    const latestUser = await this.prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      total,
      admins,
      users,
      latestUserAt: latestUser?.createdAt || null,
    };
  }
}
