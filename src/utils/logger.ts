import { 
  existsSync, 
  mkdirSync, 
  appendFileSync, 
  writeFileSync,
  statSync,
  renameSync
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

export interface LoggerOptions {
  level?: LogLevel;
  logDir?: string;
  logFile?: string;
  maxFileSize?: number;
  maxFiles?: number;
  console?: boolean;
  file?: boolean;
  format?: 'json' | 'text';
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m'
};

const RESET_COLOR = '\x1b[0m';

class Logger {
  private level: LogLevel;
  private logDir: string;
  private logFile: string;
  private maxFileSize: number;
  private maxFiles: number;
  private enableConsole: boolean;
  private enableFile: boolean;
  private format: 'json' | 'text';

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    this.logDir = options.logDir || join(process.cwd(), 'logs');
    this.logFile = options.logFile || 'app.log';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024;
    this.maxFiles = options.maxFiles || 5;
    this.enableConsole = options.console !== false;
    this.enableFile = options.file !== false;
    this.format = options.format || 'json';

    if (this.enableFile) {
      this.ensureLogDirectory();
    }
  }

  private ensureLogDirectory(): void {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  private formatMessage(entry: LogEntry): string {
    if (this.format === 'json') {
      return JSON.stringify(entry);
    }

    const { timestamp, level, message, ...meta } = entry;
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.enableFile) return;

    const logPath = join(this.logDir, this.logFile);
    
    try {
      if (existsSync(logPath)) {
        const stats = statSync(logPath);
        if (stats.size >= this.maxFileSize) {
          this.rotateLogs();
        }
      }

      const formattedMessage = this.formatMessage(entry) + '\n';
      appendFileSync(logPath, formattedMessage, 'utf-8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private rotateLogs(): void {
    const logPath = join(this.logDir, this.logFile);
    
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldPath = join(this.logDir, `${this.logFile}.${i}`);
      const newPath = join(this.logDir, `${this.logFile}.${i + 1}`);
      
      if (existsSync(oldPath)) {
        if (i === this.maxFiles - 1) {
          continue;
        }
        renameSync(oldPath, newPath);
      }
    }

    if (existsSync(logPath)) {
      renameSync(logPath, join(this.logDir, `${this.logFile}.1`));
    }

    writeFileSync(logPath, '', 'utf-8');
  }

  private writeToConsole(entry: LogEntry): void {
    if (!this.enableConsole) return;

    const { timestamp, level, message, ...meta } = entry;
    const color = LOG_COLORS[level];
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const formattedMessage = `[${timestamp}] ${color}${level.toUpperCase()}${RESET_COLOR}: ${message}${metaStr}`;
    
    const output = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    output(formattedMessage);
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      ...meta
    };

    this.writeToConsole(entry);
    this.writeToFile(entry);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  child(defaultMeta: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, defaultMeta);
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultMeta: Record<string, unknown>
  ) {}

  debug(message: string, meta?: Record<string, unknown>): void {
    this.parent.debug(message, { ...this.defaultMeta, ...meta });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.parent.info(message, { ...this.defaultMeta, ...meta });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.parent.warn(message, { ...this.defaultMeta, ...meta });
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.parent.error(message, { ...this.defaultMeta, ...meta });
  }
}

export const logger = new Logger();

export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

export default logger;
