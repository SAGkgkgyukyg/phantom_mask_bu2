import { DataSource } from 'typeorm';
import * as path from 'path';

// 判斷是否為本機開發環境（非 Docker）
const isLocalDevelopment = process.env.NODE_ENV === 'development' && !process.env.DB_HOST;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: isLocalDevelopment ? 'localhost' : (process.env.DB_HOST || 'localhost'),
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: isLocalDevelopment ? 'postgres' : (process.env.DB_USERNAME || 'postgres'),
  password: isLocalDevelopment ? '' : (process.env.DB_PASSWORD || ''),
  database: isLocalDevelopment ? 'postgres' : (process.env.DB_NAME || 'phantom_mask_db'),
  synchronize: false, // 關閉同步，改用 migration 管理
  logging: process.env.NODE_ENV !== 'production',
  entities: [path.join(__dirname, 'app/entities/**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/**/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  subscribers: [path.join(__dirname, 'subscribers/**/*{.ts,.js}')],
});
