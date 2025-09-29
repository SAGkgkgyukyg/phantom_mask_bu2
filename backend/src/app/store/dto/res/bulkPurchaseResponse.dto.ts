import { ApiProperty } from '@nestjs/swagger';

export class PurchaseResultDto {
  @ApiProperty({
    description: '藥局 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  pharmacy_id: string;

  @ApiProperty({
    description: '藥局名稱',
    example: '健康藥局',
  })
  pharmacy_name: string;

  @ApiProperty({
    description: '口罩類型 ID',
    example: '456e7890-e89b-12d3-a456-426614174001',
  })
  mask_type_id: string;

  @ApiProperty({
    description: '口罩顯示名稱',
    example: '3M N95 口罩 (白色) - 50片裝',
  })
  mask_display_name: string;

  @ApiProperty({
    description: '購買數量',
    example: 3,
  })
  quantity: number;

  @ApiProperty({
    description: '單價',
    example: 150.50,
  })
  unit_price: number;

  @ApiProperty({
    description: '總價',
    example: 451.50,
  })
  total_price: number;
}

export class BulkPurchaseResponseDto {
  @ApiProperty({
    description: '使用者 ID',
    example: '789e1234-e89b-12d3-a456-426614174002',
  })
  user_id: string;

  @ApiProperty({
    description: '使用者名稱',
    example: '王小明',
  })
  user_name: string;

  @ApiProperty({
    description: '交易前餘額',
    example: 5000.00,
  })
  previous_balance: number;

  @ApiProperty({
    description: '總消費金額',
    example: 1200.50,
  })
  total_amount: number;

  @ApiProperty({
    description: '交易後餘額',
    example: 3799.50,
  })
  remaining_balance: number;

  @ApiProperty({
    description: '交易時間',
    example: '2025-09-28T10:30:00.000Z',
  })
  transaction_date: Date;

  @ApiProperty({
    description: '購買結果詳細列表',
    type: [PurchaseResultDto],
  })
  purchases: PurchaseResultDto[];
}