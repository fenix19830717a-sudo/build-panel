import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeArticle } from '../../common/entities/knowledge-article.entity';
@Injectable()
export class AiService {
  constructor(@InjectRepository(KnowledgeArticle) private articleRepository: Repository<KnowledgeArticle>) {}
  async chatReply(message: string): Promise<{ reply: string; source?: string }> {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('你好')) {
      return { reply: '您好！欢迎来到我们的客服中心。请问有什么可以帮助您的吗？', source: 'ai' };
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('价格')) {
      return { reply: '关于价格信息，请访问我们的价格页面或联系销售团队获取详细报价。', source: 'ai' };
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('帮助')) {
      return { reply: '我很乐意帮助您！请详细描述您遇到的问题，我会尽力为您解答。', source: 'ai' };
    } else if (lowerMessage.includes('bye') || lowerMessage.includes('再见')) {
      return { reply: '再见！感谢您使用我们的服务，期待再次为您服务！', source: 'ai' };
    }
    return { reply: '感谢您的咨询。我理解您想了解关于"' + message + '"的信息。让我为您查找相关资料。', source: 'ai' };
  }
  async classifyTicket(title: string, description: string): Promise<{ category: string; priority: string; confidence: number }> {
    const fullText = (title + ' ' + description).toLowerCase();
    let category = 'general';
    let priority = 'medium';
    if (fullText.includes('bug') || fullText.includes('error') || fullText.includes('错误')) category = 'bug';
    if (fullText.includes('billing') || fullText.includes('payment') || fullText.includes('付款')) category = 'billing';
    if (fullText.includes('urgent') || fullText.includes('critical') || fullText.includes('紧急')) priority = 'urgent';
    return { category, priority, confidence: 0.85 };
  }
  async recognizeIntent(message: string): Promise<{ intent: string; confidence: number }> {
    const lowerMessage = message.toLowerCase();
    if (/(hello|hi|你好)/.test(lowerMessage)) return { intent: 'greeting', confidence: 0.9 };
    if (/(bye|再见)/.test(lowerMessage)) return { intent: 'farewell', confidence: 0.9 };
    if (/(help|帮助)/.test(lowerMessage)) return { intent: 'help_request', confidence: 0.9 };
    if (/(price|价格)/.test(lowerMessage)) return { intent: 'pricing_inquiry', confidence: 0.9 };
    return { intent: 'unknown', confidence: 0.5 };
  }
  async buildKnowledge(content: string, title?: string): Promise<{ title: string; summary: string; tags: string[] }> {
    const lines = content.split('\n').filter(l => l.trim());
    const generatedTitle = title || lines[0]?.substring(0, 100) || '未命名文章';
    const summary = content.substring(0, 200) + '...';
    const tags = ['faq', 'help', 'support'];
    return { title: generatedTitle, summary, tags };
  }
}
