import { ApiProperty } from '@nestjs/swagger';
import { InventoryResponseDto } from './storeResponse.dto';

export class PharmacyInventoryResponseDto {
  @ApiProperty({ description: '藥局 UUID' })
  pharmacy_id: string;

  @ApiProperty({ description: '藥局名稱' })
  name: string;

  @ApiProperty({ description: '現金餘額', type: 'number', format: 'decimal' })
  cash_balance: number;

  @ApiProperty({ description: '營業時間描述', nullable: true })
  opening_hours: string | null;

  @ApiProperty({ description: '庫存清單（已排序）', type: [InventoryResponseDto] })
  inventories: InventoryResponseDto[];
}