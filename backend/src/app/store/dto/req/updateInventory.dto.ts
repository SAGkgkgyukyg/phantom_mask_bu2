import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({
    description: '藥局的 UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: '藥局 ID 必須是有效的 UUID 格式' })
  pharmacy_id: string;

  @ApiProperty({
    description: '口罩類型的 UUID',
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d',
  })
  @IsUUID('4', { message: '口罩類型 ID 必須是有效的 UUID 格式' })
  mask_type_id: string;

  @ApiProperty({
    description: '新的庫存數量',
    example: 150,
    minimum: 0,
  })
  @IsInt({ message: '庫存數量必須是整數' })
  @Min(0, { message: '庫存數量不能為負數' })
  new_quantity: number;
}