"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
exports.notFoundResponse = notFoundResponse;
exports.badRequestResponse = badRequestResponse;
function successResponse(res, data, message = 'Success') {
    const response = {
        code: 0,
        message,
        data
    };
    res.json(response);
}
function errorResponse(res, message, code = 500, statusCode = 200) {
    const response = {
        code,
        message,
        data: null
    };
    res.status(statusCode).json(response);
}
function notFoundResponse(res, message = 'Resource not found') {
    errorResponse(res, message, 404, 404);
}
function badRequestResponse(res, message) {
    errorResponse(res, message, 400, 200);
}
//# sourceMappingURL=response.js.map