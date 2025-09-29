import { ApiProperty } from '@nestjs/swagger';
import { MaskType } from '../../../entities/maskType.entity';

/**
 * 購買詳情資料傳輸物件
 */
export class PurchaseDetailResponseDto {
  @ApiProperty({
    description: '購買詳情 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  purchase_detail_id: string;

  @ApiProperty({
    description: '口罩類型資訊',
    example: {
      mask_type_id: '456e7890-e89b-12d3-a456-426614174001',
      brand: '3M',
      color: '白色',
      pack_size: 50,
      display_name: '3M N95 口罩 (白色) - 50片裝',
    },
  })
  maskType: {
    mask_type_id: string;
    brand: string;
    color: string;
    pack_size: number;
    display_name: string;
  };

  @ApiProperty({
    description: '購買數量',
    example: 3,
  })
  quantity: number;

  @ApiProperty({
    description: '單價',
    example: 150.50,
  })
  price: number;

  @ApiProperty({
    description: '總價',
    example: 451.50,
  })
  total_price: number;
}

/**
 * 購買記錄資料傳輸物件
 */
export class PurchaseRecordResponseDto {
  @ApiProperty({
    description: '購買記錄 ID',
    example: '789e1234-e89b-12d3-a456-426614174002',
  })
  purchase_history_id: string;

  @ApiProperty({
    description: '藥局資訊',
    example: {
      pharmacy_id: '123e4567-e89b-12d3-a456-426614174000',
      name: '健康藥局',
    },
  })
  pharmacy: {
    pharmacy_id: string;
    name: string;
  };

  @ApiProperty({
    description: '交易金額',
    example: 451.50,
  })
  transaction_amount: number;

  @ApiProperty({
    description: '交易日期',
    example: '2025-09-28T10:30:00.000Z',
  })
  transaction_date: Date;

  @ApiProperty({
    description: '購買詳情清單',
    type: [PurchaseDetailResponseDto],
  })
  purchase_details: PurchaseDetailResponseDto[];
}

/**
 * 最高消費使用者資料傳輸物件
 */
export class TopSpenderResponseDto {
  @ApiProperty({
    description: '使用者 ID',
    example: 'user-001',
  })
  user_id: string;

  @ApiProperty({
    description: '使用者姓名',
    example: '王小明',
  })
  name: string;

  @ApiProperty({
    description: '在指定時間範圍內的總消費金額',
    example: 12500.75,
  })
  total_spending: number;

  @ApiProperty({
    description: '在指定時間範圍內的消費記錄數量',
    example: 15,
  })
  total_transactions: number;

  @ApiProperty({
    description: '消費記錄清單',
    type: [PurchaseRecordResponseDto],
  })
  purchase_records: PurchaseRecordResponseDto[];
}

/**
 * 頂級消費者查詢結果資料傳輸物件
 */
export class TopSpendersResponseDto {
  @ApiProperty({
    description: '查詢時間範圍',
    example: {
      start_date: '2025-01-01',
      end_date: '2025-12-31',
    },
  })
  date_range: {
    start_date: string;
    end_date: string;
  };

  @ApiProperty({
    description: '查詢的前 N 位數量',
    example: 10,
  })
  top_n: number;

  @ApiProperty({
    description: '實際返回的使用者數量',
    example: 8,
  })
  actual_count: number;

  @ApiProperty({
    description: '頂級消費者清單',
    type: [TopSpenderResponseDto],
  })
  top_spenders: TopSpenderResponseDto[];
}