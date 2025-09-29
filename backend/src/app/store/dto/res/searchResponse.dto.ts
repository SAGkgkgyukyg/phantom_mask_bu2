import { ApiProperty } from '@nestjs/swagger';
import { SearchType } from '../req/searchRequest.dto';

export class SearchResultItemDto {
  @ApiProperty({
    description: '結果類型',
    enum: SearchType,
    example: SearchType.PHARMACY,
  })
  type: SearchType;

  @ApiProperty({
    description: '項目 ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: '項目名稱',
    example: '健康藥局',
  })
  name: string;

  @ApiProperty({
    description: '相關性分數',
    example: 0.95,
    minimum: 0,
    maximum: 1,
  })
  relevance: number;

  @ApiProperty({
    description: '藥局名稱（僅當結果類型為 mask 時顯示）',
    example: '康是美',
    required: false,
  })
  pharmacy_name?: string;

  @ApiProperty({
    description: '詳細資料',
    example: {
      name: '健康藥局',
      cash_balance: 5000.00,
      opening_hours: [
        {
          weekday: 'Monday',
          open_time: '08:00',
          close_time: '22:00'
        }
      ]
    },
  })
  data: any;
}

export class SearchResponseDto {
  @ApiProperty({
    description: '搜尋結果列表',
    type: [SearchResultItemDto],
  })
  results: SearchResultItemDto[];

  @ApiProperty({
    description: '符合條件的總結果數',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: '當前頁數',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '每頁結果數量',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: '搜尋關鍵字',
    example: '健康',
  })
  query: string;

  @ApiProperty({
    description: '搜尋類型',
    enum: SearchType,
    example: SearchType.ALL,
  })
  search_type: SearchType;
}