import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from '../../database/entities/theme.entity';
import { CreateThemeDto } from './dto';

@Injectable()
export class ThemesService {
  constructor(
    @InjectRepository(Theme)
    private themeRepository: Repository<Theme>,
  ) {}

  async create(createThemeDto: CreateThemeDto): Promise<Theme> {
    const theme = this.themeRepository.create(createThemeDto);
    return this.themeRepository.save(theme);
  }

  async findAll(): Promise<Theme[]> {
    return this.themeRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Theme> {
    const theme = await this.themeRepository.findOne({ where: { id } });
    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }
    return theme;
  }

  async getConfig(id: string) {
    const theme = await this.findOne(id);
    return {
      id: theme.id,
      name: theme.name,
      display_name: theme.display_name,
      config: theme.config,
    };
  }

  async update(id: string, updateData: Partial<Theme>): Promise<Theme> {
    const theme = await this.findOne(id);
    Object.assign(theme, updateData);
    return this.themeRepository.save(theme);
  }

  async remove(id: string): Promise<void> {
    const theme = await this.findOne(id);
    await this.themeRepository.remove(theme);
  }
}
