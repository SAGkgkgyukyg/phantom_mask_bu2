import { ApiProperty } from '@nestjs/swagger';

export class UpsertedProductDto {
  @ApiProperty({
    description: '口罩類型 ID',
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d',
  })
  mask_type_id: string;

  @ApiProperty({
    description: '庫存記錄 ID',
    example: 'b2c3d4e5-f6a7-4b5c-9d8e-2f3a4b5c6d7e',
  })
  inventory_id: string;

  @ApiProperty({
    description: '口罩品牌名稱',
    example: '康匠',
  })
  brand: string;

  @ApiProperty({
    description: '口罩顏色',
    example: '粉色',
  })
  color: string;

  @ApiProperty({
    description: '包裝規格（每包數量）',
    example: 50,
  })
  pack_size: number;

  @ApiProperty({
    description: '口罩顯示名稱',
    example: '康匠 彩色醫療口罩 50入 粉色',
  })
  display_name: string;

  @ApiProperty({
    description: '單價',
    example: 99.50,
  })
  price: number;

  @ApiProperty({
    description: '庫存數量',
    example: 100,
  })
  quantity: number;

  @ApiProperty({
    description: '操作類型（新增或更新）',
    example: 'created',
    enum: ['created', 'updated'],
  })
  action: 'created' | 'updated';
}

export class BulkUpsertMaskProductsResponseDto {
  @ApiProperty({
    description: '藥局 ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  pharmacy_id: string;

  @ApiProperty({
    description: '藥局名稱',
    example: '健康藥局',
  })
  pharmacy_name: string;

  @ApiProperty({
    description: '成功處理的產品總數',
    example: 3,
  })
  total_processed: number;

  @ApiProperty({
    description: '新增的產品數量',
    example: 2,
  })
  created_count: number;

  @ApiProperty({
    description: '更新的產品數量',
    example: 1,
  })
  updated_count: number;

  @ApiProperty({
    description: '處理的產品詳細資訊',
    type: [UpsertedProductDto],
  })
  processed_products: UpsertedProductDto[];

  @ApiProperty({
    description: '處理時間',
    example: '2024-01-15T10:30:00.000Z',
  })
  processed_at: Date;
}