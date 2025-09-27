import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PurchaseHistory } from './purchaseHistory.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
    default: 0,
  })
  cash_balance: number;

  // 關聯關係
  @OneToMany(() => PurchaseHistory, (purchaseHistory) => purchaseHistory.user)
  purchaseHistories: PurchaseHistory[];
}
