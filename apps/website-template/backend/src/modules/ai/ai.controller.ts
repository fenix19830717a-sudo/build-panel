import {
  Controller,
  Post,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  GenerateContentDto,
  GenerateProductDescriptionDto,
  TranslateDto,
  OptimizeSeoDto,
  GenerateImageDto,
} from './dto';

@ApiTags('AI')
@Controller('api/v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('content/generate')
  @ApiOperation({ summary: '生成内容' })
  @ApiResponse({ status: HttpStatus.OK, description: '生成成功' })
  generateContent(@Body() dto: GenerateContentDto) {
    return this.aiService.generateContent(dto);
  }

  @Post('products/description')
  @ApiOperation({ summary: '生成产品描述' })
  @ApiResponse({ status: HttpStatus.OK, description: '生成成功' })
  generateProductDescription(@Body() dto: GenerateProductDescriptionDto) {
    return this.aiService.generateProductDescription(dto);
  }

  @Post('translate')
  @ApiOperation({ summary: '翻译' })
  @ApiResponse({ status: HttpStatus.OK, description: '翻译成功' })
  translate(@Body() dto: TranslateDto) {
    return this.aiService.translate(dto);
  }

  @Post('seo/optimize')
  @ApiOperation({ summary: 'SEO优化' })
  @ApiResponse({ status: HttpStatus.OK, description: '优化成功' })
  optimizeSeo(@Body() dto: OptimizeSeoDto) {
    return this.aiService.optimizeSeo(dto);
  }

  @Post('images/generate')
  @ApiOperation({ summary: '生成图片' })
  @ApiResponse({ status: HttpStatus.OK, description: '生成成功' })
  generateImage(@Body() dto: GenerateImageDto) {
    return this.aiService.generateImage(dto);
  }
}
