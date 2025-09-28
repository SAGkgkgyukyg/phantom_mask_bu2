import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserBalanceResponseDto {
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
    description: '原始餘額',
    example: 5000.00,
  })
  previous_balance: number;

  @ApiProperty({
    description: '新的餘額',
    example: 10000.50,
  })
  new_balance: number;

  @ApiProperty({
    description: '餘額變更金額',
    example: 5000.50,
  })
  balance_change: number;

  @ApiProperty({
    description: '更新時間',
    example: '2025-09-28T10:30:00.000Z',
  })
  updated_at: Date;

  @ApiProperty({
    description: '執行操作的管理員 ID',
    example: 'admin-001',
  })
  updated_by: string;
}