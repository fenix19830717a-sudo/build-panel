import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { KnowledgeArticle } from '../../common/entities/knowledge-article.entity';
@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeArticle])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
