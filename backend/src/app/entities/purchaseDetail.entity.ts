import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PurchaseHistory } from './purchaseHistory.entity';
import { MaskType } from './maskType.entity';

@Entity('purchase_details')
export class PurchaseDetail {
  @PrimaryGeneratedColumn('uuid')
  purchase_detail_id: string;

  @Column({ type: 'uuid', nullable: false })
  purchase_history_id: string;

  @Column({ type: 'uuid', nullable: false })
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
