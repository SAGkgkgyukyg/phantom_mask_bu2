import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { PurchaseHistory } from './purchaseHistory.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index('idx_users_name') // 姓名索引（用於搜尋功能）
  name: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
    default: 0,
  })
  @Index('idx_users_cash_balance') // 現金餘額索引（用於分析）
  cash_balance: number;

  // 關聯關係
  @OneToMany(() => PurchaseHistory, (purchaseHistory) => purchaseHistory.user)
  purchaseHistories: PurchaseHistory[];
}
