import { ApiProperty } from '@nestjs/swagger';

export class MaskTypeResponseDto {
  @ApiProperty({ description: '口罩類型 UUID' })
  mask_type_id: string;

  @ApiProperty({ description: '品牌' })
  brand: string;

  @ApiProperty({ description: '顏色' })
  color: string;

  @ApiProperty({ description: '包裝規格' })
  pack_size: number;

  @ApiProperty({ description: '顯示名稱' })
  display_name: string;
}

export class InventoryResponseDto {
  @ApiProperty({ description: '庫存 UUID' })
  inventory_id: string;

  @ApiProperty({ description: '價格', type: 'number', format: 'decimal' })
  price: number;

  @ApiProperty({ description: '數量' })
  quantity: number;

  @ApiProperty({ description: '口罩類型資訊', type: MaskTypeResponseDto })
  maskType: MaskTypeResponseDto;
}

export class WeekdayResponseDto {
  // @ApiProperty({ description: '星期 UUID' })
  // weekday_id: string;

  @ApiProperty({ description: '星期名稱' })
  name: string;

  @ApiProperty({ description: '星期縮寫' })
  short_name: string;
}

export class PharmacyHourResponseDto {
  // @ApiProperty({ description: '營業時間 UUID' })
  // schedule_id: string;

  @ApiProperty({ description: '開店時間', format: 'time' })
  open_time: string;

  @ApiProperty({ description: '關店時間', format: 'time' })
  close_time: string;

  @ApiProperty({ description: '是否跨夜營業' })
  is_overnight: boolean;

  @ApiProperty({ description: '星期資訊', type: WeekdayResponseDto })
  weekday: WeekdayResponseDto;
}

export class StoreResponseDto {
  @ApiProperty({ description: '藥局 UUID' })
  pharmacy_id: string;

  @ApiProperty({ description: '藥局名稱' })
  name: string;

  @ApiProperty({ description: '現金餘額', type: 'number', format: 'decimal' })
  cash_balance: number;

  @ApiProperty({ description: '營業時間描述', nullable: true })
  opening_hours: string | null;

  @ApiProperty({ description: '庫存清單', type: [InventoryResponseDto] })
  inventories?: InventoryResponseDto[];

  @ApiProperty({ description: '詳細營業時間', type: [PharmacyHourResponseDto] })
  pharmacyHours: PharmacyHourResponseDto[];
}
