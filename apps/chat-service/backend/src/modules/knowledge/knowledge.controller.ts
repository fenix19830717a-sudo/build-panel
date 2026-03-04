import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { CreateCategoryDto, CreateArticleDto } from './dto/knowledge.dto';
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) { return this.knowledgeService.createCategory(dto); }
  @Get('categories')
  findAllCategories() { return this.knowledgeService.findAllCategories(); }
  @Post('articles')
  createArticle(@Body() dto: CreateArticleDto) { return this.knowledgeService.createArticle(dto, 'system'); }
  @Get('articles')
  findAllArticles() { return this.knowledgeService.findAllArticles(); }
  @Get('articles/search')
  search(@Query('q') query: string) { return this.knowledgeService.search(query); }
}
