import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, Min, MaxLength, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class MaskProductItemDto {
  @ApiProperty({
    description: '口罩品牌名稱',
    example: '康匠',
    maxLength: 255,
  })
  @IsString({ message: '品牌名稱必須是字串' })
  @MaxLength(255, { message: '品牌名稱長度不能超過 255 個字元' })
  brand: string;

  @ApiProperty({
    description: '口罩顏色',
    example: '粉色',
    maxLength: 100,
  })
  @IsString({ message: '顏色必須是字串' })
  @MaxLength(100, { message: '顏色長度不能超過 100 個字元' })
  color: string;

  @ApiProperty({
    description: '口罩包裝規格（每包數量）',
    example: 50,
    minimum: 1,
  })
  @IsInt({ message: '包裝規格必須是整數' })
  @Min(1, { message: '包裝規格必須大於 0' })
  pack_size: number;

  @ApiProperty({
    description: '口罩顯示名稱',
    example: '康匠 彩色醫療口罩 50入 粉色',
    maxLength: 255,
  })
  @IsString({ message: '顯示名稱必須是字串' })
  @MaxLength(255, { message: '顯示名稱長度不能超過 255 個字元' })
  display_name: string;

  @ApiProperty({
    description: '口罩單價（每包價格）',
    example: 99.50,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '價格必須是有效的數字（最多兩位小數）' })
  @Min(0, { message: '價格不能為負數' })
  price: number;

  @ApiProperty({
    description: '庫存數量',
    example: 100,
    minimum: 0,
  })
  @IsInt({ message: '庫存數量必須是整數' })
  @Min(0, { message: '庫存數量不能為負數' })
  quantity: number;

  @ApiProperty({
    description: '口罩類型 ID（可選，如果提供則更新現有產品）',
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '口罩類型 ID 必須是字串' })
  mask_type_id?: string;
}