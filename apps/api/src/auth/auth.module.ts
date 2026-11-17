import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

/**
 * AuthModule - Módulo de autenticación del sistema.
 *
 * Principios SOLID aplicados:
 * - SRP: Encapsula toda la lógica de autenticación en un módulo cohesivo.
 * - DIP: Depende de módulos de abstracción (JwtModule, PassportModule).
 * - OCP: Extensible para agregar nuevas estrategias sin modificar el módulo.
 *
 * Componentes:
 * - AuthController: Maneja las peticiones HTTP
 * - AuthService: Contiene la lógica de negocio
 * - JwtStrategy: Valida los tokens JWT
 * - JwtAuthGuard: Protege las rutas
 */
@Module({
  imports: [
    // Módulo de Passport para integración con estrategias de autenticación
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Módulo de JWT para generar y verificar tokens
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'taply-jwt-secret-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
