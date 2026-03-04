"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TasksProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
const common_1 = require("@nestjs/common");
let TasksProcessor = TasksProcessor_1 = class TasksProcessor {
    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
        this.logger = new common_1.Logger(TasksProcessor_1.name);
    }
    async handleTask(job) {
        const { taskId, type, payload } = job.data;
        this.logger.log(`Processing task ${taskId} of type ${type}`);
        await this.tasksRepository.update(taskId, {
            status: task_entity_1.TaskStatus.RUNNING,
            startedAt: new Date(),
        });
        try {
            let result;
            switch (type) {
                case 'deploy':
                    result = await this.handleDeploy(payload);
                    break;
                case 'exec':
                    result = await this.handleExec(payload);
                    break;
                case 'update':
                    result = await this.handleUpdate(payload);
                    break;
                default:
                    throw new Error(`Unknown task type: ${type}`);
            }
            await this.tasksRepository.update(taskId, {
                status: task_entity_1.TaskStatus.SUCCESS,
                result,
                completedAt: new Date(),
            });
            this.logger.log(`Task ${taskId} completed successfully`);
        }
        catch (error) {
            await this.tasksRepository.update(taskId, {
                status: task_entity_1.TaskStatus.FAILED,
                error: error.message,
                completedAt: new Date(),
            });
            this.logger.error(`Task ${taskId} failed: ${error.message}`);
        }
    }
    async handleDeploy(payload) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { deployed: true, containerId: `container_${Date.now()}` };
    }
    async handleExec(payload) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { executed: true, output: 'Command executed successfully' };
    }
    async handleUpdate(payload) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { updated: true, version: payload.version };
    }
};
exports.TasksProcessor = TasksProcessor;
__decorate([
    (0, bull_1.Process)('process'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksProcessor.prototype, "handleTask", null);
exports.TasksProcessor = TasksProcessor = TasksProcessor_1 = __decorate([
    (0, bull_1.Processor)('tasks'),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksProcessor);
//# sourceMappingURL=tasks.processor.js.map