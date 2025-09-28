import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class PurchaseItemDto {
  @ApiProperty({
    description: '藥局 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: '藥局 ID 必須為有效的 UUID' })
  pharmacy_id: string;

  @ApiProperty({
    description: '口罩類型 UUID',
    example: '456e7890-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4', { message: '口罩 ID 必須為有效的 UUID' })
  mask_type_id: string;

  @ApiProperty({
    description: '購買數量',
    example: 5,
    minimum: 1,
  })
  @IsInt({ message: '購買數量必須為整數' })
  @Min(1, { message: '購買數量必須大於 0' })
  quantity: number;
}