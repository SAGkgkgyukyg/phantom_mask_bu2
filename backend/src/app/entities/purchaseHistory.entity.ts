import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Pharmacy } from './pharmacy.entity';
import { PurchaseDetail } from './purchaseDetail.entity';

@Entity('purchase_histories')
export class PurchaseHistory {
  @PrimaryGeneratedColumn('uuid')
  purchase_history_id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'uuid', nullable: false })
  pharmacy_id: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  transaction_amount: number;

  @Column({ type: 'timestamp', nullable: false })
  transaction_date: Date;

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
