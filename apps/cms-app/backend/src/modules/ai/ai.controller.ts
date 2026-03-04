import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('articles/write')
  @ApiOperation({ summary: 'AI写文章' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: '写作提示/主题' },
        options: {
          type: 'object',
          properties: {
            tone: { type: 'string', enum: ['专业', '轻松', '幽默', '正式'] },
            length: { type: 'string', enum: ['短', '中等', '长'] },
            language: { type: 'string', default: '中文' },
          },
        },
      },
      required: ['prompt'],
    },
  })
  @ApiResponse({ status: 200, description: 'AI生成的文章内容' })
  async writeArticle(
    @Body('prompt') prompt: string,
    @Body('options') options?: { tone?: string; length?: string; language?: string },
  ) {
    return this.aiService.writeArticle(prompt, options);
  }

  @Post('articles/summary')
  @ApiOperation({ summary: 'AI生成摘要' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: '文章内容' },
        maxLength: { type: 'number', description: '摘要最大长度' },
      },
      required: ['content'],
    },
  })
  @ApiResponse({ status: 200, description: '生成的摘要' })
  async generateSummary(
    @Body('content') content: string,
    @Body('maxLength') maxLength?: number,
  ) {
    const summary = await this.aiService.generateSummary(content, maxLength);
    return { summary };
  }

  @Post('seo/optimize')
  @ApiOperation({ summary: 'AI SEO优化' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: '文章内容' },
        currentTitle: { type: 'string', description: '当前标题' },
      },
      required: ['content'],
    },
  })
  @ApiResponse({ status: 200, description: 'SEO优化建议' })
  async optimizeSEO(
    @Body('content') content: string,
    @Body('currentTitle') currentTitle?: string,
  ) {
    return this.aiService.optimizeSEO(content, currentTitle);
  }

  @Post('images/generate')
  @ApiOperation({ summary: 'AI生成配图' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: '图片描述' },
        options: {
          type: 'object',
          properties: {
            size: { type: 'string', enum: ['256x256', '512x512', '1024x1024'] },
            style: { type: 'string', enum: ['写实', '艺术', '卡通'] },
          },
        },
      },
      required: ['prompt'],
    },
  })
  @ApiResponse({ status: 200, description: '生成的图片URL' })
  async generateImage(
    @Body('prompt') prompt: string,
    @Body('options') options?: { size?: string; style?: string },
  ) {
    return this.aiService.generateImage(prompt, options);
  }

  @Post('tags/suggest')
  @ApiOperation({ summary: 'AI推荐标签' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: '文章内容' },
        existingTags: { type: 'array', items: { type: 'string' } },
      },
      required: ['content'],
    },
  })
  @ApiResponse({ status: 200, description: '推荐标签列表' })
  async suggestTags(
    @Body('content') content: string,
    @Body('existingTags') existingTags?: string[],
  ) {
    const tags = await this.aiService.suggestTags(content, existingTags);
    return { tags };
  }

  @Post('writing/improve')
  @ApiOperation({ summary: 'AI改进写作' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: '原始内容' },
        type: { type: 'string', enum: ['grammar', 'style', 'clarity'], default: 'clarity' },
      },
      required: ['content'],
    },
  })
  @ApiResponse({ status: 200, description: '改进后的内容' })
  async improveWriting(
    @Body('content') content: string,
    @Body('type') type: 'grammar' | 'style' | 'clarity' = 'clarity',
  ) {
    const improved = await this.aiService.improveWriting(content, type);
    return { improved };
  }
}
