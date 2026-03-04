import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiChatReplyDto, AiTicketClassifyDto, AiIntentRecognizeDto, AiKnowledgeBuildDto } from './dto/ai.dto';
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Post('chat/reply')
  async chatReply(@Body() dto: AiChatReplyDto) {
    return { success: true, data: await this.aiService.chatReply(dto.message) };
  }
  @Post('tickets/classify')
  async classifyTicket(@Body() dto: AiTicketClassifyDto) {
    return { success: true, data: await this.aiService.classifyTicket(dto.title, dto.description) };
  }
  @Post('intent/recognize')
  async recognizeIntent(@Body() dto: AiIntentRecognizeDto) {
    return { success: true, data: await this.aiService.recognizeIntent(dto.message) };
  }
  @Post('knowledge/build')
  async buildKnowledge(@Body() dto: AiKnowledgeBuildDto) {
    return { success: true, data: await this.aiService.buildKnowledge(dto.content, dto.title) };
  }
}
