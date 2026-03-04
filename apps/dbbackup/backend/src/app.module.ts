import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DatabaseModule } from './database/database.module';
import { BackupModule } from './backup/backup.module';
import { StorageModule } from './storage/storage.module';
import { RestoreModule } from './restore/restore.module';
import { MonitorModule } from './monitor/monitor.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { DatabaseConfig } from './common/entities/database-config.entity';
import { BackupJob } from './common/entities/backup-job.entity';
import { Backup } from './common/entities/backup.entity';
import { RestoreLog } from './common/entities/restore-log.entity';
import { StorageConfig } from './common/entities/storage-config.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'dbbackup',
      entities: [DatabaseConfig, BackupJob, Backup, RestoreLog, StorageConfig],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    BackupModule,
    StorageModule,
    RestoreModule,
    MonitorModule,
    SchedulerModule,
  ],
})
export class AppModule {}
