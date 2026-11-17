import { Module } from '@nestjs/common';
import { NfcTagsController } from './nfc-tags.controller.js';
import { NfcTagsService } from './nfc-tags.service.js';

@Module({
  controllers: [NfcTagsController],
  providers: [NfcTagsService],
  exports: [NfcTagsService],
})
export class NfcTagsModule {}
