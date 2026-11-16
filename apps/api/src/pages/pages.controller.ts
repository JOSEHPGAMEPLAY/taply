import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * PagesController - Endpoints CRUD de páginas digitales.
 *
 * IMPORTANTE: Todos los endpoints requieren:
 * - Autenticación JWT (header Authorization: Bearer <token>)
 * - businessId como query param (?businessId=<uuid>)
 *
 * Endpoints:
 * - POST /pages?businessId=<uuid> - Crear página
 * - GET /pages?businessId=<uuid> - Listar páginas
 * - GET /pages/:id?businessId=<uuid> - Obtener página
 * - PATCH /pages/:id?businessId=<uuid> - Actualizar página
 * - DELETE /pages/:id?businessId=<uuid> - Eliminar página
 * - POST /pages/:id/publish?businessId=<uuid> - Publicar página
 */
@ApiTags('Pages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva página', description: 'Crea una página digital y una versión DRAFT asociada. Requiere businessId como query param.' })
  @ApiQuery({ name: 'businessId', required: true, type: String, description: 'ID del negocio propietario' })
  @ApiBody({ type: CreatePageDto })
  @ApiResponse({ status: 201, description: 'Página creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async create(@Body() dto: CreatePageDto, @Request() request: any, @Query('businessId') businessId: string) {
    return this.pagesService.create(businessId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar páginas', description: 'Retorna todas las páginas de un negocio. Requiere businessId como query param.' })
  @ApiQuery({ name: 'businessId', required: true, type: String, description: 'ID del negocio' })
  @ApiResponse({ status: 200, description: 'Lista de páginas' })
  async findAll(@Request() request: any, @Query('businessId') businessId: string) {
    return this.pagesService.findAll(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener página por ID', description: 'Retorna una página con su versión publicada. Requiere businessId como query param.' })
  @ApiQuery({ name: 'businessId', required: true, type: String, description: 'ID del negocio' })
  @ApiResponse({ status: 200, description: 'Página encontrada' })
  @ApiResponse({ status: 404, description: 'Página no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async findOne(@Param('id') id: string, @Request() request: any, @Query('businessId') businessId: string) {
    return this.pagesService.findOne(businessId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar página', description: 'Actualiza parcialmente una página. Requiere businessId como query param.' })
  @ApiQuery({ name: 'businessId', required: true, type: String, description: 'ID del negocio' })
  @ApiBody({ type: UpdatePageDto })
  @ApiResponse({ status: 200, description: 'Página actualizada' })
  @ApiResponse({ status: 404, description: 'Página no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async update(@Param('id') id: string, @Body() dto: UpdatePageDto, @Request() request: any, @Query('businessId') businessId: string) {
    return this.pagesService.update(businessId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar página', description: 'Elimina una página y todas sus versiones. Requiere businessId como query param.' })
  @ApiQuery({ name: 'businessId', required: true, type: String, description: 'ID del negocio' })
  @ApiResponse({ status: 200, description: 'Página eliminada' })
  @ApiResponse({ status: 404, description: 'Página no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async remove(@Param('id') id: string, @Request() request: any, @Query('businessId') businessId: string) {
    await this.pagesService.remove(businessId, id);
    return { message: 'Página eliminada' };
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publicar página', description: 'Publica la versión DRAFT más reciente de una página. Requiere businessId como query param.' })
  @ApiQuery({ name: 'businessId', required: true, type: String, description: 'ID del negocio' })
  @ApiResponse({ status: 200, description: 'Página publicada exitosamente' })
  @ApiResponse({ status: 404, description: 'Página no encontrada' })
  @ApiResponse({ status: 400, description: 'No hay versión DRAFT para publicar' })
  async publish(@Param('id') id: string, @Request() request: any, @Query('businessId') businessId: string) {
    return this.pagesService.publish(businessId, id);
  }
}
