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
import { CreateBusinessMembershipDto } from './dto/create-business-membership.dto.js';
import { UpdateBusinessMembershipDto } from './dto/update-business-membership.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Businesses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo negocio' })
  @ApiBody({ type: CreateBusinessDto })
  @ApiResponse({ status: 201, description: 'Negocio creado exitosamente' })
  async create(@Body() dto: CreateBusinessDto, @Request() request: any) {
    return this.businessesService.create(request.user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar negocios accesibles al usuario' })
  @ApiResponse({ status: 200, description: 'Lista de negocios con nivel de acceso' })
  async findAll(@Request() request: any) {
    return this.businessesService.findAll(request.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un negocio accesible al usuario' })
  @ApiResponse({ status: 200, description: 'Negocio encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async findOne(@Param('id') id: string, @Request() request: any) {
    return this.businessesService.findOne(id, request.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un negocio' })
  @ApiBody({ type: UpdateBusinessDto })
  @ApiResponse({ status: 200, description: 'Negocio actualizado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async update(@Param('id') id: string, @Body() dto: UpdateBusinessDto, @Request() request: any) {
    return this.businessesService.update(id, request.user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un negocio (propietario o administrador global)' })
  @ApiResponse({ status: 200, description: 'Negocio eliminado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async remove(@Param('id') id: string, @Request() request: any) {
    await this.businessesService.remove(id, request.user);
    return { message: 'Negocio eliminado correctamente' };
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar miembros del negocio' })
  @ApiResponse({ status: 200, description: 'Lista de miembros sin datos sensibles' })
  @ApiResponse({ status: 403, description: 'Solo el propietario o un administrador global puede administrar miembros' })
  async findMembers(@Param('id') id: string, @Request() request: any) {
    return this.businessesService.findMembers(id, request.user);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Añadir miembro por email' })
  @ApiBody({ type: CreateBusinessMembershipDto })
  @ApiResponse({ status: 201, description: 'Miembro añadido' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  @ApiResponse({ status: 409, description: 'La cuenta ya pertenece a un negocio' })
  async addMember(@Param('id') id: string, @Body() dto: CreateBusinessMembershipDto, @Request() request: any) {
    return this.businessesService.addMember(id, request.user, dto);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Cambiar rol de miembro' })
  @ApiBody({ type: UpdateBusinessMembershipDto })
  @ApiResponse({ status: 200, description: 'Rol actualizado' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateBusinessMembershipDto,
    @Request() request: any,
  ) {
    return this.businessesService.updateMemberRole(id, userId, request.user, dto);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Retirar miembro' })
  @ApiResponse({ status: 200, description: 'Miembro retirado' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  async removeMember(@Param('id') id: string, @Param('userId') userId: string, @Request() request: any) {
    await this.businessesService.removeMember(id, userId, request.user);
    return { message: 'Miembro retirado correctamente' };
  }
}

