import { IsUUID } from 'class-validator';

/**
* DTO para generar un código QR.
* Requiere el ID de la página para la cual se generará el QR.
*/
export class GenerateQrDto {
  /**
   * ID de la página para la cual se generará el código QR.
   */
  @IsUUID()
  pageId: string;
}
