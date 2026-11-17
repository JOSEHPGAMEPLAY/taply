import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service.js';
import { CreateBusinessDto } from './dto/create-business.dto.js';
import { UpdateBusinessDto } from './dto/update-business.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

/**
 * BusinessesController - Endpoints CRUD de negocios.
 *
 * Principios SOLID aplicados:
 * - SRP: Solo maneja las peticiones HTTP de Businesses.
 * - DIP: Depende de BusinessesService inyectado.
 *
 * Todos los endpoints requieren autenticación JWT.
 *
 * Endpoints:
 * - POST /businesses - Crear negocio
 * - GET /businesses - Listar negocios del owner
 * - GET /businesses/:id - Obtener negocio
 * - PATCH /businesses/:id - Actualizar negocio
 * - DELETE /businesses/:id - Eliminar negocio
 */
@ApiTags('Businesses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('businesses')
export class BusinessesController {
  /**
   * Constructor que inyecta el servicio de negocios.
   *
   * @param businessesService - Servicio que maneja la lógica de negocios
   */
  constructor(private readonly businessesService: BusinessesService) {}

  /**
   * Crea un nuevo negocio para el usuario autenticado.
   *
   * @param dto - Datos del negocio a crear
   * @param request - Request con el usuario autenticado
   * @returns Negocio creado
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo negocio', description: 'Crea un negocio para el usuario autenticado. El slug se genera automáticamente.' })
  @ApiBody({ type: CreateBusinessDto })
  @ApiResponse({ status: 201, description: 'Negocio creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() dto: CreateBusinessDto, @Request() request: any) {
    return this.businessesService.create(request.user.userId, dto);
  }

  /**
   * Lista todos los negocios del usuario autenticado.
   *
   * @param request - Request con el usuario autenticado
   * @returns Array de negocios
   */
  @Get()
  @ApiOperation({ summary: 'Listar negocios del usuario', description: 'Retorna todos los negocios del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de negocios' })
  async findAll(@Request() request: any) {
    return this.businessesService.findAll(request.user.userId);
  }

  /**
   * Obtiene un negocio por ID.
   *
   * @param id - ID del negocio
   * @param request - Request con el usuario autenticado
   * @returns Negocio si existe y pertenece al owner
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener negocio por ID', description: 'Retorna un negocio si pertenece al usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Negocio encontrado' })
  @ApiResponse({ status: 404, description: 'Negocio no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async findOne(@Param('id') id: string, @Request() request: any) {
    return this.businessesService.findOne(id, request.user.userId);
  }

  /**
   * Actualiza un negocio por ID.
   *
   * @param id - ID del negocio
   * @param dto - Datos a actualizar
   * @param request - Request con el usuario autenticado
   * @returns Negocio actualizado
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar negocio', description: 'Actualiza parcialmente un negocio del usuario autenticado' })
  @ApiBody({ type: UpdateBusinessDto })
  @ApiResponse({ status: 200, description: 'Negocio actualizado' })
  @ApiResponse({ status: 404, description: 'Negocio no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessDto,
    @Request() request: any,
  ) {
    return this.businessesService.update(id, request.user.userId, dto);
  }

  /**
   * Elimina un negocio por ID.
   *
   * @param id - ID del negocio
   * @param request - Request con el usuario autenticado
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar negocio', description: 'Elimina un negocio y todos sus recursos asociados' })
  @ApiResponse({ status: 200, description: 'Negocio eliminado' })
  @ApiResponse({ status: 404, description: 'Negocio no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async remove(@Param('id') id: string, @Request() request: any) {
    await this.businessesService.remove(id, request.user.userId);
    return { message: 'Negocio eliminado correctamente' };
  }
}
