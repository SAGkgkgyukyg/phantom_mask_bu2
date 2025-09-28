import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseItemDto } from './purchaseItem.dto';

export class BulkPurchaseDto {
  @ApiProperty({
    description: '使用者 UUID',
    example: '789e1234-e89b-12d3-a456-426614174002',
  })
  @IsUUID('4', { message: '使用者 ID 必須為有效的 UUID' })
  user_id: string;

  @ApiProperty({
    description: '購買項目列表',
    type: [PurchaseItemDto],
    example: [
      {
        pharmacy_id: '123e4567-e89b-12d3-a456-426614174000',
        mask_type_id: '456e7890-e89b-12d3-a456-426614174001',
        quantity: 3,
      },
      {
        pharmacy_id: '789e1234-e89b-12d3-a456-426614174003',
        mask_type_id: '456e7890-e89b-12d3-a456-426614174001',
        quantity: 2,
      },
    ],
  })
  @IsArray({ message: '購買項目必須為陣列' })
  @ArrayMinSize(1, { message: '至少需要一個購買項目' })
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];
}