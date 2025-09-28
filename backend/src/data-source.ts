import { DataSource } from 'typeorm';
import * as path from 'path';

// 使用環境變數載入 .env 設定
require('dotenv').config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phantom_mask_db',
  synchronize: false, // 關閉同步，改用 migration 管理
  logging: process.env.NODE_ENV !== 'production',
  entities: [path.join(__dirname, 'app/entities/**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/**/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  subscribers: [path.join(__dirname, 'subscribers/**/*{.ts,.js}')],
});
