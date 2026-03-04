import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertRule } from './entities/alert-rule.entity';
import { AlertRulesController } from './alert-rules.controller';
import { AlertRulesService } from './alert-rules.service';

@Module({
  imports: [TypeOrmModule.forFeature([AlertRule])],
  controllers: [AlertRulesController],
  providers: [AlertRulesService],
  exports: [AlertRulesService],
})
export class AlertRulesModule {}
