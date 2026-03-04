import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { Alert } from '../../entities/alert.entity';
import { AlertNotificationProcessor } from './alerts.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert]),
    BullModule.registerQueue({
      name: 'alert-notifications',
    }),
  ],
  controllers: [AlertsController],
  providers: [AlertsService, AlertNotificationProcessor],
  exports: [AlertsService],
})
export class AlertsModule {}
