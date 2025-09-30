import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 記錄啟動資訊
  console.log('🚀 Starting Phantom Mask API...');
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Port: ${process.env.PORT || 3000}`);
  console.log(
    `🔒 CORS Allowed Origins: ${process.env.ALLOWED_ORIGINS || 'All HTTPS origins (production) / All origins (development)'}`,
  );

  // 安全標頭配置
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Swagger 需要 inline styles
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // 為了 Swagger 相容性
    }),
  );

  // CORS 配置
  const corsOptions = {
    origin: (origin, callback) => {
      console.log(`CORS: Checking origin: ${origin}, NODE_ENV: ${process.env.NODE_ENV}`);
      
      // 開發環境：允許所有來源
      if (process.env.NODE_ENV === 'development') {
        console.log(`CORS: Allowing origin in development: ${origin}`);
        return callback(null, true);
      }

      // 本地開發環境的常見來源（即使 NODE_ENV 不是 development）
      const localOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://0.0.0.0:3000',
        'http://0.0.0.0:3001'
      ];

      if (origin && localOrigins.includes(origin)) {
        console.log(`CORS: Allowing local development origin: ${origin}`);
        return callback(null, true);
      }

      // 生產環境：檢查 ALLOWED_ORIGINS 環境變數
      const allowedOrigins =
        process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [];

      // 允許沒有 origin 的請求（API 工具、移動應用等）
      if (!origin) {
        console.log('CORS: Allowing request with no origin');
        return callback(null, true);
      }

      // 如果沒有設定特定的允許來源，允許所有 HTTPS 來源
      if (allowedOrigins.length === 0) {
        if (origin.startsWith('https://')) {
          console.log(`CORS: Allowing HTTPS origin: ${origin}`);
          return callback(null, true);
        } else {
          console.warn(`CORS: Blocking non-HTTPS origin: ${origin}`);
          return callback(
            new Error('Only HTTPS origins are allowed in production'),
            false,
          );
        }
      }

      // 檢查來源是否在明確允許的列表中
      if (allowedOrigins.includes(origin)) {
        console.log(`CORS: Allowing explicitly configured origin: ${origin}`);
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('CORS policy violation'), false);
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Content-Length'],
  };

  app.use(cors(corsOptions));

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
