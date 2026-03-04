"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const logger_1 = __importDefault(require("../utils/logger"));
function errorHandler(err, req, res, next) {
    logger_1.default.error('Unhandled error:', err);
    res.status(500).json({
        code: 500,
        message: err.message || 'Internal Server Error',
        data: null
    });
}
function notFoundHandler(req, res, next) {
    res.status(404).json({
        code: 404,
        message: `Route ${req.originalUrl} not found`,
        data: null
    });
}
//# sourceMappingURL=error.js.map