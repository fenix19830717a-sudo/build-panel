import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertChannelsController } from './alert-channels.controller';
import { AlertChannelsService } from './alert-channels.service';
import { AlertChannel } from '../../entities/alert-channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlertChannel])],
  controllers: [AlertChannelsController],
  providers: [AlertChannelsService],
  exports: [AlertChannelsService],
})
export class AlertChannelsModule {}
