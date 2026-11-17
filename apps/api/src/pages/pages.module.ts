import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller.js';
import { PagesService } from './pages.service.js';

/**
 * PagesModule - Módulo de gestión de páginas digitales.
 */
@Module({
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
