import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * PagesController - Endpoints CRUD de páginas digitales.
 * Todos los endpoints requieren autenticación JWT y businessId como query param.
 */
@UseGuards(JwtAuthGuard)
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  async create(@Body() dto: CreatePageDto, @Request() request: any, @Query('businessId') businessId: string) {
    return this.pagesService.create(businessId, dto);
  }

  @Get()
  async findAll(@Request() request: any, @Query('businessId') businessId: string) {
    return this.pagesService.findAll(businessId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() request: any, @Query('businessId') businessId: string) {
    return this.pagesService.findOne(businessId, id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePageDto, @Request() request: any, @Query('businessId') businessId: string) {
    return this.pagesService.update(businessId, id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() request: any, @Query('businessId') businessId: string) {
    await this.pagesService.remove(businessId, id);
    return { message: 'Página eliminada' };
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string, @Request() request: any, @Query('businessId') businessId: string) {
    return this.pagesService.publish(businessId, id);
  }
}
