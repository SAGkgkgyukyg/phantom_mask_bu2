import * as fs from 'fs';
import * as path from 'path';
import { QueryRunner } from 'typeorm';

/**
 * SQL 檔案讀取和執行工具
 */
export class SqlFileUtils {
  /**
   * 讀取 SQL 檔案內容
   * @param filePath SQL 檔案的絕對路徑
   * @returns SQL 內容字串
   */
  static readSqlFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`無法讀取 SQL 檔案 ${filePath}: ${error.message}`);
    }
  }

  /**
   * 執行 SQL 檔案
   * @param queryRunner TypeORM QueryRunner 實例
   * @param filePath SQL 檔案的絕對路徑
   */
  static async executeSqlFile(
    queryRunner: QueryRunner,
    filePath: string,
  ): Promise<void> {
    const sqlContent = this.readSqlFile(filePath);

    // 移除註釋行
    const lines = sqlContent.split('\n');
    const filteredLines = lines.filter((line) => {
      const trimmedLine = line.trim();
      return trimmedLine !== '' && !trimmedLine.startsWith('--');
    });

    const cleanedSql = filteredLines.join('\n');

    // 對於 INSERT 語句，通常整個語句是一個完整的區塊
    // 按分號分割，但要小心處理字串內的分號
    const statements = this.splitSqlStatements(cleanedSql);

    // 逐一執行 SQL 語句
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        await queryRunner.query(trimmedStatement);
      }
    }
  }

  /**
   * 智能分割 SQL 語句
   * @param sql SQL 內容
   * @returns SQL 語句陣列
   */
  private static splitSqlStatements(sql: string): string[] {
    const statements: string[] = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];

      if (!inString && (char === "'" || char === '"')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        // 檢查是否是逃脫字符
        if (sql[i + 1] === stringChar) {
          currentStatement += char + char;
          i++; // 跳過下一個字符
          continue;
        } else {
          inString = false;
          stringChar = '';
        }
      }

      if (!inString && char === ';') {
        // 結束當前語句
        if (currentStatement.trim()) {
          statements.push(currentStatement.trim());
        }
        currentStatement = '';
      } else {
        currentStatement += char;
      }
    }

    // 加入最後一個語句（如果有的話）
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    return statements;
  }

  /**
   * 取得 SQL 檔案的絕對路徑
   * @param fileName SQL 檔案名稱
   * @returns 絕對路徑
   */
  static getSqlFilePath(fileName: string): string {
    // 從 backend/src/migrations 到 backend/extractDB/sql 的相對路徑
    return path.join(__dirname, '../../extractDB/sql', fileName);
  }
}
