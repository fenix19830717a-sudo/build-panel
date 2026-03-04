import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { ThemesModule } from './modules/themes/themes.module';
import { ContentsModule } from './modules/contents/contents.module';
import { ProductsModule } from './modules/products/products.module';
import { PagesModule } from './modules/pages/pages.module';
import { MediaModule } from './modules/media/media.module';
import { AiModule } from './modules/ai/ai.module';
import { TenantContextModule } from './common/tenant-context/tenant-context.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    TenantContextModule,
    TenantsModule,
    ThemesModule,
    ContentsModule,
    ProductsModule,
    PagesModule,
    MediaModule,
    AiModule,
  ],
})
export class AppModule {}
