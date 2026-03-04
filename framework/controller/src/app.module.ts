import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServersModule } from './servers/servers.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { AppsModule } from './apps/apps.module';
import { TasksModule } from './tasks/tasks.module';
import { EventsModule } from './events/events.module';
import { AgentModule } from './agent/agent.module';
import { AuditModule } from './audit/audit.module';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
    AuthModule,
    UsersModule,
    ServersModule,
    ApiKeysModule,
    AppsModule,
    TasksModule,
    EventsModule,
    AgentModule,
    AuditModule,
  ],
})
export class AppModule {}
