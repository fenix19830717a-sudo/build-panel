import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Monitor } from '../../entities/monitor.entity';
import { CheckResult } from '../../entities/check-result.entity';
import { Alert } from '../../entities/alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Monitor, CheckResult, Alert])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
