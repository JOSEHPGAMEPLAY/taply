import { IsEmail, IsString } from 'class-validator';

/**
 * LoginDto - Datos de entrada para iniciar sesión.
 *
 * Validaciones:
 * - Email válido con formato correcto
 * - Contraseña requerida
 */
export class LoginDto {
  /**
   * Correo electrónico del usuario registrado.
   */
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  /**
   * Contraseña del usuario.
   */
  @IsString({ message: 'La contraseña debe ser un texto' })
  password: string;
}
