import { DataSource } from 'typeorm';
import { Log } from '../modules/logs/entities/log.entity';
import { Source } from '../modules/sources/entities/source.entity';
import { Parser } from '../modules/parsers/entities/parser.entity';
import { AlertRule } from '../modules/alert-rules/entities/alert-rule.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'logcollector',
  password: process.env.DB_PASSWORD || 'logcollector123',
  database: process.env.DB_NAME || 'logcollector',
  entities: [Log, Source, Parser, AlertRule],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
