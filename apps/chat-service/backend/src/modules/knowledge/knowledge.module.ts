import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeArticle } from '../../common/entities/knowledge-article.entity';
import { KnowledgeCategory } from '../../common/entities/knowledge-category.entity';
@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeArticle, KnowledgeCategory])],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
