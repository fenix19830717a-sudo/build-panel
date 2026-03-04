import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppsService } from './apps.service';
import { AppsController } from './apps.controller';
import { App } from './entities/app.entity';
import { ServerApp } from './entities/server-app.entity';

@Module({
  imports: [TypeOrmModule.forFeature([App, ServerApp])],
  controllers: [AppsController],
  providers: [AppsService],
  exports: [AppsService],
})
export class AppsModule {}
