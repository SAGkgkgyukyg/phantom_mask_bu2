import { ApiProperty } from '@nestjs/swagger';

export class CancelledItemDto {
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
    description: '退回數量',
    example: 3,
  })
  quantity: number;

  @ApiProperty({
    description: '單價',
    example: 150.50,
  })
  unit_price: number;

  @ApiProperty({
    description: '退款總價',
    example: 451.50,
  })
  refund_amount: number;
}

export class CancelTransactionResponseDto {
  @ApiProperty({
    description: '購買歷程 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  purchase_history_id: string;

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
    description: '取消前使用者餘額',
    example: 3799.50,
  })
  previous_user_balance: number;

  @ApiProperty({
    description: '總退款金額',
    example: 1200.50,
  })
  total_refund_amount: number;

  @ApiProperty({
    description: '取消後使用者餘額',
    example: 5000.00,
  })
  new_user_balance: number;

  @ApiProperty({
    description: '取消時間',
    example: '2025-09-28T10:30:00.000Z',
  })
  cancellation_date: Date;

  @ApiProperty({
    description: '原始交易時間',
    example: '2025-09-28T09:15:00.000Z',
  })
  original_transaction_date: Date;

  @ApiProperty({
    description: '取消的商品項目詳細列表',
    type: [CancelledItemDto],
  })
  cancelled_items: CancelledItemDto[];
}