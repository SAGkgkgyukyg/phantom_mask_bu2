import { MigrationInterface, QueryRunner } from 'typeorm';
import { SqlFileUtils } from '../utils/sqlFileUtils';

export class InitialMigration1758872998293 implements MigrationInterface {
  name = 'InitialMigration1758872998293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 執行 init_all_tables.sql 來建立所有資料表
    const initTablesPath = SqlFileUtils.getSqlFilePath('init_all_tables.sql');
    console.log('正在執行初始化資料表 SQL 檔案:', initTablesPath);

    await SqlFileUtils.executeSqlFile(queryRunner, initTablesPath);

    console.log('✅ 所有資料表已成功建立');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 按照相反順序刪除表格（考慮外鍵依賴關係）
    console.log('正在回復資料表建立...');

    await queryRunner.query(`DROP TABLE IF EXISTS pharmacy_hours`);
    await queryRunner.query(`DROP TABLE IF EXISTS purchase_details`);
    await queryRunner.query(`DROP TABLE IF EXISTS purchase_histories`);
    await queryRunner.query(`DROP TABLE IF EXISTS inventory`);
    await queryRunner.query(`DROP TABLE IF EXISTS weekdays`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TABLE IF EXISTS pharmacies`);
    await queryRunner.query(`DROP TABLE IF EXISTS mask_types`);

    console.log('✅ 所有資料表已成功刪除');
  }
}
