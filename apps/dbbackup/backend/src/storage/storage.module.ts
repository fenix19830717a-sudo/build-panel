import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { StorageConfig } from '../common/entities/storage-config.entity';
import { Backup } from '../common/entities/backup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StorageConfig, Backup])],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
