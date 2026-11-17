import { Controller, Post, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { NfcTagsService } from './nfc-tags.service.js';
import { CreateNfcTagDto } from './dto/create-nfc-tag.dto.js';
import { AssignTagDto } from './dto/assign-tag.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

/**
 * NfcTagsController - Endpoints de gestión de etiquetas NFC.
 *
 * IMPORTANTE: Todos los endpoints requieren:
 * - Autenticación JWT (header Authorization: Bearer <token>)
 * - businessId como query param (?businessId=<uuid>)
 *
 * Endpoints:
 * - POST /nfc-tags?businessId=<uuid> - Crear etiqueta
 * - GET /nfc-tags?businessId=<uuid> - Listar etiquetas
 * - GET /nfc-tags/:id?businessId=<uuid> - Obtener etiqueta
 * - POST /nfc-tags/:id/assign?businessId=<uuid> - Asignar a página
 * - POST /nfc-tags/:id/scan - Registrar escaneo
 */
@ApiTags('NFC Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nfc-tags')
export class NfcTagsController {
  constructor(private readonly nfcTagsService: NfcTagsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear etiqueta NFC', description: 'Crea una nueva etiqueta NFC con un token único. Requiere businessId como query param.' })
  @ApiQuery({ name: 'businessId', required: true, type: String, description: 'ID del negocio' })
  @ApiBody({ type: CreateNfcTagDto })
  @ApiResponse({ status: 201, description: 'Etiqueta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() dto: CreateNfcTagDto, @Query('businessId') businessId: string) {
    return this.nfcTagsService.create(businessId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar etiquetas NFC', description: 'Retorna todas las etiquetas. Si businessId está vacío, retorna las etiquetas de todos los negocios del usuario.' })
  @ApiQuery({ name: 'businessId', required: false, type: String, description: 'ID del negocio (opcional)' })
  @ApiResponse({ status: 200, description: 'Lista de etiquetas' })
  async findAll(@Request() request: any, @Query('businessId') businessId: string) {
    return this.nfcTagsService.findAll(businessId || '', request.user?.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener etiqueta por ID', description: 'Retorna una etiqueta con su asignación activa. Requiere businessId como query param.' })
  @ApiQuery({ name: 'businessId', required: true, type: String, description: 'ID del negocio' })
  @ApiResponse({ status: 200, description: 'Etiqueta encontrada' })
  @ApiResponse({ status: 404, description: 'Etiqueta no encontrada' })
  async findOne(@Param('id') id: string, @Query('businessId') businessId: string) {
    return this.nfcTagsService.findOne(businessId, id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Asignar etiqueta a página', description: 'Asigna una etiqueta NFC a una página. Requiere businessId como query param.' })
  @ApiQuery({ name: 'businessId', required: true, type: String, description: 'ID del negocio' })
  @ApiBody({ type: AssignTagDto })
  @ApiResponse({ status: 200, description: 'Etiqueta asignada exitosamente' })
  @ApiResponse({ status: 404, description: 'Etiqueta o página no encontrada' })
  async assign(@Param('id') id: string, @Body() dto: AssignTagDto, @Query('businessId') businessId: string) {
    return this.nfcTagsService.assign(businessId, id, dto);
  }

  @Post(':id/scan')
  @ApiOperation({ summary: 'Registrar escaneo de etiqueta', description: 'Registra un evento de escaneo para la etiqueta.' })
  @ApiResponse({ status: 200, description: 'Escaneo registrado' })
  @ApiResponse({ status: 404, description: 'Etiqueta no encontrada' })
  async scan(@Param('id') id: string) {
    return this.nfcTagsService.scan(id);
  }
}
