import { IsString, IsEmail, MinLength } from 'class-validator';

/**
 * DTO para el formulario de contacto público.
 * Permite a visitantes enviar mensajes al equipo de Taply.
 */
export class ContactDto {
  /**
   * Nombre del remitente.
   */
  @IsString()
  @MinLength(2)
  name: string;

  /**
   * Correo electrónico del remitente.
   */
  @IsEmail()
  email: string;

  /**
   * Contenido del mensaje.
   */
  @IsString()
  @MinLength(10)
  message: string;
}
