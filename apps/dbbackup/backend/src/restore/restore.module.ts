import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestoreController } from './restore.controller';
import { RestoreService } from './restore.service';
import { RestoreLog } from '../common/entities/restore-log.entity';
import { Backup } from '../common/entities/backup.entity';
import { DatabaseConfig } from '../common/entities/database-config.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestoreLog, Backup, DatabaseConfig]),
    StorageModule,
  ],
  controllers: [RestoreController],
  providers: [RestoreService],
  exports: [RestoreService],
})
export class RestoreModule {}
