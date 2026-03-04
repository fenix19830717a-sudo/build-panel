import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { SchedulerService } from './scheduler.service';
import { Monitor } from '../../entities/monitor.entity';
import { CheckResult } from '../../entities/check-result.entity';
import { AlertsModule } from '../alerts/alerts.module';
import { MonitorsModule } from '../monitors/monitors.module';
import { CheckResultsModule } from '../check-results/check-results.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Monitor, CheckResult]),
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'monitor-checks',
    }),
    AlertsModule,
    MonitorsModule,
    CheckResultsModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
