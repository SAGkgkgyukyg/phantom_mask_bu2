import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { MaskProductItemDto } from './maskProductItem.dto';

export class BulkUpsertMaskProductsDto {
  @ApiProperty({
    description: '藥局的 UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: '藥局 ID 必須是有效的 UUID 格式' })
  pharmacy_id: string;

  @ApiProperty({
    description: '口罩產品列表',
    type: [MaskProductItemDto],
    minItems: 1,
  })
  @IsArray({ message: '口罩產品必須是陣列格式' })
  @ArrayMinSize(1, { message: '至少需要提供一個口罩產品' })
  @ValidateNested({ each: true })
  @Type(() => MaskProductItemDto)
  products: MaskProductItemDto[];
}