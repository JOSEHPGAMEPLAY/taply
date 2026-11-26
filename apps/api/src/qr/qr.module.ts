import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { QrController } from './qr.controller.js';
import { QrService } from './qr.service.js';

/**
* Módulo de códigos QR.
*
* Proporciona la funcionalidad para generar y gestionar
* códigos QR como alternativa a las etiquetas NFC.
*/
@Module({
  imports: [AuthorizationModule],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
