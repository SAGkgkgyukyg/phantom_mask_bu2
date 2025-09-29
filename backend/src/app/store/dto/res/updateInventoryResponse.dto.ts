import { ApiProperty } from '@nestjs/swagger';

export class UpdateInventoryResponseDto {
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
    description: '口罩類型 ID',
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d',
  })
  mask_type_id: string;

  @ApiProperty({
    description: '口罩顯示名稱',
    example: '康匠 彩色醫療口罩 50入 粉色',
  })
  mask_display_name: string;

  @ApiProperty({
    description: '更新前的庫存數量',
    example: 100,
  })
  previous_quantity: number;

  @ApiProperty({
    description: '更新後的庫存數量',
    example: 150,
  })
  new_quantity: number;

  @ApiProperty({
    description: '庫存變更數量（正數表示增加，負數表示減少）',
    example: 50,
  })
  quantity_change: number;

  @ApiProperty({
    description: '庫存更新時間',
    example: '2024-01-15T10:30:00.000Z',
  })
  updated_at: Date;
}