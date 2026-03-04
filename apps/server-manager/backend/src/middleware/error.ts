/**
 * 错误处理中间件
 */
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    code: 500,
    message: err.message || 'Internal Server Error',
    data: null
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    code: 404,
    message: `Route ${req.originalUrl} not found`,
    data: null
  });
}
