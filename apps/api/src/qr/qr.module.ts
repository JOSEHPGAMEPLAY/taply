import { Module } from '@nestjs/common';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';

/**
* Módulo de códigos QR.
*
* Proporciona la funcionalidad para generar y gestionar
* códigos QR como alternativa a las etiquetas NFC.
*/
@Module({
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
