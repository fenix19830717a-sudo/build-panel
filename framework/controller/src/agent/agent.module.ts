import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AgentClient } from './agent-client.service';

@Module({
  imports: [HttpModule],
  providers: [AgentClient],
  exports: [AgentClient],
})
export class AgentModule {}
