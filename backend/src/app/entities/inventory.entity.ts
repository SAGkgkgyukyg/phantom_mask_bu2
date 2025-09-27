import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pharmacy } from './pharmacy.entity';
import { MaskType } from './maskType.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  inventory_id: string;

  @Column({ type: 'uuid', nullable: false })
  pharmacy_id: string;

  @Column({ type: 'uuid', nullable: false })
  mask_type_id: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'integer', nullable: false })
  quantity: number;

  // 關聯關係
  @ManyToOne(() => Pharmacy, pharmacy => pharmacy.inventories)
  @JoinColumn({ name: 'pharmacy_id' })
  pharmacy: Pharmacy;

  @ManyToOne(() => MaskType, maskType => maskType.inventories)
  @JoinColumn({ name: 'mask_type_id' })
  maskType: MaskType;
}