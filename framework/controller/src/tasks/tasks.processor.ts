import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { Logger } from '@nestjs/common';

interface TaskJobData {
  taskId: string;
  type: string;
  payload: Record<string, any>;
}

@Processor('tasks')
export class TasksProcessor {
  private readonly logger = new Logger(TasksProcessor.name);

  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  @Process('process')
  async handleTask(job: Job<TaskJobData>) {
    const { taskId, type, payload } = job.data;
    
    this.logger.log(`Processing task ${taskId} of type ${type}`);

    // Update status to running
    await this.tasksRepository.update(taskId, {
      status: TaskStatus.RUNNING,
      startedAt: new Date(),
    });

    try {
      let result: any;

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

      // Update status to success
      await this.tasksRepository.update(taskId, {
        status: TaskStatus.SUCCESS,
        result,
        completedAt: new Date(),
      });

      this.logger.log(`Task ${taskId} completed successfully`);
    } catch (error) {
      // Update status to failed
      await this.tasksRepository.update(taskId, {
        status: TaskStatus.FAILED,
        error: error.message,
        completedAt: new Date(),
      });

      this.logger.error(`Task ${taskId} failed: ${error.message}`);
    }
  }

  private async handleDeploy(payload: any): Promise<any> {
    // Simulate deployment logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { deployed: true, containerId: `container_${Date.now()}` };
  }

  private async handleExec(payload: any): Promise<any> {
    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { executed: true, output: 'Command executed successfully' };
  }

  private async handleUpdate(payload: any): Promise<any> {
    // Simulate update logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { updated: true, version: payload.version };
  }
}
