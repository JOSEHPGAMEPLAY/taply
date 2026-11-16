import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * Módulo global de correo electrónico.
 * Configura Nodemailer con Gmail OAuth2 para enviar emails transaccionales.
 *
 * Principio SOLID: Single Responsibility — solo maneja el envío de correos.
 */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
