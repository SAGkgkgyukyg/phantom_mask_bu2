import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppDataSource } from '../data-source';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import { LoggerMiddleware } from '../middlewares/logger/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 速率限制配置
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 秒
        limit: 10, // 每秒最多 10 次請求
      },
      {
        name: 'medium',
        ttl: 10000, // 10 秒
        limit: 50, // 每 10 秒最多 50 次請求
      },
      {
        name: 'long',
        ttl: 60000, // 1 分鐘
        limit: 100, // 每分鐘最多 100 次請求
      },
    ]),
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    StoreModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // 應用於所有路由
  }
}
