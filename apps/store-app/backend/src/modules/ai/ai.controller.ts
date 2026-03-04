import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  GenerateProductDescriptionDto,
  TranslateProductDto,
  GetRecommendationsDto,
  ChatMessageDto,
  AIResponseDto,
} from './dto/ai.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('products/generate')
  @ApiOperation({ summary: 'AI生成产品描述' })
  @ApiResponse({ status: 200, description: '成功生成产品描述', type: AIResponseDto })
  async generateProductDescription(@Body() dto: GenerateProductDescriptionDto): Promise<AIResponseDto> {
    return this.aiService.generateProductDescription(dto);
  }

  @Post('products/translate')
  @ApiOperation({ summary: 'AI翻译产品内容' })
  @ApiResponse({ status: 200, description: '成功翻译产品内容', type: AIResponseDto })
  async translateProduct(@Body() dto: TranslateProductDto): Promise<AIResponseDto> {
    return this.aiService.translateProduct(dto);
  }

  @Post('recommendations')
  @ApiOperation({ summary: 'AI产品推荐' })
  @ApiResponse({ status: 200, description: '成功获取推荐产品' })
  async getRecommendations(@Body() dto: GetRecommendationsDto): Promise<any> {
    return this.aiService.getRecommendations(dto);
  }

  @Post('chat')
  @ApiOperation({ summary: 'AI客服聊天' })
  @ApiResponse({ status: 200, description: '成功获取AI回复', type: AIResponseDto })
  async chat(@Body() dto: ChatMessageDto): Promise<AIResponseDto> {
    return this.aiService.chat(dto);
  }
}
