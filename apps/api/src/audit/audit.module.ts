import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { AuditInterceptor } from './audit.interceptor.js';

/**
* Módulo de auditoría global.
*
* Proporciona el servicio de auditoría y el interceptor global
* para registrar automáticamente todas las operaciones críticas.
*/
@Global()
@Module({
  providers: [
    AuditService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
