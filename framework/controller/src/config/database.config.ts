import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ApiKey } from '../api-keys/entities/api-key.entity';
import { Server } from '../servers/entities/server.entity';
import { App } from '../apps/entities/app.entity';
import { ServerApp } from '../apps/entities/server-app.entity';
import { Task } from '../tasks/entities/task.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get('DB_USERNAME', 'postgres'),
      password: this.configService.get('DB_PASSWORD', 'postgres'),
      database: this.configService.get('DB_DATABASE', 'buildai'),
      entities: [User, ApiKey, Server, App, ServerApp, Task, AuditLog],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    };
  }
}
