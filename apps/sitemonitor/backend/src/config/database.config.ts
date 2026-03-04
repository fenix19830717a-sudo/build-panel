import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { Monitor, CheckResult, Alert, AlertChannel } from '../entities';

export default registerAs('database', (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'sitemonitor',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  entities: [Monitor, CheckResult, Alert, AlertChannel],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
}));
