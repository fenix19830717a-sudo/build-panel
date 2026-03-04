import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import databaseConfig from './config/database.config';
import { AppConfigModule } from './config/config.module';
import { MonitorsModule } from './modules/monitors/monitors.module';
import { CheckResultsModule } from './modules/check-results/check-results.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AlertChannelsModule } from './modules/alert-channels/alert-channels.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', ''),
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AppConfigModule,
    MonitorsModule,
    CheckResultsModule,
    AlertsModule,
    AlertChannelsModule,
    DashboardModule,
    SchedulerModule,
  ],
})
export class AppModule {}
