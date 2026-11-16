import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

/**
 * Servicio de envío de correos electrónicos.
 * Usa Gmail OAuth2 para autenticación segura sin contraseñas.
 *
 * Principio SOLID: Single Responsibility — solo envía emails.
 * Open/Closed — fácil de extender con nuevos tipos de email.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Crea el transportador de Nodemailer con Gmail OAuth2.
   * Si las credenciales no están configuradas, usa un transportador dummy
   * que solo loguea los emails (modo desarrollo).
   */
  private createTransporter(): Transporter {
    const clientId = process.env.EMAIL_CLIENT_ID;
    const clientSecret = process.env.EMAIL_CLIENT_SECRET;
    const refreshToken = process.env.EMAIL_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      this.logger.warn(
        'Email credentials not configured. MailService will log emails instead of sending them.',
      );
      // Fallback: transportador que solo loguea (para desarrollo sin OAuth2 configurado)
      return nodemailer.createTransport({
        jsonTransport: true,
      });
    }

    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId,
        clientSecret,
        refreshToken,
      },
    });
  }

  /**
   * Envía email de restablecimiento de contraseña.
   * Incluye un enlace con token que expira en 1 hora.
   */
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const from = process.env.EMAIL_FROM || 'Taply <noreply@taply.com>';

    const html = this.buildPasswordResetHtml(resetUrl);

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: 'Restablecer contraseña — Taply',
        text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
        html,
      });

      // Si el transportador es JSON (modo desarrollo), loguea el resultado
      if (typeof info === 'string') {
        this.logger.log(`[DEV MODE] Email enviado a ${to}: ${info}`);
      } else {
        this.logger.log(`Email de restablecimiento enviado a ${to} (messageId: ${info.messageId})`);
      }
    } catch (error: any) {
      this.logger.error(`Error enviando email a ${to}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Construye el HTML del email de restablecimiento de contraseña.
   */
  private buildPasswordResetHtml(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
          .content { padding: 32px; }
          .content p { color: #333333; line-height: 1.6; font-size: 16px; }
          .button { display: inline-block; background: #667eea; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; margin: 16px 0; }
          .button:hover { background: #5a6fd6; }
          .note { color: #888888; font-size: 14px; margin-top: 24px; }
          .footer { background: #f9f9f9; padding: 24px; text-align: center; }
          .footer p { color: #888888; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Taply</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Taply.</p>
            <p style="text-align:center;">
              <a href="${resetUrl}" class="button">Restablecer contraseña</a>
            </p>
            <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no cambiará.</p>
            <p class="note">⚠️ Este enlace expirará en <strong>1 hora</strong>.</p>
          </div>
          <div class="footer">
            <p>© 2026 Taply. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `.trim();
  }
}
