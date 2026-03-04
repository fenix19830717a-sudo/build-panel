import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LogsModule } from './modules/logs/logs.module';
import { SourcesModule } from './modules/sources/sources.module';
import { ParsersModule } from './modules/parsers/parsers.module';
import { AlertRulesModule } from './modules/alert-rules/alert-rules.module';
import { Log } from './modules/logs/entities/log.entity';
import { Source } from './modules/sources/entities/source.entity';
import { Parser } from './modules/parsers/entities/parser.entity';
import { AlertRule } from './modules/alert-rules/entities/alert-rule.entity';

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
      username: process.env.DB_USERNAME || 'logcollector',
      password: process.env.DB_PASSWORD || 'logcollector123',
      database: process.env.DB_NAME || 'logcollector',
      entities: [Log, Source, Parser, AlertRule],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    LogsModule,
    SourcesModule,
    ParsersModule,
    AlertRulesModule,
  ],
})
export class AppModule {}
