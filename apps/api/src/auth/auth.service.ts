import { Injectable, Inject, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { PRISMA_CLIENT } from '../prisma/prisma.module';

/**
 * AuthService - Gestiona la autenticación de usuarios.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo maneja lógica de autenticación (registro, login, refresh).
 * - DIP: Depende de abstracciones (PrismaClient, JwtService) inyectadas.
 * - OCP: Extensible para agregar nuevos métodos sin modificar existentes.
 *
 * Responsabilidades:
 * - Registrar nuevos usuarios con contraseña encriptada
 * - Autenticar usuarios y emitir tokens JWT
 * - Refrescar tokens de acceso
 * - Obtener perfil del usuario autenticado
 */
@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private readonly jwtExpiration: '15m' | '7d' | string;
  private readonly refreshExpiration: '15m' | '7d' | string;

  /**
   * Constructor que inyecta las dependencias necesarias.
   *
   * @param prisma - Cliente de base de datos Prisma
   * @param jwtService - Servicio de JWT de NestJS
   */
  constructor(
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
  ) {
    // Configuración desde variables de entorno con valores por defecto seguros
    this.jwtSecret = process.env.JWT_SECRET || 'taply-jwt-secret-change-in-production';
    this.refreshSecret = process.env.REFRESH_SECRET || 'taply-refresh-secret-change-in-production';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '15m';
    this.refreshExpiration = process.env.REFRESH_EXPIRATION || '7d';
  }

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * @param email - Correo electrónico único del usuario
   * @param password - Contraseña en texto plano (se encriptará)
   * @param name - Nombre opcional del usuario
   * @returns Tokens de acceso y refresco
   * @throws Error si el email ya está registrado
   */
  async register(email: string, password: string, name?: string) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Encriptar la contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear el usuario en la base de datos
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    // Generar tokens para el usuario recién registrado
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Autentica un usuario con email y contraseña.
   *
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña en texto plano
   * @returns Tokens de acceso y refresco
   * @throws Error si las credenciales son inválidas
   */
  async login(email: string, password: string) {
    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario está activo
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tu cuenta está desactivada. Contacta al administrador.');
    }

    // Verificar la contraseña contra el hash almacenado
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens de acceso y refresco
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Refresca el token de acceso usando un token de refresco válido.
   *
   * @param refreshToken - Token de refresco no expirado
   * @returns Nuevo token de acceso
   * @throws Error si el token de refresco es inválido
   */
  async refreshTokens(refreshToken: string) {
    try {
      // Verificar el token de refresco
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.refreshSecret,
      });

      // Buscar el usuario asociado al token
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Token de refresco inválido');
      }

      // Generar nuevo token de acceso
      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        {
          secret: this.jwtSecret,
          expiresIn: this.jwtExpiration as any,
        },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   *
   * @param userId - ID del usuario autenticado
   * @returns Datos del usuario sin información sensible
   * @throws Error si el usuario no existe
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Genera los tokens de acceso y refresco para un usuario.
   *
   * @param userId - ID del usuario
   * @param email - Correo electrónico del usuario
   * @param role - Rol del usuario (ADMIN o USER)
   * @returns Objeto con accessToken y refreshToken
   */
  private async generateTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.jwtSecret,
          expiresIn: this.jwtExpiration as any,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.refreshSecret,
          expiresIn: this.refreshExpiration as any,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Elimina la información sensible del usuario antes de devolverlo.
   *
   * @param user - Objeto usuario completo de la base de datos
   * @returns Objeto usuario sin passwordHash
   */
  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Solicita restablecimiento de contraseña (público).
   * No revela si el email existe por seguridad.
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = require('crypto').randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(token, 10);

      await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      const resetUrl = `http://localhost:3000/reset-password/${token}`;
      const mailService = new (require('../mail/mail.service').MailService)();
      await mailService.sendPasswordResetEmail(user.email, resetUrl);
    }

    // Siempre retorna el mismo mensaje por seguridad
    return { message: 'Si el correo existe, recibirás un enlace de restablecimiento' };
  }

  /**
   * Restablece la contraseña con un token válido (público).
   */
  async resetPassword(token: string, newPassword: string) {
    // Buscar todos los tokens no usados y no expirados
    const resetTokens = await this.prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    let resetToken = null;
    for (const rt of resetTokens) {
      const isValid = await bcrypt.compare(token, rt.tokenHash);
      if (isValid) {
        resetToken = rt;
        break;
      }
    }

    if (!resetToken) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Validar contraseña
    if (newPassword.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    // Actualizar contraseña y marcar token como usado
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
