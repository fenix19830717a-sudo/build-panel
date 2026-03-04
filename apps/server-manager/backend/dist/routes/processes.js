"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 进程管理路由
 */
const express_1 = require("express");
const response_1 = require("../utils/response");
const system_1 = require("../utils/system");
const router = (0, express_1.Router)();
// 获取进程列表
router.get('/list', async (req, res) => {
    try {
        const processes = await (0, system_1.getProcesses)();
        (0, response_1.successResponse)(res, processes);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to get process list');
    }
});
// 结束进程
router.post('/kill', async (req, res) => {
    try {
        const { pid, signal = 'SIGTERM' } = req.body;
        if (!pid || typeof pid !== 'number') {
            return (0, response_1.badRequestResponse)(res, 'Valid PID is required');
        }
        const success = await (0, system_1.killProcess)(pid, signal);
        if (success) {
            (0, response_1.successResponse)(res, { pid }, `Process ${pid} terminated`);
        }
        else {
            (0, response_1.errorResponse)(res, `Failed to terminate process ${pid}`);
        }
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to kill process');
    }
});
// 获取特定进程信息
router.get('/:pid', async (req, res) => {
    try {
        const pid = parseInt(req.params.pid);
        if (isNaN(pid)) {
            return (0, response_1.badRequestResponse)(res, 'Invalid PID');
        }
        const processes = await (0, system_1.getProcesses)();
        const process = processes.find(p => p.pid === pid);
        if (!process) {
            return (0, response_1.errorResponse)(res, 'Process not found', 404);
        }
        (0, response_1.successResponse)(res, process);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to get process info');
    }
});
exports.default = router;
//# sourceMappingURL=processes.js.map