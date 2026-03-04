import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AlertRule } from './entities/alert-rule.entity';
import { CreateAlertRuleDto, UpdateAlertRuleDto } from './dto/alert-rule.dto';

@Injectable()
export class AlertRulesService {
  constructor(
    @InjectRepository(AlertRule)
    private alertRuleRepository: Repository<AlertRule>,
  ) {}

  async create(createAlertRuleDto: CreateAlertRuleDto): Promise<AlertRule> {
    const rule = this.alertRuleRepository.create({
      ...createAlertRuleDto,
      status: 'active',
    });
    return this.alertRuleRepository.save(rule);
  }

  async findAll(): Promise<AlertRule[]> {
    return this.alertRuleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AlertRule> {
    const rule = await this.alertRuleRepository.findOne({
      where: { id },
    });
    
    if (!rule) {
      throw new NotFoundException(`Alert rule with ID "${id}" not found`);
    }
    
    return rule;
  }

  async update(id: string, updateAlertRuleDto: UpdateAlertRuleDto): Promise<AlertRule> {
    const rule = await this.findOne(id);
    Object.assign(rule, updateAlertRuleDto);
    return this.alertRuleRepository.save(rule);
  }

  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);
    await this.alertRuleRepository.remove(rule);
  }

  async getActiveRules(): Promise<AlertRule[]> {
    return this.alertRuleRepository.find({
      where: { status: 'active' },
    });
  }

  async incrementAlertCount(id: string): Promise<void> {
    await this.alertRuleRepository.update(id, {
      alertCount: () => '"alertCount" + 1',
      lastTriggeredAt: new Date(),
    });
  }
}
