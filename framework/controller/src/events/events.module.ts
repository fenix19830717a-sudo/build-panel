import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsGateway } from './events.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [JwtModule],
  providers: [EventsGateway, WsJwtGuard],
  exports: [EventsGateway],
})
export class EventsModule {}
