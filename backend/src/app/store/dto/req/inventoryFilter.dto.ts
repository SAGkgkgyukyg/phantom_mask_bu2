import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';

export enum SortBy {
  NAME = 'name',
  PRICE = 'price',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class InventoryFilterDto {
  @ApiProperty({
    description: '藥局 UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID(4, { message: '藥局 ID 必須是有效的 UUID 格式' })
  pharmacy_id: string;

  @ApiProperty({
    description: '排序欄位',
    enum: SortBy,
    example: SortBy.NAME,
    required: false,
    default: SortBy.NAME,
  })
  @IsOptional()
  @IsEnum(SortBy, { message: '排序欄位必須是 name 或 price' })
  sort_by?: SortBy = SortBy.NAME;

  @ApiProperty({
    description: '排序順序',
    enum: SortOrder,
    example: SortOrder.ASC,
    required: false,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: '排序順序必須是 ASC 或 DESC' })
  sort_order?: SortOrder = SortOrder.ASC;
}