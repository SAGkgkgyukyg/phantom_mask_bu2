import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pharmacy } from './pharmacy.entity';
import { Weekday } from './weekday.entity';

@Entity('pharmacy_hours')
// 複合索引
@Index('idx_pharmacy_hours_pharmacy_weekday', ['pharmacy_id', 'weekday_id']) // 藥局和星期複合索引
@Index('idx_pharmacy_hours_weekday_time', ['weekday_id', 'open_time', 'close_time']) // 星期和時間複合索引
@Index('idx_pharmacy_hours_schedule', ['pharmacy_id', 'weekday_id', 'open_time', 'close_time']) // 完整排程複合索引
export class PharmacyHour {
  @PrimaryGeneratedColumn('uuid')
  schedule_id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index('idx_pharmacy_hours_pharmacy_id') // 藥局 ID 索引
  pharmacy_id: string;

  @Column({ type: 'uuid', nullable: false })
  @Index('idx_pharmacy_hours_weekday_id') // 星期 ID 索引
  weekday_id: string;

  @Column({ type: 'time', nullable: false })
  @Index('idx_pharmacy_hours_open_time') // 開門時間索引
  open_time: string;

  @Column({ type: 'time', nullable: false })
  @Index('idx_pharmacy_hours_close_time') // 關門時間索引
  close_time: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  @Index('idx_pharmacy_hours_overnight') // 跨夜營業索引
  is_overnight: boolean;

  // 關聯關係
  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.pharmacyHours)
  @JoinColumn({ name: 'pharmacy_id' })
  pharmacy: Pharmacy;

  @ManyToOne(() => Weekday, (weekday) => weekday.pharmacyHours)
  @JoinColumn({ name: 'weekday_id' })
  weekday: Weekday;
}
