import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller.js';
import { BillingService } from './billing.service.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';

@Module({
  controllers: [BillingController],
  providers: [BillingService],
  imports: [AuthorizationModule],
  exports: [BillingService],
})
export class BillingModule {}
