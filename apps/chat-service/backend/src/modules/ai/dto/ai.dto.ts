import { IsString, IsOptional } from 'class-validator';
export class AiChatReplyDto {
  @IsString()
  message: string;
}
export class AiTicketClassifyDto {
  @IsString()
  title: string;
  @IsString()
  description: string;
}
export class AiIntentRecognizeDto {
  @IsString()
  message: string;
}
export class AiKnowledgeBuildDto {
  @IsString()
  content: string;
  @IsOptional()
  @IsString()
  title?: string;
}
