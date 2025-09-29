import { IsNotEmpty, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class TopSpendersFilterDto {
  /**
   * 開始日期 (ISO 8601 格式)
   * @example "2024-01-01T00:00:00.000Z"
   */
  @IsNotEmpty({ message: '開始日期不能為空' })
  @IsDateString({}, { message: '開始日期格式必須為有效的 ISO 8601 日期字串' })
  start_date: string;

  /**
   * 結束日期 (ISO 8601 格式)
   * 如果只提供日期部分（例如 "2024-12-31"），系統會自動設定為當天的 23:59:59.999
   * @example "2024-12-31T23:59:59.999Z" 或 "2024-12-31"
   */
  @IsNotEmpty({ message: '結束日期不能為空' })
  @IsDateString({}, { message: '結束日期格式必須為有效的 ISO 8601 日期字串' })
  end_date: string;

  /**
   * 要返回的前 N 位使用者數量
   * @example 10
   */
  @IsNotEmpty({ message: '前 N 位數量不能為空' })
  @Type(() => Number)
  @IsInt({ message: '前 N 位數量必須為整數' })
  @Min(1, { message: '前 N 位數量最少為 1' })
  @Max(100, { message: '前 N 位數量最多為 100' })
  top_n: number;
}