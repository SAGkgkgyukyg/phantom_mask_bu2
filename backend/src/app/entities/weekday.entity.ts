import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { PharmacyHour } from './pharmacyHour.entity';
import { WeekdayAbbreviation, WeekdayName } from '../store/enum/weekday.enum';

@Entity('weekdays')
export class Weekday {
  @PrimaryGeneratedColumn('uuid')
  weekday_id: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  @Index('idx_weekdays_name') // 星期名稱索引
  name: WeekdayName;

  @Column({ type: 'varchar', length: 5, nullable: false })
  @Index('idx_weekdays_short_name') // 星期縮寫索引
  short_name: WeekdayAbbreviation;

  // 關聯關係
  @OneToMany(() => PharmacyHour, (pharmacyHour) => pharmacyHour.weekday)
  pharmacyHours: PharmacyHour[];
}
