import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacy } from '../entities/pharmacy.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Pharmacy)
    private readonly pharmacyRepository: Repository<Pharmacy>,
  ) {}

  /**
   * 取得所有商店（藥局）資訊
   * @returns 包含庫存和營業時間的完整商店資訊
   */
  async getAllStores(): Promise<Pharmacy[]> {
    return await this.pharmacyRepository.find({
      relations: {
        inventories: {
          maskType: true,
        },
        pharmacyHours: {
          weekday: true,
        },
      },
      order: {
        name: 'ASC',
        inventories: {
          maskType: {
            display_name: 'ASC',
          },
        },
        pharmacyHours: {
          weekday: {
            weekday_id: 'ASC',
          },
        },
      },
    });
  }

  /**
   * 根據 ID 取得特定商店資訊
   * @param storeId 商店 UUID
   * @returns 單一商店詳細資訊
   */
  async getStoreById(storeId: string): Promise<Pharmacy | null> {
    return await this.pharmacyRepository.findOne({
      where: { pharmacy_id: storeId },
      relations: {
        inventories: {
          maskType: true,
        },
        pharmacyHours: {
          weekday: true,
        },
      },
      order: {
        inventories: {
          maskType: {
            display_name: 'ASC',
          },
        },
        pharmacyHours: {
          weekday: {
            weekday_id: 'ASC',
          },
        },
      },
    });
  }
}
