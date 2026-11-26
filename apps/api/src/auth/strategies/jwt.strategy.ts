import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../../prisma/prisma.module.js';

/**
 * JwtStrategy - Estrategia de Passport para validar tokens JWT.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo valida tokens JWT y extrae el payload del usuario.
 * - ISP: Implementa solo la interfaz necesaria de PassportStrategy.
 *
 * Flujo:
 * 1. Extrae el token del header Authorization (Bearer <token>)
 * 2. Verifica la firma del token con el secreto configurado
 * 3. Devuelve el payload con los datos del usuario autenticado
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Configura la estrategia JWT con los parámetros de validación.
   *
   * - jwtFromRequest: Extrae el token del header Authorization
   * - secretOrKey: Secreto usado para verificar la firma del token
   */
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'taply-jwt-secret-change-in-production',
    });
  }

  /**
   * Valida el payload del token JWT y devuelve los datos del usuario.
   *
   * Este método se ejecuta automáticamente después de verificar el token.
   * El payload devuelto se adjunta a `request.user` en los guards.
   *
   * @param payload - Payload decodificado del token JWT
   * @returns Objeto con los datos del usuario autenticado
   */
  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true },
    });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('La cuenta no está disponible');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
