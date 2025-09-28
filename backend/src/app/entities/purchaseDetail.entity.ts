import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PurchaseHistory } from './purchaseHistory.entity';
import { MaskType } from './maskType.entity';

@Entity('purchase_details')
// 複合索引
@Index('idx_purchase_details_history_mask', ['purchase_history_id', 'mask_type_id']) // 歷史和口罩類型複合索引
@Index('idx_purchase_details_quantity_price', ['quantity', 'total_price']) // 數量和總價複合索引
export class PurchaseDetail {
  @PrimaryGeneratedColumn('uuid')
  purchase_detail_id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index('idx_purchase_details_history_id') // 購買歷史 ID 索引
  purchase_history_id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index('idx_purchase_details_mask_type_id') // 口罩類型 ID 索引
  mask_type_id: string;

  @Column({ type: 'integer', nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  total_price: number;

  // 關聯關係
  @ManyToOne(
    () => PurchaseHistory,
    (purchaseHistory) => purchaseHistory.purchaseDetails,
  )
  @JoinColumn({ name: 'purchase_history_id'})
  purchaseHistory: PurchaseHistory;

  @ManyToOne(() => MaskType, (maskType) => maskType.purchaseDetails)
  @JoinColumn({ name: 'mask_type_id' })
  maskType: MaskType;
}
