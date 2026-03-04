import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Article, ArticleStatus } from './entities/article.entity';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto } from './dto/article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 255);
  }

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const slug = this.generateSlug(createArticleDto.title);
    const existing = await this.articleRepository.findOne({ where: { slug } });
    
    const finalSlug = existing 
      ? `${slug}-${Date.now()}` 
      : slug;

    const article = this.articleRepository.create({
      ...createArticleDto,
      slug: finalSlug,
    });

    return this.articleRepository.save(article);
  }

  async findAll(query: ArticleQueryDto): Promise<{ items: Article[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      categoryId,
      tagId,
      status,
      search,
      orderBy = 'createdAt',
      order = 'DESC',
    } = query;

    const where: any = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (search) {
      where.title = Like(`%${search}%`);
    }

    const findOptions: FindManyOptions<Article> = {
      where,
      relations: ['category', 'tags'],
      order: { [orderBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [items, total] = await this.articleRepository.findAndCount(findOptions);

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }

    return article;
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { slug, status: ArticleStatus.PUBLISHED },
      relations: ['category', 'tags'],
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    await this.articleRepository.increment({ id: article.id }, 'views', 1);
    article.views += 1;

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);

    if (updateArticleDto.title && updateArticleDto.title !== article.title) {
      updateArticleDto.slug = this.generateSlug(updateArticleDto.title);
    }

    Object.assign(article, updateArticleDto);
    return this.articleRepository.save(article);
  }

  async remove(id: string): Promise<void> {
    const article = await this.findOne(id);
    await this.articleRepository.softRemove(article);
  }

  async incrementViews(id: string): Promise<void> {
    await this.articleRepository.increment({ id }, 'views', 1);
  }

  async getPopularArticles(limit: number = 5): Promise<Article[]> {
    return this.articleRepository.find({
      where: { status: ArticleStatus.PUBLISHED },
      order: { views: 'DESC' },
      take: limit,
      relations: ['category'],
    });
  }

  async getRecentArticles(limit: number = 5): Promise<Article[]> {
    return this.articleRepository.find({
      where: { status: ArticleStatus.PUBLISHED },
      order: { publishedAt: 'DESC' },
      take: limit,
      relations: ['category'],
    });
  }
}
