import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Website Template API')
    .setDescription('BuildAI Multi-tenant Website Template API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-Tenant-ID', in: 'header' }, 'X-Tenant-ID')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Apply tenant middleware
  app.use(new TenantMiddleware().use);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
