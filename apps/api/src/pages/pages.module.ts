import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { PagesController } from './pages.controller.js';
import { PagesService } from './pages.service.js';

/**
 * PagesModule - Módulo de gestión de páginas digitales.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
