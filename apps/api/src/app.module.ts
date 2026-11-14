import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BusinessesModule } from './businesses/businesses.module';
import { PagesModule } from './pages/pages.module';
import { NfcTagsModule } from './nfc-tags/nfc-tags.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    BusinessesModule,
    PagesModule,
    NfcTagsModule,
    AnalyticsModule,
    BillingModule,
  ],
})
export class AppModule {}
