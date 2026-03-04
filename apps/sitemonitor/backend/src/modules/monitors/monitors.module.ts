import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MonitorsController } from './monitors.controller';
import { MonitorsService } from './monitors.service';
import { Monitor } from '../entities/monitor.entity';
import { CheckResult } from '../entities/check-result.entity';
import { MonitorCheckProcessor } from './monitors.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Monitor, CheckResult]),
    BullModule.registerQueue({
      name: 'monitor-checks',
    }),
  ],
  controllers: [MonitorsController],
  providers: [MonitorsService, MonitorCheckProcessor],
  exports: [MonitorsService],
})
export class MonitorsModule {}
