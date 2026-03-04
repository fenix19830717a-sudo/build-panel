import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from './entities/source.entity';
import { CreateSourceDto, UpdateSourceDto } from './dto/source.dto';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private sourceRepository: Repository<Source>,
  ) {}

  async create(createSourceDto: CreateSourceDto): Promise<Source> {
    const source = this.sourceRepository.create(createSourceDto);
    return this.sourceRepository.save(source);
  }

  async findAll(): Promise<Source[]> {
    return this.sourceRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Source> {
    const source = await this.sourceRepository.findOne({
      where: { id },
    });
    
    if (!source) {
      throw new NotFoundException(`Source with ID "${id}" not found`);
    }
    
    return source;
  }

  async update(id: string, updateSourceDto: UpdateSourceDto): Promise<Source> {
    const source = await this.findOne(id);
    Object.assign(source, updateSourceDto);
    return this.sourceRepository.save(source);
  }

  async remove(id: string): Promise<void> {
    const source = await this.findOne(id);
    await this.sourceRepository.remove(source);
  }

  async validateSourceToken(token: string): Promise<Source | null> {
    return this.sourceRepository.findOne({
      where: { id: token, status: 'active' },
    });
  }
}
