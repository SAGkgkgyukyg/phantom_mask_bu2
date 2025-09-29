import { IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 數量門檻比較條件枚舉
 */
export enum QuantityThresholdType {
  /** 高於門檻值 */
  ABOVE = 'above',
  /** 低於門檻值 */
  BELOW = 'below',
  /** 介於兩個門檻值之間 */
  BETWEEN = 'between'
}

/**
 * 價格範圍和存貨數量篩選 DTO
 */
export class PriceQuantityFilterDto {
  @ApiPropertyOptional({
    description: '價格下限（包含）',
    example: 10.00,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '價格下限必須是數字，最多兩位小數' })
  @Min(0, { message: '價格下限不能小於 0' })
  min_price?: number;

  @ApiPropertyOptional({
    description: '價格上限（包含）',
    example: 100.00,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '價格上限必須是數字，最多兩位小數' })
  @Min(0, { message: '價格上限不能小於 0' })
  max_price?: number;

  @ApiProperty({
    description: '數量門檻比較類型',
    enum: QuantityThresholdType,
    example: QuantityThresholdType.ABOVE
  })
  @IsEnum(QuantityThresholdType, { message: '數量門檻類型必須是 above、below 或 between' })
  threshold_type: QuantityThresholdType;

  @ApiProperty({
    description: '數量門檻值（用於 above 和 below）或下限值（用於 between）',
    example: 50,
    minimum: 0
  })
  @IsNumber({}, { message: '數量門檻必須是整數' })
  @Min(0, { message: '數量門檻不能小於 0' })
  quantity_threshold: number;

  @ApiPropertyOptional({
    description: '數量上限門檻值（僅用於 between 類型）',
    example: 200,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({}, { message: '數量上限門檻必須是整數' })
  @Min(0, { message: '數量上限門檻不能小於 0' })
  quantity_threshold_max?: number;
}