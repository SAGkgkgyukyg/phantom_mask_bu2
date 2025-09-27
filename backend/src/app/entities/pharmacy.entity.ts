import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Inventory } from './inventory.entity';
import { PurchaseHistory } from './purchaseHistory.entity';
import { PharmacyHour } from './pharmacyHour.entity';

@Entity('pharmacies')
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  pharmacy_id: string;

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

  @Column({ type: 'varchar', length: 255, nullable: true })
  opening_hours: string;

  // 關聯關係
  @OneToMany(() => Inventory, (inventory) => inventory.pharmacy)
  inventories: Inventory[];

  @OneToMany(
    () => PurchaseHistory,
    (purchaseHistory) => purchaseHistory.pharmacy,
  )
  purchaseHistories: PurchaseHistory[];

  @OneToMany(() => PharmacyHour, (pharmacyHour) => pharmacyHour.pharmacy)
  pharmacyHours: PharmacyHour[];
}
