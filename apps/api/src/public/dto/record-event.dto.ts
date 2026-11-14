import { IsString, IsOptional, IsIn } from 'class-validator';

/**
 * DTO para registrar eventos de analíticas desde el endpoint público.
 * Permite registrar PAGE_VIEW, BUTTON_CLICK y TAG_SCAN sin autenticación.
 */
export class RecordEventDto {
  /**
   * Tipo de evento a registrar.
   */
  @IsIn(['PAGE_VIEW', 'BUTTON_CLICK', 'TAG_SCAN'])
  type: 'PAGE_VIEW' | 'BUTTON_CLICK' | 'TAG_SCAN';

  /**
   * ID de la página donde ocurrió el evento.
   */
  @IsString()
  pageId: string;

  /**
   * ID opcional de la etiqueta NFC que generó el evento.
   */
  @IsOptional()
  @IsString()
  tagId?: string;

  /**
   * Clave opcional del botón clickeado (para BUTTON_CLICK).
   */
  @IsOptional()
  @IsString()
  buttonKey?: string;

  /**
   * Metadatos adicionales en formato JSON.
   */
  @IsOptional()
  metadata?: Record<string, unknown>;
}
