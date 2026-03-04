import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import {
  GenerateProductDescriptionDto,
  TranslateProductDto,
  GetRecommendationsDto,
  ChatMessageDto,
  AIResponseDto,
} from './dto/ai.dto';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * AI生成产品描述
   * 目前使用模拟数据，实际应该调用OpenAI API或其他AI服务
   */
  async generateProductDescription(dto: GenerateProductDescriptionDto): Promise<AIResponseDto> {
    const { productName, features = [], targetAudience = 'general', tone = 'professional' } = dto;
    
    // 模拟AI生成描述
    const descriptions: Record<string, string[]> = {
      professional: [
        `Introducing ${productName}, a premium product designed for ${targetAudience}. `,
        `Crafted with precision and attention to detail, ${productName} delivers exceptional performance. `,
      ],
      casual: [
        `Meet ${productName} - your new favorite! Perfect for ${targetAudience}. `,
        `You'll love ${productName}! It's designed to make your life easier. `,
      ],
      luxury: [
        `Experience the epitome of elegance with ${productName}. `,
        `${productName} represents the finest in craftsmanship for the discerning ${targetAudience}. `,
      ],
    };
    
    let content = descriptions[tone]?.[Math.floor(Math.random() * 2)] || descriptions.professional[0];
    
    if (features.length > 0) {
      content += '\n\nKey Features:\n';
      features.forEach((feature, index) => {
        content += `${index + 1}. ${feature}\n`;
      });
    }
    
    content += `\nPerfect for ${targetAudience} who demand the best.`;
    
    return { content };
  }

  /**
   * AI翻译产品内容
   */
  async translateProduct(dto: TranslateProductDto): Promise<AIResponseDto> {
    const { content, targetLanguage, sourceLanguage = 'en' } = dto;
    
    // 模拟翻译
    const translations: Record<string, string> = {
      'zh-CN': `【中文翻译】${content}`,
      'zh-TW': `【繁體中文翻譯】${content}`,
      'ja': `【日本語翻訳】${content}`,
      'ko': `【한국어 번역】${content}`,
      'es': `[Spanish Translation] ${content}`,
      'fr': `[Traduction Française] ${content}`,
      'de': `[Deutsche Übersetzung] ${content}`,
    };
    
    const translatedContent = translations[targetLanguage] || `[Translated to ${targetLanguage}] ${content}`;
    
    return { content: translatedContent };
  }

  /**
   * AI产品推荐
   */
  async getRecommendations(dto: GetRecommendationsDto): Promise<any> {
    const { productId, limit = 4 } = dto;
    
    // 获取当前产品
    const currentProduct = await this.productRepository.findOne({
      where: { id: productId },
    });
    
    if (!currentProduct) {
      return { products: [], reason: 'Product not found' };
    }
    
    // 获取同类别的产品作为推荐
    const relatedProducts = await this.productRepository.find({
      where: {
        categoryId: currentProduct.categoryId,
        id: productId, // 排除当前产品
        isActive: true,
      },
      take: limit,
    });
    
    // 如果同类别的产品不够，获取其他热门产品
    if (relatedProducts.length < limit) {
      const additionalProducts = await this.productRepository.find({
        where: {
          id: productId,
          isActive: true,
        },
        order: { viewCount: 'DESC' },
        take: limit - relatedProducts.length,
      });
      relatedProducts.push(...additionalProducts);
    }
    
    return {
      products: relatedProducts,
      reason: `Because you viewed ${currentProduct.name}, we recommend these similar items.`,
    };
  }

  /**
   * AI客服聊天
   */
  async chat(dto: ChatMessageDto): Promise<AIResponseDto> {
    const { message, sessionId = `session_${Date.now()}` } = dto;
    
    const lowerMessage = message.toLowerCase();
    
    // 简单的关键词匹配回复
    let response = '';
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('多少钱')) {
      response = 'Our prices are competitive and we often have special promotions. You can find the current price on each product page. Would you like me to help you find a specific product?';
    } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery') || lowerMessage.includes('快递')) {
      response = 'We offer free shipping on orders over $100. Standard shipping takes 5-7 business days, and express shipping is available for 2-3 business days. International shipping is also available to select countries.';
    } else if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('退货')) {
      response = 'We have a 30-day return policy. If you\'re not satisfied with your purchase, you can return it within 30 days for a full refund or exchange. The item must be unused and in its original packaging.';
    } else if (lowerMessage.includes('size') || lowerMessage.includes('尺寸')) {
      response = 'Each product page has a detailed size guide. You can also contact our customer service team for personalized sizing advice. We recommend checking the measurements carefully before ordering.';
    } else if (lowerMessage.includes('stock') || lowerMessage.includes('available') || lowerMessage.includes('库存')) {
      response = 'Product availability is shown on each product page. If an item is out of stock, you can sign up for notifications to be alerted when it\'s back in stock.';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('你好')) {
      response = 'Hello! Welcome to our store! I\'m your AI assistant. How can I help you today? I can help with product information, shipping questions, returns, and more.';
    } else {
      response = 'Thank you for your message. I\'m here to help with any questions about our products, shipping, returns, or anything else. Could you please provide more details so I can better assist you?';
    }
    
    return {
      content: response,
      sessionId,
    };
  }
}
