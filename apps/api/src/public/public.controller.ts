import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { RecordEventDto } from './dto/record-event.dto';

/**
 * PublicController - Endpoints públicos sin autenticación.
 *
 * Estos endpoints están diseñados para ser accesibles desde el exterior
 * sin necesidad de token JWT, permitiendo la resolución de etiquetas NFC
 * y el registro de eventos de analíticas.
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo expone endpoints públicos.
 * - Interface Segregation: Separado de los endpoints protegidos.
 */
@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /**
   * Resuelve un token NFC y devuelve la información de la página asignada.
   *
   * Si la etiqueta tiene una asignación activa, devuelve la URL de redirección
   * y la información de la página y negocio. Si no tiene asignación, devuelve
   * un error para mostrar la pantalla de "etiqueta sin asignación".
   *
   * @param token - Token único de la etiqueta NFC
   * @returns Información de redirección o error
   */
  @Get('nfc/:token')
  @ApiOperation({ summary: 'Resolver token NFC y obtener página asignada' })
  @ApiResponse({ status: 200, description: 'Etiqueta resuelta exitosamente' })
  @ApiResponse({ status: 404, description: 'Etiqueta no encontrada o sin asignación' })
  @ApiResponse({ status: 400, description: 'Etiqueta no activa o negocio suspendido' })
  async resolveNfcToken(@Param('token') token: string) {
    return this.publicService.resolveNfcToken(token);
  }

  /**
   * Registra un evento de analíticas sin autenticación.
   *
   * Permite registrar PAGE_VIEW, BUTTON_CLICK y TAG_SCAN desde el frontend
   * público. Los eventos se asocian a una página y opcionalmente a una
   * etiqueta NFC y un botón específico.
   *
   * @param dto - Datos del evento a registrar
   * @returns El evento creado con ID generado
   */
  @Post('analytics/events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar evento de analíticas sin autenticación' })
  @ApiResponse({ status: 201, description: 'Evento registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Página no encontrada' })
  async recordEvent(@Body() dto: RecordEventDto) {
    return this.publicService.recordEvent(dto);
  }
}
