import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { Pharmacy } from '../entities/pharmacy.entity';
import { Inventory } from '../entities/inventory.entity';
import { PharmacyHour } from '../entities/pharmacyHour.entity';
import { MaskType } from '../entities/maskType.entity';
import { Weekday } from '../entities/weekday.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pharmacy,
      Inventory,
      PharmacyHour,
      MaskType,
      Weekday,
    ]),
  ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
