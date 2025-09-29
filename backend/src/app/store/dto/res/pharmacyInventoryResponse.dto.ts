import { ApiProperty } from '@nestjs/swagger';
import { InventoryResponseDto } from './storeResponse.dto';

export class PharmacyInventoryResponseDto {
  @ApiProperty({ 
    description: '藥局 UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  pharmacy_id: string;

  @ApiProperty({ 
    description: '藥局名稱',
    example: '健康藥局',
  })
  name: string;

  @ApiProperty({ 
    description: '現金餘額', 
    type: 'number', 
    format: 'decimal',
    example: 50000.00,
  })
  cash_balance: number;

  @ApiProperty({ 
    description: '營業時間描述', 
    nullable: true,
    example: '週一至週日 08:00-22:00',
  })
  opening_hours: string | null;

  @ApiProperty({ 
    description: '庫存清單（已排序）', 
    type: [InventoryResponseDto],
  })
  inventories: InventoryResponseDto[];
}