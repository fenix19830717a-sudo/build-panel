import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './entities/task.entity';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(req: any, status?: TaskStatus): Promise<import("./entities/task.entity").Task[]>;
    findOne(id: string, req: any): Promise<import("./entities/task.entity").Task>;
    create(createTaskDto: CreateTaskDto, req: any): Promise<import("./entities/task.entity").Task>;
    cancel(id: string, req: any): Promise<import("./entities/task.entity").Task>;
    remove(id: string, req: any): Promise<void>;
}
