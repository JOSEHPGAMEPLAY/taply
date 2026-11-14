import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

/**
 * RegisterDto - Datos de entrada para registrar un nuevo usuario.
 *
 * Validaciones:
 * - Email válido con formato correcto
 * - Contraseña mínima de 8 caracteres con al menos una mayúscula, minúscula y número
 * - Nombre opcional
 */
export class RegisterDto {
  /**
   * Correo electrónico único del usuario.
   */
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  /**
   * Contraseña del usuario con requisitos de complejidad.
   */
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener mayúsculas, minúsculas y números',
  })
  password: string;

  /**
   * Nombre opcional del usuario.
   */
  @IsString({ each: true })
  name?: string;
}
