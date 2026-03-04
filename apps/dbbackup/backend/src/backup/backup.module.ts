import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { BackupProcessor } from './backup.processor';
import { Backup } from '../common/entities/backup.entity';
import { BackupJob } from '../common/entities/backup-job.entity';
import { DatabaseConfig } from '../common/entities/database-config.entity';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Backup, BackupJob, DatabaseConfig]),
    BullModule.registerQueue({
      name: 'backup',
    }),
    DatabaseModule,
    StorageModule,
  ],
  controllers: [BackupController],
  providers: [BackupService, BackupProcessor],
  exports: [BackupService],
})
export class BackupModule {}
