import { Controller, Post, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { NfcTagsService } from './nfc-tags.service';
import { CreateNfcTagDto } from './dto/create-nfc-tag.dto';
import { AssignTagDto } from './dto/assign-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * NfcTagsController - Endpoints de gestión de etiquetas NFC.
 */
@UseGuards(JwtAuthGuard)
@Controller('nfc-tags')
export class NfcTagsController {
  constructor(private readonly nfcTagsService: NfcTagsService) {}

  @Post()
  async create(@Body() dto: CreateNfcTagDto, @Query('businessId') businessId: string) {
    return this.nfcTagsService.create(businessId, dto);
  }

  @Get()
  async findAll(@Query('businessId') businessId: string) {
    return this.nfcTagsService.findAll(businessId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('businessId') businessId: string) {
    return this.nfcTagsService.findOne(businessId, id);
  }

  @Post(':id/assign')
  async assign(@Param('id') id: string, @Body() dto: AssignTagDto, @Query('businessId') businessId: string) {
    return this.nfcTagsService.assign(businessId, id, dto);
  }

  @Post(':id/scan')
  async scan(@Param('id') id: string) {
    return this.nfcTagsService.scan(id);
  }
}
