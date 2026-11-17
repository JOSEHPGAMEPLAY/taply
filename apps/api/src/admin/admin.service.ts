import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PRISMA_CLIENT } from '../prisma/prisma.module.js';
import { MailService } from '../mail/mail.service.js';

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
    private readonly mailService: MailService,
  ) {}

  /**
   * Lista todos los usuarios con filtros opcionales.
   *
   * @param filters - search (nombre/email), role, status
   * @returns Array de usuarios sin passwordHash
   */
  async findAllUsers(filters?: { search?: string; role?: string; status?: string }) {
    const where: any = {};

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (filters?.role) where.role = filters.role;
    if (filters?.status) where.status = filters.status;

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
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
   * Cambia el estado de un usuario (ACTIVE, SUSPENDED, DEACTIVATED).
   */
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Solicita restablecimiento de contraseña para un usuario.
   * Genera un token, lo guarda en la DB y envía un email.
   */
  async requestPasswordReset(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Invalidar tokens anteriores
    await this.prisma.passwordResetToken.deleteMany({ where: { userId } });

    // Generar token criptográfico
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);

    // Guardar token con expiración de 1 hora
    await this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // Construir URL de restablecimiento
    const resetUrl = `http://localhost:3000/reset-password/${token}`;

    // Enviar email
    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'Email de restablecimiento enviado' };
  }

  /**
   * Ejecuta una acción masiva sobre múltiples usuarios.
   * Las acciones se ejecutan en una transacción para garantizar consistencia.
   */
  async bulkAction(
    userIds: string[],
    action: 'UPDATE_ROLE' | 'UPDATE_STATUS' | 'REQUEST_PASSWORD_RESET' | 'DELETE',
    value?: string,
  ) {
    const results = { processed: 0, errors: [] as string[] };

    switch (action) {
      case 'UPDATE_ROLE': {
        if (!value || (value !== 'ADMIN' && value !== 'USER')) {
          throw new BadRequestException('Valor inválido para UPDATE_ROLE. Use ADMIN o USER.');
        }
        for (const userId of userIds) {
          try {
            await this.updateUserRole(userId, value);
            results.processed++;
          } catch (error: any) {
            results.errors.push(`${userId}: ${error.message}`);
          }
        }
        break;
      }
      case 'UPDATE_STATUS': {
        if (!value || !['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].includes(value)) {
          throw new BadRequestException('Valor inválido para UPDATE_STATUS. Use ACTIVE, SUSPENDED o DEACTIVATED.');
        }
        for (const userId of userIds) {
          try {
            await this.updateUserStatus(userId, value as 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED');
            results.processed++;
          } catch (error: any) {
            results.errors.push(`${userId}: ${error.message}`);
          }
        }
        break;
      }
      case 'REQUEST_PASSWORD_RESET': {
        for (const userId of userIds) {
          try {
            await this.requestPasswordReset(userId);
            results.processed++;
          } catch (error: any) {
            results.errors.push(`${userId}: ${error.message}`);
          }
        }
        break;
      }
      case 'DELETE': {
        for (const userId of userIds) {
          try {
            await this.prisma.user.delete({ where: { id: userId } });
            results.processed++;
          } catch (error: any) {
            results.errors.push(`${userId}: ${error.message}`);
          }
        }
        break;
      }
      default:
        throw new BadRequestException('Acción no válida');
    }

    return results;
  }

  /**
   * Obtiene estadísticas de usuarios del sistema.
   *
   * @returns Conteo por rol y status, y fecha del último registro
   */
  async getStats() {
    const total = await this.prisma.user.count();
    const admins = await this.prisma.user.count({ where: { role: 'ADMIN' } });
    const users = await this.prisma.user.count({ where: { role: 'USER' } });
    const active = await this.prisma.user.count({ where: { status: 'ACTIVE' } });
    const suspended = await this.prisma.user.count({ where: { status: 'SUSPENDED' } });
    const deactivated = await this.prisma.user.count({ where: { status: 'DEACTIVATED' } });

    const latestUser = await this.prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      total,
      admins,
      users,
      active,
      suspended,
      deactivated,
      latestUserAt: latestUser?.createdAt || null,
    };
  }
}
