import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 啟用全域驗證管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 設置 Swagger 文檔
  const config = new DocumentBuilder()
    .setTitle('Phantom Mask API')
    .setDescription('The Phantom Mask API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', '使用者認證相關 API')
    .addTag('Stores', '商店相關 API (總覽)')
    .addTag('Stores / Information', '商店資訊查詢與篩選功能')
    .addTag('Stores / Analytics', '商店數據分析與統計功能')
    .addTag('Stores / Purchase', '購買交易相關功能')
    .addTag('Stores / Administration', '管理員專用功能')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
