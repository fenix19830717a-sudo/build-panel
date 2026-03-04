import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parser } from './entities/parser.entity';
import { CreateParserDto, UpdateParserDto } from './dto/parser.dto';

@Injectable()
export class ParsersService {
  constructor(
    @InjectRepository(Parser)
    private parserRepository: Repository<Parser>,
  ) {}

  async create(createParserDto: CreateParserDto): Promise<Parser> {
    const parser = this.parserRepository.create({
      ...createParserDto,
      isActive: true,
    });
    return this.parserRepository.save(parser);
  }

  async findAll(): Promise<Parser[]> {
    return this.parserRepository.find({
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Parser> {
    const parser = await this.parserRepository.findOne({
      where: { id },
    });
    
    if (!parser) {
      throw new NotFoundException(`Parser with ID "${id}" not found`);
    }
    
    return parser;
  }

  async findBySourceId(sourceId: string): Promise<Parser[]> {
    return this.parserRepository.find({
      where: [
        { sourceId, isActive: true },
        { sourceId: null, isActive: true },
      ],
      order: { priority: 'DESC' },
    });
  }

  async update(id: string, updateParserDto: UpdateParserDto): Promise<Parser> {
    const parser = await this.findOne(id);
    Object.assign(parser, updateParserDto);
    return this.parserRepository.save(parser);
  }

  async remove(id: string): Promise<void> {
    const parser = await this.findOne(id);
    await this.parserRepository.remove(parser);
  }

  parseMessage(parser: Parser, message: string): Record<string, any> | null {
    switch (parser.type) {
      case 'json':
        return this.parseJson(message);
      case 'regex':
        return this.parseRegex(parser.pattern, message);
      default:
        return null;
    }
  }

  private parseJson(message: string): Record<string, any> | null {
    try {
      return JSON.parse(message);
    } catch {
      return null;
    }
  }

  private parseRegex(pattern: string, message: string): Record<string, any> | null {
    try {
      const regex = new RegExp(pattern);
      const match = message.match(regex);
      if (match) {
        const result: Record<string, any> = {};
        if (match.groups) {
          Object.assign(result, match.groups);
        }
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }
}
