import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';
import { Backup } from '../common/entities/backup.entity';
import { BackupJob } from '../common/entities/backup-job.entity';
import { RestoreLog } from '../common/entities/restore-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Backup, BackupJob, RestoreLog])],
  controllers: [MonitorController],
  providers: [MonitorService],
  exports: [MonitorService],
})
export class MonitorModule {}
