import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Inventory } from './inventory.entity';
import { PurchaseDetail } from './purchaseDetail.entity';

@Entity('mask_types')
// 複合搜尋索引 (需要手動建立 LOWER 索引)
@Index('idx_mask_types_search_lower', { synchronize: false }) // CREATE INDEX idx_mask_types_search_lower ON mask_types (LOWER(brand), LOWER(color), LOWER(display_name))
@Index('idx_mask_types_brand_color', ['brand', 'color']) // 品牌和顏色複合索引
export class MaskType {
  @PrimaryGeneratedColumn('uuid')
  mask_type_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index('idx_mask_types_brand') // 品牌索引
  brand: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @Index('idx_mask_types_color') // 顏色索引
  color: string;

  @Column({ type: 'integer', nullable: false })
  pack_size: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index('idx_mask_types_display_name') // 顯示名稱索引
  display_name: string;

  // 關聯關係
  @OneToMany(() => Inventory, inventory => inventory.maskType)
  inventories: Inventory[];

  @OneToMany(() => PurchaseDetail, purchaseDetail => purchaseDetail.maskType)
  purchaseDetails: PurchaseDetail[];
}