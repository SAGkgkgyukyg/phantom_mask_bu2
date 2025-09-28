import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Pharmacy } from './pharmacy.entity';
import { PurchaseDetail } from './purchaseDetail.entity';
import { TransactionStatus } from '../store/enum/transaction-status.enum';

@Entity('purchase_histories')
// 複合索引
@Index('idx_purchase_histories_date_user', ['transaction_date', 'user_id', 'status']) // 日期、使用者、狀態複合索引
@Index('idx_purchase_histories_user_date', ['user_id', 'transaction_date']) // 使用者和日期複合索引
@Index('idx_purchase_analysis', ['user_id', 'transaction_date', 'status', 'transaction_amount']) // 完整分析複合索引
export class PurchaseHistory {
  @PrimaryGeneratedColumn('uuid')
  purchase_history_id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index('idx_purchase_histories_user_id') // 使用者 ID 索引
  user_id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index('idx_purchase_histories_pharmacy_id') // 藥局 ID 索引
  pharmacy_id: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  @Index('idx_purchase_histories_amount') // 交易金額索引
  transaction_amount: number;

  @Column({ type: 'timestamp', nullable: false })
  @Index('idx_purchase_histories_transaction_date') // 交易日期索引
  transaction_date: Date;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.DONE,
    nullable: false,
  })
  @Index('idx_purchase_histories_status') // 狀態索引
  status: TransactionStatus;

  // 關聯關係
  @ManyToOne(() => User, (user) => user.purchaseHistories)
  @JoinColumn({ name: 'user_id'})
  user: User;

  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.purchaseHistories)
  @JoinColumn({ name: 'pharmacy_id' })
  pharmacy: Pharmacy;

  @OneToMany(
    () => PurchaseDetail,
    (purchaseDetail) => purchaseDetail.purchaseHistory,
  )
  purchaseDetails: PurchaseDetail[];
}
