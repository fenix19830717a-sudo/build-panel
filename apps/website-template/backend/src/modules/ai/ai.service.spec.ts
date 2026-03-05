import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AiService } from './ai.service';
import { of } from 'rxjs';

describe('AiService', () => {
  let service: AiService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use default API base if not configured', async () => {
      configService.get.mockReturnValue(null);

      // Re-instantiate to test constructor behavior
      const newService = new AiService(httpService, configService);

      expect(configService.get).toHaveBeenCalledWith('AI_API_KEY');
      expect(configService.get).toHaveBeenCalledWith('AI_API_BASE');
    });

    it('should use configured API key and base', async () => {
      configService.get
        .mockReturnValueOnce('test-api-key')
        .mockReturnValueOnce('https://custom.api.com');

      const newService = new AiService(httpService, configService);

      expect(configService.get).toHaveBeenCalledWith('AI_API_KEY');
    });
  });

  describe('generateContent', () => {
    it('should generate content with all parameters', async () => {
      const dto = {
        type: 'hero_title',
        industry: 'jewelry',
        keywords: ['luxury', 'handmade'],
        context: 'Welcome message for homepage',
        language: 'zh-CN',
      };

      const result = await service.generateContent(dto);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('alternatives');
      expect(result).toHaveProperty('type', dto.type);
      expect(result).toHaveProperty('language', dto.language);
      expect(result.alternatives).toHaveLength(3);
    });

    it('should use default language if not provided', async () => {
      const dto = {
        type: 'about_text',
        industry: 'fashion',
      };

      const result = await service.generateContent(dto);

      expect(result.language).toBe('zh-CN');
    });

    it('should return different content for different types', async () => {
      const heroResult = await service.generateContent({
        type: 'hero_title',
        industry: 'jewelry',
        language: 'zh-CN',
      });

      const aboutResult = await service.generateContent({
        type: 'about_text',
        industry: 'jewelry',
        language: 'zh-CN',
      });

      expect(heroResult.content).toContain('臻选');
      expect(aboutResult.content).toContain('打造');
    });

    it('should return English content when specified', async () => {
      const dto = {
        type: 'hero_title',
        industry: 'jewelry',
        language: 'en',
      };

      const result = await service.generateContent(dto);

      expect(result.content).toContain('Handcrafted');
    });
  });

  describe('generateProductDescription', () => {
    it('should generate description with product name', async () => {
      const dto = {
        product_name: 'Gold Necklace',
        features: ['18K gold', 'handcrafted'],
        tone: 'professional',
      };

      const result = await service.generateProductDescription(dto);

      expect(result.description).toContain('Gold Necklace');
      expect(result.description).toContain('18K gold');
      expect(result.description).toContain('handcrafted');
    });

    it('should generate description without features', async () => {
      const dto = {
        product_name: 'Silver Ring',
      };

      const result = await service.generateProductDescription(dto);

      expect(result.description).toContain('Silver Ring');
      expect(result.highlights).toEqual(['高品质', '精工细作', '独特设计']);
    });

    it('should include SEO keywords', async () => {
      const dto = {
        product_name: 'Diamond Ring',
        features: ['sparkling', 'elegant'],
      };

      const result = await service.generateProductDescription(dto);

      expect(result.seo_keywords).toContain('Diamond Ring');
      expect(result.seo_keywords).toContain('精品');
      expect(result.seo_keywords).toContain('高端');
    });

    it('should use provided tone', async () => {
      const dto = {
        product_name: 'Test Product',
        tone: 'casual',
      };

      const result = await service.generateProductDescription(dto);

      expect(result.tone).toBe('casual');
    });

    it('should default tone to professional', async () => {
      const dto = {
        product_name: 'Test Product',
      };

      const result = await service.generateProductDescription(dto);

      expect(result.tone).toBe('professional');
    });
  });

  describe('translate', () => {
    it('should translate known content', async () => {
      const dto = {
        content: '欢迎来到我们的珠宝店',
        target_language: 'en',
      };

      const result = await service.translate(dto);

      expect(result.original).toBe(dto.content);
      expect(result.translated).toBe('Welcome to our jewelry store');
      expect(result.target_language).toBe('en');
      expect(result.confidence).toBe(0.95);
    });

    it('should handle unknown content', async () => {
      const dto = {
        content: '未知文本内容',
        target_language: 'en',
      };

      const result = await service.translate(dto);

      expect(result.translated).toBe('[en] 未知文本内容');
    });

    it('should return different languages', async () => {
      const dto = {
        content: '关于我们',
        target_language: 'en',
      };

      const result = await service.translate(dto);

      expect(result.translated).toBe('About Us');
    });
  });

  describe('optimizeSeo', () => {
    it('should optimize SEO with provided content', async () => {
      const dto = {
        title: 'Custom Jewelry',
        description: 'Handmade jewelry collection',
        keywords: ['gold', 'silver'],
      };

      const result = await service.optimizeSeo(dto);

      expect(result.title).toContain('Custom Jewelry');
      expect(result.description).toContain('Handmade jewelry collection');
      expect(result.keywords).toContain('gold');
      expect(result.keywords).toContain('silver');
      expect(result.suggestions).toHaveLength(3);
    });

    it('should generate default SEO if no content provided', async () => {
      const dto = {};

      const result = await service.optimizeSeo(dto);

      expect(result.title).toContain('专业定制');
      expect(result.description).toContain('传承百年工艺');
      expect(result.keywords).toContain('定制服务');
    });

    it('should include additional keywords', async () => {
      const dto = {
        keywords: ['custom'],
      };

      const result = await service.optimizeSeo(dto);

      expect(result.keywords).toContain('custom');
      expect(result.keywords).toContain('高端品牌');
      expect(result.keywords).toContain('品质保证');
    });

    it('should provide SEO suggestions', async () => {
      const result = await service.optimizeSeo({});

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain('长尾关键词');
    });
  });

  describe('generateImage', () => {
    it('should return image generation status', async () => {
      const dto = {
        prompt: 'A beautiful gold necklace',
        size: '1024x1024',
        style: 'photorealistic',
      };

      const result = await service.generateImage(dto);

      expect(result.prompt).toBe(dto.prompt);
      expect(result.size).toBe(dto.size);
      expect(result.style).toBe(dto.style);
      expect(result.url).toContain('placeholder.co');
      expect(result.status).toBe('generating');
      expect(result.estimated_time).toBe(30);
    });

    it('should use default size if not provided', async () => {
      const dto = {
        prompt: 'A silver ring',
      };

      const result = await service.generateImage(dto);

      expect(result.size).toBe('1024x1024');
    });

    it('should use default style if not provided', async () => {
      const dto = {
        prompt: 'A diamond',
      };

      const result = await service.generateImage(dto);

      expect(result.style).toBe('default');
    });

    it('should include placeholder URL with correct dimensions', async () => {
      const dto = {
        prompt: 'Test',
        size: '512x512',
      };

      const result = await service.generateImage(dto);

      expect(result.url).toContain('512x512');
    });
  });

  describe('private methods', () => {
    describe('buildContentPrompt', () => {
      it('should build prompt with all parameters', async () => {
        const dto = {
          type: 'hero_title',
          industry: 'jewelry',
          keywords: ['luxury', 'gold'],
          context: 'Homepage banner',
          language: 'en',
        };

        // Access private method through any type
        const prompt = (service as any).buildContentPrompt(dto);

        expect(prompt).toContain('hero_title');
        expect(prompt).toContain('jewelry');
        expect(prompt).toContain('luxury');
        expect(prompt).toContain('Homepage banner');
        expect(prompt).toContain('en');
      });

      it('should handle missing optional parameters', async () => {
        const dto = {
          type: 'about_text',
          industry: 'fashion',
        };

        const prompt = (service as any).buildContentPrompt(dto);

        expect(prompt).toContain('about_text');
        expect(prompt).toContain('fashion');
        expect(prompt).toContain('undefined'); // for missing keywords
      });
    });

    describe('getMockContent', () => {
      it('should return Chinese hero title', () => {
        const content = (service as any).getMockContent(
          'hero_title',
          'jewelry',
          'zh-CN',
        );
        expect(content).toContain('臻选');
      });

      it('should return English hero title', () => {
        const content = (service as any).getMockContent(
          'hero_title',
          'jewelry',
          'en',
        );
        expect(content).toContain('Handcrafted');
      });

      it('should return default content for unknown type', () => {
        const content = (service as any).getMockContent(
          'unknown_type',
          'test',
          'zh-CN',
        );
        expect(content).toContain('test');
        expect(content).toContain('行业');
      });

      it('should return English default content', () => {
        const content = (service as any).getMockContent('unknown', 'test', 'en');
        expect(content).toContain('test');
        expect(content).toContain('industry');
      });
    });
  });
});
