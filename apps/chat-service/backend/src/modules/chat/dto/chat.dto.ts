import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  visitorId: string;

  @IsOptional()
  @IsString()
  visitorName?: string;

  @IsOptional()
  @IsString()
  visitorEmail?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;
}

export class SendMessageDto {
  @IsUUID()
  sessionId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  messageType?: string;
}

export class AssignAgentDto {
  @IsUUID()
  agentId: string;
}
