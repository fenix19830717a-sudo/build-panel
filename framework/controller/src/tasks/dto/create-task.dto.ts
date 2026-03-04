import { IsString, IsOptional, IsObject, IsIn } from 'class-validator';

const TASK_TYPES = ['deploy', 'exec', 'update', 'backup', 'restore'];
const TARGET_TYPES = ['server', 'app', 'system'];

export class CreateTaskDto {
  @IsString()
  @IsIn(TASK_TYPES)
  type: string;

  @IsString()
  @IsIn(TARGET_TYPES)
  targetType: string;

  @IsString()
  targetId: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}
