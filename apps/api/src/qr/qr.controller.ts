import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { GenerateQrDto } from './dto/generate-qr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
* Controlador para gestión de códigos QR.
*
* Proporciona endpoints para generar y obtener códigos QR
* como alternativa a las etiquetas NFC.
*
* Principios SOLID aplicados:
* - Single Responsibility: Solo maneja las peticiones HTTP de QR.
* - Dependency Inversion: Depende de QrService (abstracción).
*/
@ApiTags('QR Codes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  /**
   * Genera un código QR para la URL pública de una página.
   * POST /qr/generate
   */
  @Post('generate')
  @ApiOperation({ summary: 'Generar código QR para una página' })
  @ApiResponse({ status: 201, description: 'Código QR generado exitosamente' })
  @ApiResponse({ status: 404, description: 'Página no encontrada' })
  async generateQr(@Body() dto: GenerateQrDto) {
    return this.qrService.generateQr(dto.pageId);
  }

  /**
   * Obtiene el código QR existente para una página.
   * GET /qr/:pageId
   */
  @Get(':pageId')
  @ApiOperation({ summary: 'Obtener código QR de una página' })
  @ApiResponse({ status: 200, description: 'Código QR encontrado' })
  @ApiResponse({ status: 404, description: 'Código QR no encontrado' })
  async getQr(@Param('pageId') pageId: string) {
    return this.qrService.getQrByPageId(pageId);
  }
}
