import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parser } from './entities/parser.entity';
import { ParsersController } from './parsers.controller';
import { ParsersService } from './parsers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Parser])],
  controllers: [ParsersController],
  providers: [ParsersService],
  exports: [ParsersService],
})
export class ParsersModule {}
