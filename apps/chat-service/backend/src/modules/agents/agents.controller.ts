import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto, LoginDto } from './dto/agent.dto';
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}
  @Post()
  create(@Body() dto: CreateAgentDto) { return this.agentsService.create(dto); }
  @Get()
  findAll() { return this.agentsService.findAll(); }
  @Get('online')
  findOnline() { return this.agentsService.findOnline(); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.agentsService.findOne(id); }
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAgentDto) { return this.agentsService.updateStatus(id, dto.status); }
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const agent = await this.agentsService.validateLogin(dto.email, dto.password);
    if (!agent) return { success: false, message: 'Invalid credentials' };
    await this.agentsService.updateStatus(agent.id, 'online');
    return { success: true, agent };
  }
}
