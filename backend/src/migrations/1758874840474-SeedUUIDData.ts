import { MigrationInterface, QueryRunner } from 'typeorm';
import { NormalizedJsonSeeder } from '../utils/normalizedJsonSeeder';

export class SeedUUIDData1758874840474 implements MigrationInterface {
  name = 'SeedUUIDData1758874840474';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('開始插入 UUID 版本的初始資料...');

    // 確保 uuid-ossp 擴展已啟用
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 使用 NormalizedJsonSeeder 來確保資料與正規化 JSON 檔案完全一致
    await NormalizedJsonSeeder.seedFromNormalizedJson(queryRunner);

    console.log('✅ UUID 版本初始資料插入完成！資料關聯保持一致性');
    console.log(
      '📝 所有主鍵和外鍵現在都使用 UUID 格式，並基於正規化 JSON 檔案的精確關聯',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('開始清除 UUID 版本資料...');

    // 按照相反順序清除資料
    const tables = [
      'purchase_details',
      'purchase_histories',
      'pharmacy_hours',
      'inventory',
      'users',
      'pharmacies',
      'mask_types',
      'weekdays',
    ];

    for (const table of tables) {
      console.log(`  - 清除 ${table} 資料`);
      await queryRunner.query(`DELETE FROM ${table}`);
    }

    console.log('✅ 所有 UUID 版本資料已清除');
  }
}
