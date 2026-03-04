/**
 * API 响应工具
 */
import { Response } from 'express';
import { ApiResponse } from '../types';

export function successResponse<T>(res: Response, data: T, message: string = 'Success'): void {
  const response: ApiResponse<T> = {
    code: 0,
    message,
    data
  };
  res.json(response);
}

export function errorResponse(res: Response, message: string, code: number = 500, statusCode: number = 200): void {
  const response: ApiResponse = {
    code,
    message,
    data: null
  };
  res.status(statusCode).json(response);
}

export function notFoundResponse(res: Response, message: string = 'Resource not found'): void {
  errorResponse(res, message, 404, 404);
}

export function badRequestResponse(res: Response, message: string): void {
  errorResponse(res, message, 400, 200);
}
