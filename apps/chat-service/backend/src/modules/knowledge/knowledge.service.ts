import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeArticle } from '../../common/entities/knowledge-article.entity';
import { KnowledgeCategory } from '../../common/entities/knowledge-category.entity';
import { CreateCategoryDto, CreateArticleDto } from './dto/knowledge.dto';
@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeArticle) private articleRepository: Repository<KnowledgeArticle>,
    @InjectRepository(KnowledgeCategory) private categoryRepository: Repository<KnowledgeCategory>,
  ) {}
  async createCategory(dto: CreateCategoryDto): Promise<KnowledgeCategory> {
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }
  async findAllCategories(): Promise<KnowledgeCategory[]> {
    return this.categoryRepository.find({ where: { isActive: true } });
  }
  async createArticle(dto: CreateArticleDto, createdBy: string): Promise<KnowledgeArticle> {
    const article = this.articleRepository.create({ ...dto, createdBy, publishedAt: dto.isPublished ? new Date() : null });
    return this.articleRepository.save(article);
  }
  async findAllArticles(): Promise<KnowledgeArticle[]> {
    return this.articleRepository.find({ where: { isPublished: true }, relations: ['category'] });
  }
  async search(query: string): Promise<KnowledgeArticle[]> {
    return this.articleRepository.createQueryBuilder('article')
      .where('article.isPublished = true')
      .andWhere('(article.title ILIKE :query OR article.content ILIKE :query)', { query: `%${query}%` })
      .getMany();
  }
}
