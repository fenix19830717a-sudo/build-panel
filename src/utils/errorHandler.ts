import { Request, Response, NextFunction, RequestHandler } from 'express';
import { 
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  DatabaseError,
  BadRequestError,
  PaymentRequiredError,
  isAppError, 
  getErrorMessage, 
  getErrorStatusCode,
  ErrorDetails 
} from './errors';
import { logger } from './logger';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetails;
    stack?: string;
  };
  timestamp: string;
  path: string;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = getErrorStatusCode(err);
  const message = getErrorMessage(err);
  
  const isOperational = isAppError(err) && err.isOperational;
  
  if (statusCode >= 500) {
    logger.error('Server Error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    });
  } else if (statusCode >= 400) {
    logger.warn('Client Error', {
      error: err.message,
      path: req.path,
      method: req.method
    });
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code: isAppError(err) ? err.code : 'INTERNAL_ERROR',
      message: message,
      details: isAppError(err) ? err.details : undefined,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    },
    timestamp: new Date().toISOString(),
    path: req.path
  };

  if (!isOperational && statusCode >= 500) {
    response.error.message = 'An unexpected error occurred';
    if (process.env.NODE_ENV !== 'production') {
      response.error.message = message;
    }
  }

  res.status(statusCode).json(response);
}

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export type ErrorType = 
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'notFound'
  | 'conflict'
  | 'rateLimit'
  | 'externalService'
  | 'database'
  | 'badRequest'
  | 'paymentRequired';

export interface CreateErrorOptions {
  type: ErrorType;
  message: string;
  details?: ErrorDetails;
  cause?: Error;
}

export function createError(options: CreateErrorOptions): AppError {
  const { type, message, details, cause } = options;

  switch (type) {
    case 'validation':
      return new ValidationError(message, details);
    case 'authentication':
      return new AuthenticationError(message, details);
    case 'authorization':
      return new AuthorizationError(message, details);
    case 'notFound':
      return new NotFoundError(message, details);
    case 'conflict':
      return new ConflictError(message, details);
    case 'rateLimit':
      return new RateLimitError(message, details);
    case 'externalService':
      return new ExternalServiceError(message, undefined, details);
    case 'database':
      return new DatabaseError(message, details, cause);
    case 'badRequest':
      return new BadRequestError(message, details);
    case 'paymentRequired':
      return new PaymentRequiredError(message, details);
    default:
      return new AppError({
        message,
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        details,
        cause
      });
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
}

export function wrapAsyncRouter(router: Record<string, (...args: unknown[]) => unknown>): void {
  Object.keys(router).forEach((key) => {
    const original = router[key];
    if (typeof original === 'function') {
      router[key] = (...args: unknown[]) => {
        const result = original.apply(router, args);
        if (result instanceof Promise) {
          const next = args[args.length - 1] as NextFunction;
          return result.catch(next);
        }
        return result;
      };
    }
  });
}
