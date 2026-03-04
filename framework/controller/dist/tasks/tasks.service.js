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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const task_entity_1 = require("./entities/task.entity");
let TasksService = class TasksService {
    constructor(tasksRepository, tasksQueue) {
        this.tasksRepository = tasksRepository;
        this.tasksQueue = tasksQueue;
    }
    async findAll(userId, status) {
        const where = { userId };
        if (status) {
            where.status = status;
        }
        return this.tasksRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const task = await this.tasksRepository.findOne({
            where: { id, userId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    async create(createTaskDto, userId) {
        const task = this.tasksRepository.create({
            ...createTaskDto,
            userId,
            status: task_entity_1.TaskStatus.PENDING,
        });
        const saved = await this.tasksRepository.save(task);
        await this.tasksQueue.add('process', {
            taskId: saved.id,
            type: saved.type,
            payload: saved.payload,
        });
        return saved;
    }
    async cancel(id, userId) {
        const task = await this.findOne(id, userId);
        if (task.status === task_entity_1.TaskStatus.RUNNING) {
            const job = await this.tasksQueue.getJob(id);
            if (job) {
                await job.discard();
            }
        }
        task.status = task_entity_1.TaskStatus.CANCELLED;
        task.completedAt = new Date();
        return this.tasksRepository.save(task);
    }
    async remove(id, userId) {
        const task = await this.findOne(id, userId);
        await this.tasksRepository.remove(task);
    }
    async updateStatus(id, status, result, error) {
        const update = { status };
        if (status === task_entity_1.TaskStatus.RUNNING) {
            update.startedAt = new Date();
        }
        if ([task_entity_1.TaskStatus.SUCCESS, task_entity_1.TaskStatus.FAILED, task_entity_1.TaskStatus.CANCELLED].includes(status)) {
            update.completedAt = new Date();
        }
        if (result) {
            update.result = result;
        }
        if (error) {
            update.error = error;
        }
        await this.tasksRepository.update(id, update);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, bull_1.InjectQueue)('tasks')),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], TasksService);
//# sourceMappingURL=tasks.service.js.map