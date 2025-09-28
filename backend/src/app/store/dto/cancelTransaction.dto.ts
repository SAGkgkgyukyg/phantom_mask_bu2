import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CancelTransactionDto {
  @ApiProperty({
    description: '使用者 UUID',
    example: '789e1234-e89b-12d3-a456-426614174002',
  })
  @IsUUID('4', { message: '使用者 ID 必須為有效的 UUID' })
  user_id: string;

  @ApiProperty({
    description: '購買歷程 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: '購買歷程 ID 必須為有效的 UUID' })
  purchase_history_id: string;
}