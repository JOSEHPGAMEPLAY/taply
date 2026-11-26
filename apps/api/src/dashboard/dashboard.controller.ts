import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { DashboardService } from './dashboard.service.js';

interface AuthenticatedRequest {
  user: { userId: string; role?: string };
}

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obtener resumen del dashboard del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Conteos de negocios, páginas y etiquetas NFC' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getSummary(@Request() request: AuthenticatedRequest) {
    return this.dashboardService.getSummary(request.user);
  }
}