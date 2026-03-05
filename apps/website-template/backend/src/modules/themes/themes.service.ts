import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme, ThemeStatus } from './entities/theme.entity';
import { CreateThemeDto, UpdateThemeDto } from './dto/theme.dto';

@Injectable()
export class ThemesService {
  constructor(
    @InjectRepository(Theme)
    private themeRepository: Repository<Theme>,
  ) {}

  async create(createThemeDto: CreateThemeDto, tenantId?: string): Promise<Theme> {
    // 检查slug是否已存在
    const existing = await this.themeRepository.findOne({
      where: { slug: createThemeDto.slug, tenantId },
    });
    
    if (existing) {
      throw new ConflictException(`Theme with slug '${createThemeDto.slug}' already exists`);
    }

    // 如果设置为默认主题，取消其他默认主题
    if (createThemeDto.isDefault) {
      await this.themeRepository.update(
        { tenantId, isDefault: true },
        { isDefault: false }
      );
    }

    const theme = this.themeRepository.create({
      ...createThemeDto,
      tenantId,
    });
    
    return this.themeRepository.save(theme);
  }

  async findAll(tenantId?: string): Promise<Theme[]> {
    return this.themeRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findDefaults(): Promise<Theme[]> {
    return this.themeRepository.find({
      where: { isDefault: true, status: ThemeStatus.ACTIVE },
    });
  }

  async findOne(id: string, tenantId?: string): Promise<Theme> {
    const theme = await this.themeRepository.findOne({
      where: { id, tenantId },
    });
    
    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }
    
    return theme;
  }

  async findBySlug(slug: string, tenantId?: string): Promise<Theme | null> {
    return this.themeRepository.findOne({
      where: { slug, tenantId, status: ThemeStatus.ACTIVE },
    });
  }

  async getActiveTheme(tenantId?: string): Promise<Theme | null> {
    // 优先获取租户的默认主题
    if (tenantId) {
      const tenantTheme = await this.themeRepository.findOne({
        where: { tenantId, isDefault: true, status: ThemeStatus.ACTIVE },
      });
      if (tenantTheme) return tenantTheme;
    }
    
    // 否则返回系统默认主题
    return this.themeRepository.findOne({
      where: { isDefault: true, status: ThemeStatus.ACTIVE, tenantId: null },
    });
  }

  async update(id: string, updateThemeDto: UpdateThemeDto, tenantId?: string): Promise<Theme> {
    const theme = await this.findOne(id, tenantId);
    
    // 如果更新slug，检查是否冲突
    if (updateThemeDto.slug && updateThemeDto.slug !== theme.slug) {
      const existing = await this.themeRepository.findOne({
        where: { slug: updateThemeDto.slug, tenantId },
      });
      if (existing) {
        throw new ConflictException(`Theme with slug '${updateThemeDto.slug}' already exists`);
      }
    }

    // 如果设置为默认主题，取消其他默认主题
    if (updateThemeDto.isDefault) {
      await this.themeRepository.update(
        { tenantId, isDefault: true },
        { isDefault: false }
      );
    }
    
    Object.assign(theme, updateThemeDto);
    return this.themeRepository.save(theme);
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    const theme = await this.findOne(id, tenantId);
    await this.themeRepository.remove(theme);
  }

  async applyTheme(themeId: string, tenantId: string): Promise<Theme> {
    // 取消该租户当前的所有默认主题
    await this.themeRepository.update(
      { tenantId, isDefault: true },
      { isDefault: false }
    );
    
    // 设置新的默认主题
    const theme = await this.findOne(themeId, tenantId);
    theme.isDefault = true;
    theme.status = ThemeStatus.ACTIVE;
    
    return this.themeRepository.save(theme);
  }

  // 生成CSS变量
  generateCssVariables(config: any): string {
    const variables: string[] = [];
    
    if (config.colors) {
      Object.entries(config.colors).forEach(([key, value]) => {
        variables.push(`--color-${key}: ${value};`);
      });
    }
    
    if (config.typography?.fontFamily) {
      Object.entries(config.typography.fontFamily).forEach(([key, value]) => {
        variables.push(`--font-${key}: ${value};`);
      });
    }
    
    if (config.typography?.fontSize) {
      Object.entries(config.typography.fontSize).forEach(([key, value]) => {
        variables.push(`--font-size-${key}: ${value};`);
      });
    }
    
    if (config.spacing) {
      Object.entries(config.spacing).forEach(([key, value]) => {
        variables.push(`--spacing-${key}: ${value};`);
      });
    }
    
    if (config.layout) {
      Object.entries(config.layout).forEach(([key, value]) => {
        variables.push(`--layout-${key}: ${value};`);
      });
    }
    
    return `:root {\n${variables.map(v => `  ${v}`).join('\n')}\n}`;
  }
}
