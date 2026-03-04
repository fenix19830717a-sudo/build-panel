import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import {
  GenerateContentDto,
  GenerateProductDescriptionDto,
  TranslateDto,
  OptimizeSeoDto,
  GenerateImageDto,
} from './dto';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly apiBase: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('AI_API_KEY') || '';
    this.apiBase = this.configService.get('AI_API_BASE') || 'https://api.openai.com/v1';
  }

  async generateContent(dto: GenerateContentDto) {
    const prompt = this.buildContentPrompt(dto);
    
    // For demo purposes, return mock response
    // In production, call actual AI API
    return {
      content: this.getMockContent(dto.type, dto.industry, dto.language || 'zh-CN'),
      alternatives: [
        'Alternative 1: 精美的内容选项',
        'Alternative 2: 另一个创意文案',
        'Alternative 3: 更多选择',
      ],
      type: dto.type,
      language: dto.language || 'zh-CN',
    };
  }

  async generateProductDescription(dto: GenerateProductDescriptionDto) {
    return {
      description: `这是一款精美的${dto.product_name}，采用顶级材质和精湛工艺打造。${
        dto.features ? dto.features.join('、') : ''
      }，为您带来卓越的使用体验。`,
      highlights: dto.features || ['高品质', '精工细作', '独特设计'],
      seo_keywords: [dto.product_name, '精品', '高端', '定制'],
      tone: dto.tone || 'professional',
    };
  }

  async translate(dto: TranslateDto) {
    // Mock translation - in production, call translation API
    const translations: Record<string, string> = {
      '欢迎来到我们的珠宝店': 'Welcome to our jewelry store',
      '关于我们': 'About Us',
      '产品展示': 'Products',
      '联系我们': 'Contact Us',
    };

    return {
      original: dto.content,
      translated: translations[dto.content] || `[${dto.target_language}] ${dto.content}`,
      target_language: dto.target_language,
      confidence: 0.95,
    };
  }

  async optimizeSeo(dto: OptimizeSeoDto) {
    return {
      title: dto.title 
        ? `${dto.title} | 专业定制 | 高端品牌`
        : '专业定制珠宝 | 手工金饰专家 | 高端品牌',
      description: dto.description 
        ? `${dto.description} 传承百年工艺，匠心打造...`
        : '传承百年工艺，匠心打造每一件精品。我们专注于为客户提供高品质的定制服务。',
      keywords: [
        ...(dto.keywords || []),
        '定制服务',
        '高端品牌',
        '专业工艺',
        '品质保证',
      ],
      suggestions: [
        '建议添加更多长尾关键词',
        '标题长度适中，有利于SEO',
        '可以增加产品描述的关键词密度',
      ],
    };
  }

  async generateImage(dto: GenerateImageDto) {
    // In production, call image generation API (DALL-E, Midjourney, etc.)
    return {
      prompt: dto.prompt,
      size: dto.size || '1024x1024',
      style: dto.style || 'default',
      url: `https://placeholder.co/${dto.size || '1024x1024'}`,
      status: 'generating',
      estimated_time: 30,
    };
  }

  private buildContentPrompt(dto: GenerateContentDto): string {
    return `Generate ${dto.type} content for ${dto.industry} industry in ${dto.language}. Keywords: ${dto.keywords?.join(', ')}. Context: ${dto.context}`;
  }

  private getMockContent(type: string, industry: string, language: string): string {
    const contentMap: Record<string, Record<string, string>> = {
      hero_title: {
        'zh-CN': '臻选手工金饰，传承百年工艺',
        'en': 'Handcrafted Gold Jewelry, Centuries of Excellence',
      },
      about_text: {
        'zh-CN': '我们致力于打造最精美的珠宝饰品，每一件作品都凝聚着匠人的心血与智慧。',
        'en': 'We are dedicated to crafting the finest jewelry, where each piece embodies the heart and wisdom of our artisans.',
      },
      default: {
        'zh-CN': `为${industry}行业生成的优质内容`,
        'en': `Quality content generated for ${industry} industry`,
      },
    };

    return contentMap[type]?.[language] || contentMap.default[language];
  }
}
