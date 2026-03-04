import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('AI_API_KEY', '');
    this.apiUrl = this.configService.get('AI_API_URL', 'https://api.openai.com/v1');
    this.model = this.configService.get('AI_MODEL', 'gpt-4');
  }

  private async callAI(messages: any[]): Promise<string> {
    if (!this.apiKey) {
      // 模拟AI响应，用于开发测试
      return this.mockResponse(messages);
    }

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.mockResponse(messages);
    }
  }

  private mockResponse(messages: any[]): string {
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    if (lastMessage.includes('写文章')) {
      return '# 示例文章标题\n\n这是一篇由AI生成的示例文章内容。在实际应用中，这里会返回真实的AI生成内容。\n\n## 主要内容\n\n- 要点1\n- 要点2\n- 要点3\n\n## 结论\n\n总结性内容...';
    }
    
    if (lastMessage.includes('摘要')) {
      return '这是生成的文章摘要。在实际应用中，AI会根据文章内容生成简洁的摘要。';
    }
    
    if (lastMessage.includes('SEO')) {
      return JSON.stringify({
        title: '优化后的SEO标题',
        description: '优化后的SEO描述，包含关键词',
        keywords: '关键词1, 关键词2, 关键词3',
      });
    }
    
    return 'AI处理完成（模拟响应）';
  }

  async writeArticle(prompt: string, options?: { tone?: string; length?: string; language?: string }): Promise<{ content: string; title?: string }> {
    const systemPrompt = `你是一个专业的内容创作助手。请根据用户的要求撰写一篇高质量的文章。
选项：
- 语气: ${options?.tone || '专业'}
- 长度: ${options?.length || '中等'}
- 语言: ${options?.language || '中文'}

请输出JSON格式：{"title": "文章标题", "content": "文章内容（支持Markdown）"}`;

    const response = await this.callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ]);

    try {
      const parsed = JSON.parse(response);
      return {
        title: parsed.title,
        content: parsed.content,
      };
    } catch {
      return { content: response };
    }
  }

  async generateSummary(content: string, maxLength?: number): Promise<string> {
    const systemPrompt = `请为以下文章内容生成一个简洁的摘要。${maxLength ? `摘要长度控制在${maxLength}字以内。` : ''}`;

    return this.callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content },
    ]);
  }

  async optimizeSEO(content: string, currentTitle?: string): Promise<{
    title: string;
    description: string;
    keywords: string[];
  }> {
    const systemPrompt = `请为以下内容优化SEO元数据。返回JSON格式：
{
  "title": "优化后的标题（50-60字符）",
  "description": "优化后的描述（150-160字符）",
  "keywords": ["关键词1", "关键词2", "关键词3"]
}`;

    const response = await this.callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `当前标题：${currentTitle || '无'}\n\n内容：\n${content}` },
    ]);

    try {
      const parsed = JSON.parse(response);
      return {
        title: parsed.title,
        description: parsed.description,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : parsed.keywords.split(',').map((k: string) => k.trim()),
      };
    } catch {
      return {
        title: currentTitle || '优化标题',
        description: content.substring(0, 160),
        keywords: [],
      };
    }
  }

  async generateImage(prompt: string, options?: { size?: string; style?: string }): Promise<{ url?: string; error?: string }> {
    // 图片生成需要DALL-E或其他图像生成API
    // 这里返回模拟响应
    return {
      url: `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(prompt.substring(0, 50))}`,
    };
  }

  async suggestTags(content: string, existingTags?: string[]): Promise<string[]> {
    const systemPrompt = `请为以下内容推荐3-5个相关标签。只返回标签数组，不要其他解释。现有标签：${existingTags?.join(', ') || '无'}`;

    const response = await this.callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content },
    ]);

    try {
      return JSON.parse(response);
    } catch {
      return response.split(',').map(tag => tag.trim()).filter(Boolean);
    }
  }

  async improveWriting(content: string, type: 'grammar' | 'style' | 'clarity' = 'clarity'): Promise<string> {
    const typePrompts = {
      grammar: '修正语法和拼写错误',
      style: '改善写作风格，使其更专业',
      clarity: '提高内容清晰度',
    };

    return this.callAI([
      { role: 'system', content: `请${typePrompts[type]}，保持原意不变：` },
      { role: 'user', content },
    ]);
  }
}
