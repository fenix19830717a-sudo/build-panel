import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto } from './dto/article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({ status: 201, description: 'Article created successfully', type: Article })
  async create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'tagId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'archived'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of articles' })
  async findAll(@Query() query: ArticleQueryDto) {
    return this.articlesService.findAll(query);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular articles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of popular articles' })
  async getPopular(@Query('limit') limit: number = 5): Promise<Article[]> {
    return this.articlesService.getPopularArticles(limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent articles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of recent articles' })
  async getRecent(@Query('limit') limit: number = 5): Promise<Article[]> {
    return this.articlesService.getRecentArticles(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Article found', type: Article })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Article> {
    return this.articlesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get article by slug' })
  @ApiParam({ name: 'slug', type: String })
  @ApiResponse({ status: 200, description: 'Article found', type: Article })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findBySlug(@Param('slug') slug: string): Promise<Article> {
    return this.articlesService.findBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update article by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateArticleDto })
  @ApiResponse({ status: 200, description: 'Article updated', type: Article })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete article by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Article deleted' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.articlesService.remove(id);
  }
}
