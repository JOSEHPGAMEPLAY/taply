import { Controller, Get, Patch, Delete, Post, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { AdminAuthGuard } from './guards/admin-auth.guard.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { BulkActionDto } from './dto/bulk-action.dto.js';

/**
 * AdminController - Endpoints de gestión de usuarios (solo administradores).
 *
 * Principios SOLID aplicados:
 * - SRP: Solo expone endpoints de administración de usuarios.
 * - DIP: Depende de AdminService inyectado.
 *
 * Todos los endpoints requieren autenticación JWT + rol ADMIN.
 */
@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Lista todos los usuarios con filtros opcionales.
   */
  @Get('users')
  @ApiOperation({ summary: 'Listar usuarios con filtros (solo admin)' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o email' })
  @ApiQuery({ name: 'role', required: false, description: 'Filtrar por rol (ADMIN/USER)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por status (ACTIVE/SUSPENDED/DEACTIVATED)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async findAllUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.findAllUsers({ search, role, status });
  }

  /**
   * Cambia el rol de un usuario.
   */
  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Cambiar rol de un usuario (solo admin)' })
  @ApiResponse({ status: 200, description: 'Rol actualizado' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar el último admin' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  /**
   * Cambia el estado de un usuario.
   */
  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Cambiar estado de un usuario (solo admin)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto.status);
  }

  /**
   * Solicita restablecimiento de contraseña para un usuario.
   */
  @Post('users/:id/request-password-reset')
  @ApiOperation({ summary: 'Solicitar reset de contraseña (solo admin)' })
  @ApiResponse({ status: 200, description: 'Email enviado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async requestPasswordReset(@Param('id') id: string) {
    return this.adminService.requestPasswordReset(id);
  }

  /**
   * Ejecuta acción masiva sobre múltiples usuarios.
   */
  @Patch('users/bulk')
  @ApiOperation({ summary: 'Acción masiva sobre usuarios (solo admin)' })
  @ApiResponse({ status: 200, description: 'Acción ejecutada' })
  @ApiResponse({ status: 400, description: 'Acción o valor inválido' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async bulkAction(@Body() dto: BulkActionDto) {
    return this.adminService.bulkAction(dto.userIds, dto.action, dto.value);
  }

  /**
   * Elimina un usuario del sistema.
   */
  @Delete('users/:id')
  @ApiOperation({ summary: 'Eliminar un usuario (solo admin)' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  @ApiResponse({ status: 400, description: 'No puedes eliminarte a ti mismo' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteUser(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.adminService.deleteUser(id, req.user.userId);
  }

  /**
   * Obtiene estadísticas de usuarios.
   */
  @Get('users/stats')
  @ApiOperation({ summary: 'Estadísticas de usuarios (solo admin)' })
  @ApiResponse({ status: 200, description: 'Estadísticas de usuarios' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async getStats() {
    return this.adminService.getStats();
  }
}
