import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
export declare class TasksService {
    private tasksRepository;
    private tasksQueue;
    constructor(tasksRepository: Repository<Task>, tasksQueue: Queue);
    findAll(userId: string, status?: TaskStatus): Promise<Task[]>;
    findOne(id: string, userId: string): Promise<Task>;
    create(createTaskDto: CreateTaskDto, userId: string): Promise<Task>;
    cancel(id: string, userId: string): Promise<Task>;
    remove(id: string, userId: string): Promise<void>;
    updateStatus(id: string, status: TaskStatus, result?: Record<string, any>, error?: string): Promise<void>;
}
