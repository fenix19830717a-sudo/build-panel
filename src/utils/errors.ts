export interface ErrorDetails {
  [key: string]: unknown;
}

export interface AppErrorOptions {
  message: string;
  code?: string;
  statusCode?: number;
  details?: ErrorDetails;
  cause?: Error;
}

export class AppError extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: ErrorDetails;
  public readonly isOperational: boolean;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode || 500;
    this.code = options.code || 'INTERNAL_ERROR';
    this.details = options.details || {};
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);

    if (options.cause) {
      this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`;
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      stack: process.env.NODE_ENV !== 'production' ? this.stack : undefined
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super({
      message,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: ErrorDetails) {
    super({
      message,
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
      details
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: ErrorDetails) {
    super({
      message,
      code: 'AUTHORIZATION_ERROR',
      statusCode: 403,
      details
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', details?: ErrorDetails) {
    super({
      message: `${resource} not found`,
      code: 'NOT_FOUND',
      statusCode: 404,
      details
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super({
      message,
      code: 'CONFLICT',
      statusCode: 409,
      details
    });
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: ErrorDetails) {
    super({
      message,
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      details
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, details?: ErrorDetails) {
    super({
      message: message || `External service '${service}' is unavailable`,
      code: 'EXTERNAL_SERVICE_ERROR',
      statusCode: 503,
      details: { service, ...details }
    });
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: ErrorDetails, cause?: Error) {
    super({
      message,
      code: 'DATABASE_ERROR',
      statusCode: 500,
      details,
      cause
    });
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super({
      message,
      code: 'CONFIGURATION_ERROR',
      statusCode: 500,
      details
    });
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message: string = 'Payment required', details?: ErrorDetails) {
    super({
      message,
      code: 'PAYMENT_REQUIRED',
      statusCode: 402,
      details
    });
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super({
      message,
      code: 'BAD_REQUEST',
      statusCode: 400,
      details
    });
  }
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  return String(error);
}

export function getErrorStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
}
