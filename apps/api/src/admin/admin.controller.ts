import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { UpdateRoleDto } from './dto/update-role.dto';

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
   * Lista todos los usuarios del sistema.
   * Solo accesible por administradores.
   */
  @Get('users')
  @ApiOperation({ summary: 'Listar todos los usuarios (solo admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async findAllUsers() {
    return this.adminService.findAllUsers();
  }

  /**
   * Cambia el rol de un usuario.
   * Body: { role: 'ADMIN' | 'USER' }
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
   * Elimina un usuario del sistema.
   * No permite auto-eliminación ni eliminar el último admin.
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
