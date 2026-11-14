import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * AuthController - Endpoints de autenticación.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo maneja las peticiones HTTP de autenticación.
 * - DIP: Depende de AuthService inyectado, no de implementaciones directas.
 * - LSP: Los DTOs siguen las reglas de validación consistentes.
 *
 * Endpoints:
 * - POST /auth/register - Registrar nuevo usuario
 * - POST /auth/login - Iniciar sesión
 * - POST /auth/refresh - Refrescar token de acceso
 * - GET /auth/me - Obtener perfil del usuario autenticado
 */
@Controller('auth')
export class AuthController {
  /**
   * Constructor que inyecta el servicio de autenticación.
   *
   * @param authService - Servicio que maneja la lógica de autenticación
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * @param registerDto - Datos de registro del usuario
   * @returns Tokens de acceso y refresco, y datos del usuario
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
  }

  /**
   * Inicia sesión con email y contraseña.
   *
   * @param loginDto - Credenciales del usuario
   * @returns Tokens de acceso y refresco, y datos del usuario
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * Refresca el token de acceso usando un token de refresco válido.
   *
   * @param refreshTokenDto - Token de refresco
   * @returns Nuevo token de acceso
   */
  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   *
   * Requiere autenticación JWT.
   *
   * @param request - Request con los datos del usuario autenticado
   * @returns Datos del usuario sin información sensible
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() request: any) {
    return this.authService.getProfile(request.user.userId);
  }
}
