import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BusinessesModule } from './businesses/businesses.module';

@Module({
  imports: [PrismaModule, HealthModule, AuthModule, BusinessesModule],
})
export class AppModule {}
