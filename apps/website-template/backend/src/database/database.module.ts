import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tenant } from './entities/tenant.entity';
import { Theme } from './entities/theme.entity';
import { Content } from './entities/content.entity';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductTag } from './entities/product-tag.entity';
import { Page } from './entities/page.entity';
import { Media } from './entities/media.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'website_template'),
        entities: [
          Tenant,
          Theme,
          Content,
          Product,
          ProductCategory,
          ProductTag,
          Page,
          Media,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
})
export class DatabaseModule {}
