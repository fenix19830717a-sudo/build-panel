import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './modules/chat/chat.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AgentsModule } from './modules/agents/agents.module';
import { AiModule } from './modules/ai/ai.module';
import { ChatSession } from './common/entities/chat-session.entity';
import { ChatMessage } from './common/entities/chat-message.entity';
import { Ticket } from './common/entities/ticket.entity';
import { KnowledgeArticle } from './common/entities/knowledge-article.entity';
import { KnowledgeCategory } from './common/entities/knowledge-category.entity';
import { Agent } from './common/entities/agent.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'chat_service',
      entities: [ChatSession, ChatMessage, Ticket, KnowledgeArticle, KnowledgeCategory, Agent],
      synchronize: true,
    }),
    ChatModule,
    TicketsModule,
    KnowledgeModule,
    AgentsModule,
    AiModule,
  ],
})
export class AppModule {}
