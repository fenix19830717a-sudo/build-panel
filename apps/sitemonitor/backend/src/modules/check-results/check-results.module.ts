import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckResultsController } from './check-results.controller';
import { CheckResultsService } from './check-results.service';
import { CheckResult } from '../../entities/check-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheckResult])],
  controllers: [CheckResultsController],
  providers: [CheckResultsService],
  exports: [CheckResultsService],
})
export class CheckResultsModule {}
