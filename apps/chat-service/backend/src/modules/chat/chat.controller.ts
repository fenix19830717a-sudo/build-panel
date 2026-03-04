import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateSessionDto, SendMessageDto, AssignAgentDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  createSession(@Body() dto: CreateSessionDto) {
    return this.chatService.createSession(dto);
  }

  @Get('sessions')
  getSessions(@Query('agentId') agentId?: string) {
    return agentId ? this.chatService.findSessionsByAgent(agentId) : this.chatService.findActiveSessions();
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string) {
    return this.chatService.findSessionById(id);
  }

  @Post('messages')
  sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(dto);
  }

  @Get('sessions/:id/messages')
  getMessages(@Param('id') sessionId: string) {
    return this.chatService.getMessages(sessionId);
  }

  @Post('sessions/:id/assign')
  assignAgent(@Param('id') sessionId: string, @Body() dto: AssignAgentDto) {
    return this.chatService.assignAgent(sessionId, dto.agentId);
  }

  @Post('sessions/:id/close')
  closeSession(@Param('id') sessionId: string) {
    return this.chatService.closeSession(sessionId);
  }

  @Post('sessions/:id/read')
  markAsRead(@Param('id') sessionId: string, @Body('senderType') senderType: string) {
    return this.chatService.markMessagesAsRead(sessionId, senderType);
  }
}
