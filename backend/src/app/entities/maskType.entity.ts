import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Inventory } from './inventory.entity';
import { PurchaseDetail } from './purchaseDetail.entity';

@Entity('mask_types')
export class MaskType {
  @PrimaryGeneratedColumn('uuid')
  mask_type_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  brand: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  color: string;

  @Column({ type: 'integer', nullable: false })
  pack_size: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  display_name: string;

  // 關聯關係
  @OneToMany(() => Inventory, inventory => inventory.maskType)
  inventories: Inventory[];

  @OneToMany(() => PurchaseDetail, purchaseDetail => purchaseDetail.maskType)
  purchaseDetails: PurchaseDetail[];
}