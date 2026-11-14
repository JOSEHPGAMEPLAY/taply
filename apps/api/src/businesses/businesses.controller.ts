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
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  async remove(@Param('id') id: string, @Request() request: any) {
    await this.businessesService.remove(id, request.user.userId);
    return { message: 'Negocio eliminado correctamente' };
  }
}
