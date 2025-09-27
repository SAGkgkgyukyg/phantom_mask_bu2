import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PharmacyHour } from './pharmacyHour.entity';

@Entity('weekdays')
export class Weekday {
  @PrimaryGeneratedColumn('uuid')
  weekday_id: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 5, nullable: false })
  short_name: string;

  // 關聯關係
  @OneToMany(() => PharmacyHour, (pharmacyHour) => pharmacyHour.weekday)
  pharmacyHours: PharmacyHour[];
}
