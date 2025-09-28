import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Pharmacy } from './pharmacy.entity';
import { MaskType } from './maskType.entity';

@Entity('inventory')
// 複合索引
@Index('idx_inventory_pharmacy_mask', ['pharmacy_id', 'mask_type_id']) // 藥局和口罩類型複合索引
@Index('idx_inventory_price_quantity', ['price', 'quantity']) // 價格和數量複合索引
@Index('idx_inventory_complete', ['pharmacy_id', 'mask_type_id', 'quantity', 'price']) // 完整複合索引
// 註：部分索引需要手動建立 CREATE INDEX idx_inventory_active ON inventory (pharmacy_id, mask_type_id) WHERE quantity > 0
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  inventory_id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index('idx_inventory_pharmacy_id') // 藥局 ID 索引
  pharmacy_id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index('idx_inventory_mask_type_id') // 口罩類型 ID 索引
  mask_type_id: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  @Index('idx_inventory_price') // 價格索引
  price: number;

  @Column({ type: 'integer', nullable: false })
  @Index('idx_inventory_quantity') // 數量索引
  quantity: number;

  // 關聯關係
  @ManyToOne(() => Pharmacy, pharmacy => pharmacy.inventories)
  @JoinColumn({ name: 'pharmacy_id' })
  pharmacy: Pharmacy;

  @ManyToOne(() => MaskType, maskType => maskType.inventories)
  @JoinColumn({ name: 'mask_type_id' })
  maskType: MaskType;
}