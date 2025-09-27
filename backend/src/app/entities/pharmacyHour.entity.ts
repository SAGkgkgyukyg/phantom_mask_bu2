import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pharmacy } from './pharmacy.entity';
import { Weekday } from './weekday.entity';

@Entity('pharmacy_hours')
export class PharmacyHour {
  @PrimaryGeneratedColumn('uuid')
  schedule_id: string;

  @Column({ type: 'uuid', nullable: false })
  pharmacy_id: string;

  @Column({ type: 'uuid', nullable: false })
  weekday_id: string;

  @Column({ type: 'time', nullable: false })
  open_time: string;

  @Column({ type: 'time', nullable: false })
  close_time: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_overnight: boolean;

  // 關聯關係
  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.pharmacyHours)
  @JoinColumn({ name: 'pharmacy_id' })
  pharmacy: Pharmacy;

  @ManyToOne(() => Weekday, (weekday) => weekday.pharmacyHours)
  @JoinColumn({ name: 'weekday_id' })
  weekday: Weekday;
}
