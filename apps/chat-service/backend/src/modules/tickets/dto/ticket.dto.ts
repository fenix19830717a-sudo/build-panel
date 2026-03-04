import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
export class CreateTicketDto {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsString()
  visitorId: string;
  @IsOptional()
  @IsEnum(['low','medium','high','urgent'])
  priority?: string;
}
export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
