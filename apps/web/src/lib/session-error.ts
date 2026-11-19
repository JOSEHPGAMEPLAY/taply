/**
 * Error lanzado cuando el token JWT expira o es inválido.
 * Se captura en auth-context para mostrar un mensaje al usuario antes de redirigir.
 */
export class SessionExpiredError extends Error {
  constructor() {
    super('Sesión expirada');
    this.name = 'SessionExpiredError';
  }
}
