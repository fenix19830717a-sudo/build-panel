import winston from 'winston';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export function createLogger(level: string, logFile: string): winston.Logger {
  const logDir = join(process.cwd(), 'logs');
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }

  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'node-agent' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `[${timestamp}] ${level}: ${message} ${metaStr}`;
          })
        )
      }),
      new winston.transports.File({
        filename: join(logDir, logFile),
        maxsize: 10485760,
        maxFiles: 5
      })
    ]
  });
}

export type Logger = winston.Logger;
