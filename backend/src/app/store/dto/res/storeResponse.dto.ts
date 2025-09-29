import { ApiProperty } from '@nestjs/swagger';

export class MaskTypeResponseDto {
  @ApiProperty({ 
    description: '口罩類型 UUID',
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d',
  })
  mask_type_id: string;

  @ApiProperty({ 
    description: '品牌',
    example: '康匠',
  })
  brand: string;

  @ApiProperty({ 
    description: '顏色',
    example: '粉色',
  })
  color: string;

  @ApiProperty({ 
    description: '包裝規格',
    example: 50,
  })
  pack_size: number;

  @ApiProperty({ 
    description: '顯示名稱',
    example: '康匠 彩色醫療口罩 50入 粉色',
  })
  display_name: string;
}

export class InventoryResponseDto {
  @ApiProperty({ 
    description: '庫存 UUID',
    example: 'b2c3d4e5-f6a7-4b5c-8d9e-2f3a4b5c6d7e',
  })
  inventory_id: string;

  @ApiProperty({ 
    description: '價格', 
    type: 'number', 
    format: 'decimal',
    example: 99.50,
  })
  price: number;

  @ApiProperty({ 
    description: '數量',
    example: 100,
  })
  quantity: number;

  @ApiProperty({ 
    description: '口罩類型資訊', 
    type: MaskTypeResponseDto,
  })
  maskType: MaskTypeResponseDto;
}

export class WeekdayResponseDto {
  @ApiProperty({ 
    description: '星期名稱',
    example: 'Monday',
  })
  name: string;

  @ApiProperty({ 
    description: '星期縮寫',
    example: 'Mon',
  })
  short_name: string;
}

export class PharmacyHourResponseDto {
  @ApiProperty({ 
    description: '開店時間', 
    format: 'time',
    example: '08:00',
  })
  open_time: string;

  @ApiProperty({ 
    description: '關店時間', 
    format: 'time',
    example: '22:00',
  })
  close_time: string;

  @ApiProperty({ 
    description: '是否跨夜營業',
    example: false,
  })
  is_overnight: boolean;

  @ApiProperty({ 
    description: '星期資訊', 
    type: WeekdayResponseDto,
  })
  weekday: WeekdayResponseDto;
}

export class StoreResponseDto {
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
    description: '庫存清單', 
    type: [InventoryResponseDto],
  })
  inventories?: InventoryResponseDto[];

  @ApiProperty({ 
    description: '詳細營業時間', 
    type: [PharmacyHourResponseDto],
  })
  pharmacyHours: PharmacyHourResponseDto[];
}
