import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

/**
 * TemplatesController - Endpoints CRUD de templates globales.
 *
 * Todos los endpoints requieren autenticación JWT.
 * Los templates son globales, sin verificación de ownership.
 *
 * Endpoints:
 * - GET /templates - Listar todos los templates
 * - POST /templates - Crear template
 * - GET /templates/:id - Obtener template
 * - PATCH /templates/:id - Actualizar template
 * - DELETE /templates/:id - Eliminar template
 */
@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los templates' })
  @ApiResponse({ status: 200, description: 'Lista de templates' })
  async findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener template por ID' })
  @ApiResponse({ status: 200, description: 'Template encontrado' })
  @ApiResponse({ status: 404, description: 'Template no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo template' })
  @ApiResponse({ status: 201, description: 'Template creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar template' })
  @ApiResponse({ status: 200, description: 'Template actualizado' })
  @ApiResponse({ status: 404, description: 'Template no encontrado' })
  async update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar template' })
  @ApiResponse({ status: 200, description: 'Template eliminado' })
  @ApiResponse({ status: 404, description: 'Template no encontrado' })
  async remove(@Param('id') id: string) {
    await this.templatesService.remove(id);
    return { message: 'Template eliminado correctamente' };
  }
}
