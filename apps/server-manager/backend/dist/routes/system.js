"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 系统信息路由
 */
const express_1 = require("express");
const response_1 = require("../utils/response");
const system_1 = require("../utils/system");
const router = (0, express_1.Router)();
// 获取完整系统信息
router.get('/info', async (req, res) => {
    try {
        const info = await (0, system_1.getSystemInfo)();
        (0, response_1.successResponse)(res, info);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to get system info');
    }
});
// 获取 CPU 信息
router.get('/cpu', async (req, res) => {
    try {
        const cpu = await (0, system_1.getCpuInfo)();
        (0, response_1.successResponse)(res, cpu);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to get CPU info');
    }
});
// 获取内存信息
router.get('/memory', async (req, res) => {
    try {
        const memory = await (0, system_1.getMemoryInfo)();
        (0, response_1.successResponse)(res, memory);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to get memory info');
    }
});
// 获取磁盘信息
router.get('/disk', async (req, res) => {
    try {
        const disk = await (0, system_1.getDiskInfo)();
        (0, response_1.successResponse)(res, disk);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to get disk info');
    }
});
// 获取网络信息
router.get('/network', async (req, res) => {
    try {
        const network = await (0, system_1.getNetworkInfo)();
        (0, response_1.successResponse)(res, network);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to get network info');
    }
});
exports.default = router;
//# sourceMappingURL=system.js.map