import { Job } from 'bull';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
interface TaskJobData {
    taskId: string;
    type: string;
    payload: Record<string, any>;
}
export declare class TasksProcessor {
    private tasksRepository;
    private readonly logger;
    constructor(tasksRepository: Repository<Task>);
    handleTask(job: Job<TaskJobData>): Promise<void>;
    private handleDeploy;
    private handleExec;
    private handleUpdate;
}
export {};
