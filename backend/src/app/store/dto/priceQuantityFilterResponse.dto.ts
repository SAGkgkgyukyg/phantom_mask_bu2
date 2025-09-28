import { ApiProperty } from '@nestjs/swagger';

/**
 * 符合條件的商品資訊
 */
export class FilteredProductDto {
  @ApiProperty({ description: '庫存 ID' })
  inventory_id: string;

  @ApiProperty({ description: '價格', example: 25.50 })
  price: number;

  @ApiProperty({ description: '數量', example: 150 })
  quantity: number;

  @ApiProperty({
    description: '口罩類型資訊',
    type: 'object',
    properties: {
      mask_type_id: { type: 'string', description: '口罩類型 ID' },
      brand: { type: 'string', description: '品牌', example: '3M' },
      color: { type: 'string', description: '顏色', example: '白色' },
      pack_size: { type: 'number', description: '包裝數量', example: 50 },
      display_name: { type: 'string', description: '顯示名稱', example: '3M 白色口罩 50入' }
    }
  })
  maskType: {
    mask_type_id: string;
    brand: string;
    color: string;
    pack_size: number;
    display_name: string;
  };
}

/**
 * 價格數量篩選結果響應 DTO
 */
export class PriceQuantityFilterResponseDto {
  @ApiProperty({ description: '藥局 ID' })
  pharmacy_id: string;

  @ApiProperty({ description: '藥局名稱', example: '康是美藥局' })
  name: string;

  @ApiProperty({ description: '現金餘額', example: 50000.00 })
  cash_balance: number;

  @ApiProperty({ description: '營業時間描述', example: '週一至週日 08:00-22:00' })
  opening_hours: string;

  @ApiProperty({
    description: '符合篩選條件的商品列表',
    type: [FilteredProductDto]
  })
  filtered_products: FilteredProductDto[];

  @ApiProperty({ description: '符合條件的商品總數', example: 3 })
  total_filtered_products: number;
}