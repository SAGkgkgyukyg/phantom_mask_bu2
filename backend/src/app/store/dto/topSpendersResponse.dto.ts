import { MaskType } from '../../entities/maskType.entity';

/**
 * 購買詳情資料傳輸物件
 */
export class PurchaseDetailResponseDto {
  /**
   * 購買詳情 ID
   */
  purchase_detail_id: string;

  /**
   * 口罩類型資訊
   */
  maskType: {
    mask_type_id: string;
    brand: string;
    color: string;
    pack_size: number;
    display_name: string;
  };

  /**
   * 購買數量
   */
  quantity: number;

  /**
   * 單價
   */
  price: number;

  /**
   * 總價
   */
  total_price: number;
}

/**
 * 購買記錄資料傳輸物件
 */
export class PurchaseRecordResponseDto {
  /**
   * 購買記錄 ID
   */
  purchase_history_id: string;

  /**
   * 藥局資訊
   */
  pharmacy: {
    pharmacy_id: string;
    name: string;
  };

  /**
   * 交易金額
   */
  transaction_amount: number;

  /**
   * 交易日期
   */
  transaction_date: Date;

  /**
   * 購買詳情清單
   */
  purchase_details: PurchaseDetailResponseDto[];
}

/**
 * 最高消費使用者資料傳輸物件
 */
export class TopSpenderResponseDto {
  /**
   * 使用者 ID
   */
  user_id: string;

  /**
   * 使用者姓名
   */
  name: string;

  /**
   * 在指定時間範圍內的總消費金額
   */
  total_spending: number;

  /**
   * 在指定時間範圍內的消費記錄數量
   */
  total_transactions: number;

  /**
   * 消費記錄清單
   */
  purchase_records: PurchaseRecordResponseDto[];
}

/**
 * 頂級消費者查詢結果資料傳輸物件
 */
export class TopSpendersResponseDto {
  /**
   * 查詢時間範圍
   */
  date_range: {
    start_date: string;
    end_date: string;
  };

  /**
   * 查詢的前 N 位數量
   */
  top_n: number;

  /**
   * 實際返回的使用者數量
   */
  actual_count: number;

  /**
   * 頂級消費者清單
   */
  top_spenders: TopSpenderResponseDto[];
}