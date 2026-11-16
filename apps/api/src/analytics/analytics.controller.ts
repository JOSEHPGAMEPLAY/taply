import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * AnalyticsController - Endpoints de analíticas.
 *
 * IMPORTANTE: Los endpoints de estadísticas requieren:
 * - Autenticación JWT (header Authorization: Bearer <token>)
 * - pageId como query param (requerido)
 * - startDate y endDate como query params (opcionales)
 *
 * Endpoints:
 * - GET /analytics/stats?pageId=<uuid>&startDate=<date>&endDate=<date>
 */
@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de una página', description: 'Retorna métricas de visitas, clics y escaneos para una página específica.' })
  @ApiQuery({ name: 'pageId', required: true, type: String, description: 'ID de la página' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (ISO 8601, opcional)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (ISO 8601, opcional)' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async getStats(@Query() dto: AnalyticsQueryDto) {
    return this.analyticsService.getStats(dto);
  }
}
