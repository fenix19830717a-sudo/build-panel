/**
 * API 响应工具
 */
import { Response } from 'express';
export declare function successResponse<T>(res: Response, data: T, message?: string): void;
export declare function errorResponse(res: Response, message: string, code?: number, statusCode?: number): void;
export declare function notFoundResponse(res: Response, message?: string): void;
export declare function badRequestResponse(res: Response, message: string): void;
//# sourceMappingURL=response.d.ts.map