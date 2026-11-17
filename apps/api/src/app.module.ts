import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BusinessesModule } from './businesses/businesses.module.js';
import { PagesModule } from './pages/pages.module.js';
import { NfcTagsModule } from './nfc-tags/nfc-tags.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { BillingModule } from './billing/billing.module.js';
import { PublicModule } from './public/public.module.js';
import { QrModule } from './qr/qr.module.js';
import { AuditModule } from './audit/audit.module.js';
import { AdminModule } from './admin/admin.module.js';
import { MailModule } from './mail/mail.module.js';

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
    PublicModule,
    QrModule,
    AuditModule,
    AdminModule,
    MailModule,
  ],
})
export class AppModule {}
