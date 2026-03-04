import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditMiddleware } from './audit.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditMiddleware],
  exports: [AuditMiddleware],
})
export class AuditModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuditMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
