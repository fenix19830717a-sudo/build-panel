import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { DatabaseConfig } from '../common/entities/database-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatabaseConfig])],
  controllers: [DatabaseController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
