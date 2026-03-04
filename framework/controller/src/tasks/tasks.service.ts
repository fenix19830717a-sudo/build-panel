import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectQueue('tasks')
    private tasksQueue: Queue,
  ) {}

  async findAll(userId: string, status?: TaskStatus): Promise<Task[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    return this.tasksRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId,
      status: TaskStatus.PENDING,
    });

    const saved = await this.tasksRepository.save(task);

    // Add to queue
    await this.tasksQueue.add('process', {
      taskId: saved.id,
      type: saved.type,
      payload: saved.payload,
    });

    return saved;
  }

  async cancel(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    
    if (task.status === TaskStatus.RUNNING) {
      // Try to get the job and cancel it
      const job = await this.tasksQueue.getJob(id);
      if (job) {
        await job.discard();
      }
    }

    task.status = TaskStatus.CANCELLED;
    task.completedAt = new Date();
    return this.tasksRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.tasksRepository.remove(task);
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    result?: Record<string, any>,
    error?: string,
  ): Promise<void> {
    const update: any = { status };
    
    if (status === TaskStatus.RUNNING) {
      update.startedAt = new Date();
    }
    
    if ([TaskStatus.SUCCESS, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(status)) {
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
}
