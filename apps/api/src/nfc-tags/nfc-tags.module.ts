import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { NfcTagsController } from './nfc-tags.controller.js';
import { NfcTagsService } from './nfc-tags.service.js';

@Module({
  imports: [AuthorizationModule],
  controllers: [NfcTagsController],
  providers: [NfcTagsService],
  exports: [NfcTagsService],
})
export class NfcTagsModule {}
