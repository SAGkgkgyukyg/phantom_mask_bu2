import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, DataSource } from 'typeorm';
import { Pharmacy } from '../entities/pharmacy.entity';
import { PurchaseHistory } from '../entities/purchaseHistory.entity';
import { User } from '../entities/user.entity';
import { Inventory } from '../entities/inventory.entity';
import { PurchaseDetail } from '../entities/purchaseDetail.entity';
import { MaskType } from '../entities/maskType.entity';
import { StoreFilterDto } from './dto/storeFilter.dto';
import {
  StoreResponseDto,
  TopSpendersFilterDto,
  TopSpendersResponseDto,
  BulkPurchaseDto,
  BulkPurchaseResponseDto,
  CancelTransactionDto,
  CancelTransactionResponseDto,
  UpdateUserBalanceDto,
  UpdateUserBalanceResponseDto,
  UpdateInventoryDto,
  UpdateInventoryResponseDto,
  BulkUpsertMaskProductsDto,
  BulkUpsertMaskProductsResponseDto,
  SearchRequestDto,
  SearchResponseDto,
  SearchType,
} from './dto';
import {
  WeekdayAbbreviation,
  WeekdayName,
  WeekdayNameToAbbreviationMap,
} from './enum/weekday.enum';
import { TransactionStatus } from './enum/transaction-status.enum';
import {
  InventoryFilterDto,
  SortBy,
  SortOrder,
} from './dto/inventoryFilter.dto';
import { PharmacyInventoryResponseDto } from './dto/pharmacyInventoryResponse.dto';
import {
  PriceQuantityFilterDto,
  QuantityThresholdType,
} from './dto/priceQuantityFilter.dto';
import { PriceQuantityFilterResponseDto } from './dto/priceQuantityFilterResponse.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Pharmacy)
    private readonly pharmacyRepository: Repository<Pharmacy>,
    @InjectRepository(PurchaseHistory)
    private readonly purchaseHistoryRepository: Repository<PurchaseHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(PurchaseDetail)
    private readonly purchaseDetailRepository: Repository<PurchaseDetail>,
    @InjectRepository(MaskType)
    private readonly maskTypeRepository: Repository<MaskType>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 取得符合篩選條件的商店（藥局）資訊
   * @param filterDto 篩選條件（營業時間區間、星期）
   * @returns 包含庫存和營業時間的符合條件的商店資訊
   */
  async getAllStores(filterDto?: StoreFilterDto): Promise<StoreResponseDto[]> {
    // 參數驗證：如果提供了時間篩選，start_time 和 end_time 必須同時存在
    if (filterDto) {
      const { start_time, end_time } = filterDto;

      // 檢查時間參數的完整性
      if ((start_time && !end_time) || (!start_time && end_time)) {
        throw new BadRequestException(
          'start_time 和 end_time 必須同時提供。如果要進行時間篩選，請同時提供開始時間和結束時間。',
        );
      }
    }

    const queryBuilder = this.pharmacyRepository
      .createQueryBuilder('pharmacy')
      .leftJoinAndSelect('pharmacy.inventories', 'inventories')
      .leftJoinAndSelect('inventories.maskType', 'maskType')
      .leftJoinAndSelect('pharmacy.pharmacyHours', 'pharmacyHours')
      .leftJoinAndSelect('pharmacyHours.weekday', 'weekday');

    // 篩選條件
    if (filterDto) {
      const { start_time, end_time, weekdays } = filterDto;
      // makesure weekdays is follow WeekdayName use the map to convert
      const validWeekdays = weekdays?.map((day) => {
        if (Object.values(WeekdayName).includes(day as any)) {
          const abbreviation = WeekdayNameToAbbreviationMap[day];
          return abbreviation;
        } else if (Object.values(WeekdayAbbreviation).includes(day as any)) {
          return day;
        } else {
          return null;
        }
      });

      if (validWeekdays && validWeekdays.length > 0) {
        queryBuilder.andWhere('weekday.short_name IN (:...weekdays)', {
          weekdays: validWeekdays,
        });
      }

      // 只有當 start_time 和 end_time 都存在時才進行時間篩選
      if (start_time && end_time) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            // 1. 非跨夜營業：查詢時間段必須完全落在營業時間內
            qb.where('pharmacyHours.is_overnight = false')
              .andWhere(':start_time >= pharmacyHours.open_time', {
                start_time,
              })
              .andWhere(':end_time <= pharmacyHours.close_time', { end_time })
              .orWhere(
                new Brackets((subQb) => {
                  // 2. 跨夜營業：查詢時間段可能落在當天或隔天的營業時間內
                  subQb.where('pharmacyHours.is_overnight = true').andWhere(
                    new Brackets((timeQb) => {
                      // 2a. 查詢時間段完全在當天的營業時間內（從open_time到24:00）
                      timeQb
                        .where(':start_time >= pharmacyHours.open_time', {
                          start_time,
                        })
                        .andWhere(':end_time >= pharmacyHours.open_time', {
                          end_time,
                        })
                        // 2b. 或查詢時間段完全在隔天的營業時間內（從00:00到close_time）
                        .orWhere(
                          new Brackets((nextDayQb) => {
                            nextDayQb
                              .where(
                                ':start_time <= pharmacyHours.close_time',
                                {
                                  start_time,
                                },
                              )
                              .andWhere(
                                ':end_time <= pharmacyHours.close_time',
                                {
                                  end_time,
                                },
                              );
                          }),
                        );
                    }),
                  );
                }),
              );
          }),
        );
      }
    }

    const pharmacies = await queryBuilder
      .orderBy('pharmacy.name', 'ASC')
      .addOrderBy('maskType.display_name', 'ASC')
      .addOrderBy('weekday.weekday_id', 'ASC')
      .getMany();

    // 轉換為符合 DTO 結構的響應
    return pharmacies.map((pharmacy) => ({
      pharmacy_id: pharmacy.pharmacy_id,
      name: pharmacy.name,
      cash_balance: pharmacy.cash_balance,
      opening_hours: pharmacy.opening_hours,
      inventories:
        pharmacy.inventories?.map((inventory) => ({
          inventory_id: inventory.inventory_id,
          price: inventory.price,
          quantity: inventory.quantity,
          maskType: {
            mask_type_id: inventory.maskType.mask_type_id,
            brand: inventory.maskType.brand,
            color: inventory.maskType.color,
            pack_size: inventory.maskType.pack_size,
            display_name: inventory.maskType.display_name,
          },
        })) || [],
      pharmacyHours:
        pharmacy.pharmacyHours?.map((hour) => ({
          open_time: hour.open_time,
          close_time: hour.close_time,
          is_overnight: hour.is_overnight,
          weekday: {
            name: hour.weekday.name,
            short_name: hour.weekday.short_name,
          },
        })) || [],
    }));
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

  /**
   * 取得指定藥局的存貨資訊，支援排序
   * @param filterDto 包含藥局 ID 和排序選項的篩選條件
   * @returns 包含排序後存貨資料的藥局資訊
   */
  async getPharmacyInventory(
    filterDto: InventoryFilterDto,
  ): Promise<PharmacyInventoryResponseDto> {
    const {
      pharmacy_id,
      sort_by = SortBy.NAME,
      sort_order = SortOrder.ASC,
    } = filterDto;

    // 建立查詢建構器
    const queryBuilder = this.pharmacyRepository
      .createQueryBuilder('pharmacy')
      .leftJoinAndSelect('pharmacy.inventories', 'inventories')
      .leftJoinAndSelect('inventories.maskType', 'maskType')
      .where('pharmacy.pharmacy_id = :pharmacy_id', { pharmacy_id });

    // 根據排序選項設定排序
    if (sort_by === SortBy.NAME) {
      queryBuilder.orderBy('maskType.display_name', sort_order);
    } else if (sort_by === SortBy.PRICE) {
      queryBuilder.orderBy('inventories.price', sort_order);
      // 加入次要排序以保證結果穩定
      queryBuilder.addOrderBy('maskType.display_name', 'ASC');
    }

    const pharmacy = await queryBuilder.getOne();

    if (!pharmacy) {
      throw new NotFoundException(`找不到 ID 為 ${pharmacy_id} 的藥局`);
    }

    // 轉換為符合 DTO 結構的響應
    return {
      pharmacy_id: pharmacy.pharmacy_id,
      name: pharmacy.name,
      cash_balance: pharmacy.cash_balance,
      opening_hours: pharmacy.opening_hours,
      inventories:
        pharmacy.inventories?.map((inventory) => ({
          inventory_id: inventory.inventory_id,
          price: inventory.price,
          quantity: inventory.quantity,
          maskType: {
            mask_type_id: inventory.maskType.mask_type_id,
            brand: inventory.maskType.brand,
            color: inventory.maskType.color,
            pack_size: inventory.maskType.pack_size,
            display_name: inventory.maskType.display_name,
          },
        })) || [],
    };
  }

  /**
   * 根據價格範圍和存貨數量門檻篩選藥局和商品
   * @param filterDto 價格範圍和數量門檻篩選條件
   * @returns 符合條件的藥局和商品資訊
   */
  async getPharmaciesByPriceAndQuantity(
    filterDto: PriceQuantityFilterDto,
  ): Promise<PriceQuantityFilterResponseDto[]> {
    const {
      min_price,
      max_price,
      threshold_type,
      quantity_threshold,
      quantity_threshold_max,
    } = filterDto;

    // 參數驗證
    if (
      min_price !== undefined &&
      max_price !== undefined &&
      min_price > max_price
    ) {
      throw new BadRequestException('價格下限不能大於價格上限');
    }

    if (threshold_type === QuantityThresholdType.BETWEEN) {
      if (quantity_threshold_max === undefined) {
        throw new BadRequestException(
          '當門檻類型為 between 時，必須提供數量上限門檻值',
        );
      }
      if (quantity_threshold >= quantity_threshold_max) {
        throw new BadRequestException('數量下限門檻不能大於或等於上限門檻');
      }
    }

    // 建立查詢建構器
    const queryBuilder = this.pharmacyRepository
      .createQueryBuilder('pharmacy')
      .leftJoinAndSelect('pharmacy.inventories', 'inventories')
      .leftJoinAndSelect('inventories.maskType', 'maskType');

    // 價格範圍篩選
    if (min_price !== undefined) {
      queryBuilder.andWhere('inventories.price >= :min_price', { min_price });
    }

    if (max_price !== undefined) {
      queryBuilder.andWhere('inventories.price <= :max_price', { max_price });
    }

    // 數量門檻篩選
    switch (threshold_type) {
      case QuantityThresholdType.ABOVE:
        queryBuilder.andWhere('inventories.quantity > :quantity_threshold', {
          quantity_threshold,
        });
        break;

      case QuantityThresholdType.BELOW:
        queryBuilder.andWhere('inventories.quantity < :quantity_threshold', {
          quantity_threshold,
        });
        break;

      case QuantityThresholdType.BETWEEN:
        queryBuilder.andWhere('inventories.quantity >= :quantity_threshold', {
          quantity_threshold,
        });
        queryBuilder.andWhere(
          'inventories.quantity <= :quantity_threshold_max',
          { quantity_threshold_max },
        );
        break;
    }

    // 只包含有符合條件商品的藥局
    queryBuilder.andWhere('inventories.inventory_id IS NOT NULL');

    const pharmacies = await queryBuilder
      .orderBy('pharmacy.name', 'ASC')
      .addOrderBy('maskType.display_name', 'ASC')
      .getMany();

    // 轉換為符合 DTO 結構的響應，過濾出符合條件的商品
    return pharmacies
      .map((pharmacy) => {
        // 過濾符合條件的商品
        const filteredInventories =
          pharmacy.inventories?.filter((inventory) => {
            // 價格範圍檢查
            if (min_price !== undefined && inventory.price < min_price)
              return false;
            if (max_price !== undefined && inventory.price > max_price)
              return false;

            // 數量門檻檢查
            switch (threshold_type) {
              case QuantityThresholdType.ABOVE:
                return inventory.quantity > quantity_threshold;

              case QuantityThresholdType.BELOW:
                return inventory.quantity < quantity_threshold;

              case QuantityThresholdType.BETWEEN:
                return (
                  inventory.quantity >= quantity_threshold &&
                  inventory.quantity <= (quantity_threshold_max || 0)
                );

              default:
                return false;
            }
          }) || [];

        return {
          pharmacy_id: pharmacy.pharmacy_id,
          name: pharmacy.name,
          cash_balance: pharmacy.cash_balance,
          opening_hours: pharmacy.opening_hours,
          filtered_products: filteredInventories.map((inventory) => ({
            inventory_id: inventory.inventory_id,
            price: inventory.price,
            quantity: inventory.quantity,
            maskType: {
              mask_type_id: inventory.maskType.mask_type_id,
              brand: inventory.maskType.brand,
              color: inventory.maskType.color,
              pack_size: inventory.maskType.pack_size,
              display_name: inventory.maskType.display_name,
            },
          })),
          total_filtered_products: filteredInventories.length,
        };
      })
      .filter((pharmacy) => pharmacy.total_filtered_products > 0); // 只返回有符合條件商品的藥局
  }

  /**
   * 取得在特定日期範圍內購買口罩花費最多的前 N 位使用者
   * @param filterDto 包含日期範圍和前 N 位數量的篩選條件
   * @returns 前 N 位消費使用者的詳細資訊
   */
  async getTopSpenders(
    filterDto: TopSpendersFilterDto,
  ): Promise<TopSpendersResponseDto> {
    const { start_date, end_date, top_n } = filterDto;

    // 參數驗證和日期處理
    const startDate = new Date(start_date);
    let endDate = new Date(end_date);

    // 如果 end_date 只提供日期沒有時間部分，則設定為當天的 23:59:59.999
    const endDateString = end_date.trim();

    // 檢查是否包含時間資訊（包含 T 或 冒號，或者長度超過 10 表示有時間部分）
    const hasTimeInfo =
      endDateString.includes('T') ||
      endDateString.includes(':') ||
      endDateString.length > 10;

    if (!hasTimeInfo) {
      // 只有日期部分，設定為當天結束時間
      endDate.setHours(23, 59, 59, 999);
    }

    if (startDate >= endDate) {
      throw new BadRequestException('開始日期必須早於結束日期');
    }

    // 查詢指定日期範圍內的購買記錄，按使用者分組並計算總花費
    const topSpendersQuery = this.purchaseHistoryRepository
      .createQueryBuilder('ph')
      .leftJoinAndSelect('ph.user', 'user')
      .leftJoinAndSelect('ph.pharmacy', 'pharmacy')
      .leftJoinAndSelect('ph.purchaseDetails', 'pd')
      .leftJoinAndSelect('pd.maskType', 'maskType')
      .where('ph.transaction_date >= :start_date', { start_date: startDate })
      .andWhere('ph.transaction_date <= :end_date', { end_date: endDate })
      .orderBy('ph.user_id', 'ASC')
      .addOrderBy('ph.transaction_date', 'DESC');

    const purchaseHistories = await topSpendersQuery.getMany();

    // 按使用者分組並計算總花費
    const userSpendingMap = new Map<
      string,
      {
        user: any;
        totalSpending: number;
        totalTransactions: number;
        purchaseRecords: any[];
      }
    >();

    purchaseHistories.forEach((ph) => {
      const userId = ph.user_id;

      if (!userSpendingMap.has(userId)) {
        userSpendingMap.set(userId, {
          user: ph.user,
          totalSpending: 0,
          totalTransactions: 0,
          purchaseRecords: [],
        });
      }

      const userData = userSpendingMap.get(userId)!;
      userData.totalSpending += Number(ph.transaction_amount);
      userData.totalTransactions += 1;
      userData.purchaseRecords.push({
        purchase_history_id: ph.purchase_history_id,
        pharmacy: {
          pharmacy_id: ph.pharmacy.pharmacy_id,
          name: ph.pharmacy.name,
        },
        transaction_amount: Number(ph.transaction_amount),
        transaction_date: ph.transaction_date,
        purchase_details: ph.purchaseDetails.map((pd) => ({
          purchase_detail_id: pd.purchase_detail_id,
          maskType: {
            mask_type_id: pd.maskType.mask_type_id,
            brand: pd.maskType.brand,
            color: pd.maskType.color,
            pack_size: pd.maskType.pack_size,
            display_name: pd.maskType.display_name,
          },
          quantity: pd.quantity,
          price: Number(pd.price),
          total_price: Number(pd.total_price),
        })),
      });
    });

    // 按總花費排序並取前 N 位
    const sortedUsers = Array.from(userSpendingMap.values())
      .sort((a, b) => b.totalSpending - a.totalSpending)
      .slice(0, top_n);

    // 轉換為回應格式
    const topSpenders = sortedUsers.map((userData) => ({
      user_id: userData.user.user_id,
      name: userData.user.name,
      total_spending: userData.totalSpending,
      total_transactions: userData.totalTransactions,
      purchase_records: userData.purchaseRecords,
    }));

    return {
      date_range: {
        start_date,
        end_date,
      },
      top_n,
      actual_count: topSpenders.length,
      top_spenders: topSpenders,
    };
  }

  /**
   * 處理使用者從多家藥局批量購買口罩
   * @param purchaseDto 包含使用者 ID 和購買項目列表
   * @returns 批量購買結果詳細資訊
   */
  async processBulkPurchase(
    purchaseDto: BulkPurchaseDto,
  ): Promise<BulkPurchaseResponseDto> {
    const { user_id, items } = purchaseDto;

    // 使用資料庫事務確保所有操作的原子性
    return await this.dataSource.transaction(async (manager) => {
      // 1. 檢查使用者是否存在並取得目前餘額
      const user = await manager.findOne(User, {
        where: { user_id },
      });

      if (!user) {
        throw new NotFoundException(`找不到 ID 為 ${user_id} 的使用者`);
      }

      // 2. 驗證所有購買項目並計算總金額
      interface PurchaseValidation {
        pharmacy: Pharmacy;
        maskType: MaskType;
        inventory: Inventory;
        quantity: number;
        unit_price: number;
        total_price: number;
      }

      const purchaseValidations: PurchaseValidation[] = [];
      let totalAmount = 0;

      for (const item of items) {
        const { pharmacy_id, mask_type_id, quantity } = item;

        // 檢查藥局是否存在
        const pharmacy = await manager.findOne(Pharmacy, {
          where: { pharmacy_id },
        });

        if (!pharmacy) {
          throw new NotFoundException(`找不到 ID 為 ${pharmacy_id} 的藥局`);
        }

        // 檢查口罩類型是否存在
        const maskType = await manager.findOne(MaskType, {
          where: { mask_type_id },
        });

        if (!maskType) {
          throw new NotFoundException(
            `找不到 ID 為 ${mask_type_id} 的口罩類型`,
          );
        }

        // 檢查該藥局是否有此口罩的庫存
        const inventory = await manager.findOne(Inventory, {
          where: { pharmacy_id, mask_type_id },
        });

        if (!inventory) {
          throw new BadRequestException(
            `藥局 ${pharmacy.name} 沒有 ${maskType.display_name} 的庫存`,
          );
        }

        // 檢查庫存數量是否足夠
        if (inventory.quantity < quantity) {
          throw new BadRequestException(
            `藥局 ${pharmacy.name} 的 ${maskType.display_name} 庫存不足，現有數量: ${inventory.quantity}，需求數量: ${quantity}`,
          );
        }

        const itemTotalPrice = Number(inventory.price) * quantity;
        totalAmount += itemTotalPrice;

        // 儲存驗證資料供後續使用
        purchaseValidations.push({
          pharmacy,
          maskType,
          inventory,
          quantity,
          unit_price: Number(inventory.price),
          total_price: itemTotalPrice,
        });
      }

      // 3. 檢查使用者餘額是否足夠
      const currentBalance = Number(user.cash_balance);
      if (currentBalance < totalAmount) {
        throw new BadRequestException(
          `使用者餘額不足，目前餘額: ${currentBalance}，所需金額: ${totalAmount}`,
        );
      }

      // 4. 更新使用者餘額
      const newUserBalance = currentBalance - totalAmount;
      await manager.update(User, { user_id }, { cash_balance: newUserBalance });

      // 5. 為每個藥局建立購買記錄和更新庫存、藥局餘額
      interface PurchaseResult {
        pharmacy_id: string;
        pharmacy_name: string;
        mask_type_id: string;
        mask_display_name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
      }

      const purchaseResults: PurchaseResult[] = [];
      const transactionDate = new Date();

      // 按藥局分組處理
      const pharmacyGroups = new Map();
      purchaseValidations.forEach((validation) => {
        const pharmacyId = validation.pharmacy.pharmacy_id;
        if (!pharmacyGroups.has(pharmacyId)) {
          pharmacyGroups.set(pharmacyId, []);
        }
        pharmacyGroups.get(pharmacyId).push(validation);
      });

      // 為每個藥局處理交易
      for (const [pharmacyId, validations] of pharmacyGroups) {
        const pharmacy = validations[0].pharmacy;

        // 計算該藥局的交易總額
        const pharmacyTransactionAmount = validations.reduce(
          (sum, validation) => sum + validation.total_price,
          0,
        );

        // 建立購買歷史記錄
        const purchaseHistory = manager.create(PurchaseHistory, {
          user_id,
          pharmacy_id: pharmacyId,
          transaction_amount: pharmacyTransactionAmount,
          transaction_date: transactionDate,
          status: TransactionStatus.DONE,
        });
        const savedPurchaseHistory = await manager.save(
          PurchaseHistory,
          purchaseHistory,
        );

        // 為每個商品建立購買詳細記錄並更新庫存
        for (const validation of validations) {
          const { maskType, inventory, quantity, unit_price, total_price } =
            validation;

          // 建立購買詳細記錄
          const purchaseDetail = manager.create(PurchaseDetail, {
            purchase_history_id: savedPurchaseHistory.purchase_history_id,
            mask_type_id: maskType.mask_type_id,
            quantity,
            price: unit_price,
            total_price,
          });
          await manager.save(PurchaseDetail, purchaseDetail);

          // 更新庫存數量
          const newQuantity = inventory.quantity - quantity;
          await manager.update(
            Inventory,
            { inventory_id: inventory.inventory_id },
            { quantity: newQuantity },
          );

          // 為回應準備購買結果
          purchaseResults.push({
            pharmacy_id: pharmacy.pharmacy_id,
            pharmacy_name: pharmacy.name,
            mask_type_id: maskType.mask_type_id,
            mask_display_name: maskType.display_name,
            quantity,
            unit_price,
            total_price,
          });
        }

        // 更新藥局餘額
        const newPharmacyBalance =
          Number(pharmacy.cash_balance) + pharmacyTransactionAmount;
        await manager.update(
          Pharmacy,
          { pharmacy_id: pharmacyId },
          { cash_balance: newPharmacyBalance },
        );
      }

      // 6. 回傳購買結果
      return {
        user_id,
        user_name: user.name,
        previous_balance: currentBalance,
        total_amount: totalAmount,
        remaining_balance: newUserBalance,
        transaction_date: transactionDate,
        purchases: purchaseResults,
      };
    });
  }

  /**
   * 取消購買交易
   * @param cancelDto 包含購買歷程 ID 的取消請求
   * @returns 取消交易的詳細結果
   */
  async cancelTransaction(
    cancelDto: CancelTransactionDto,
  ): Promise<CancelTransactionResponseDto> {
    const { user_id, purchase_history_id } = cancelDto;

    // 使用資料庫事務確保所有操作的原子性
    return await this.dataSource.transaction(async (manager) => {
      // 1. 檢查使用者是否存在
      const requestUser = await manager.findOne(User, {
        where: { user_id },
      });

      if (!requestUser) {
        throw new NotFoundException(`找不到 ID 為 ${user_id} 的使用者`);
      }

      // 2. 檢查購買記錄是否存在且屬於該使用者
      const purchaseHistory = await manager.findOne(PurchaseHistory, {
        where: {
          purchase_history_id,
          user_id, // 確保購買記錄屬於該使用者
        },
        relations: {
          user: true,
          pharmacy: true,
          purchaseDetails: {
            maskType: true,
          },
        },
      });

      if (!purchaseHistory) {
        throw new NotFoundException(
          `找不到 ID 為 ${purchase_history_id} 的購買記錄，或該記錄不屬於使用者 ${user_id}`,
        );
      }

      if (purchaseHistory.status === TransactionStatus.CANCELLED) {
        throw new BadRequestException('此交易已經被取消過了');
      }

      if (purchaseHistory.status !== TransactionStatus.DONE) {
        throw new BadRequestException('只能取消狀態為完成的交易');
      }

      const user = purchaseHistory.user;
      const pharmacy = purchaseHistory.pharmacy;
      const transactionAmount = Number(purchaseHistory.transaction_amount);
      const currentUserBalance = Number(user.cash_balance);

      // 2. 更新使用者餘額（退還金額）
      const newUserBalance = currentUserBalance + transactionAmount;
      await manager.update(
        User,
        { user_id: user.user_id },
        { cash_balance: newUserBalance },
      );

      // 3. 更新藥局餘額（扣除退還金額）
      const currentPharmacyBalance = Number(pharmacy.cash_balance);
      const newPharmacyBalance = currentPharmacyBalance - transactionAmount;
      await manager.update(
        Pharmacy,
        { pharmacy_id: pharmacy.pharmacy_id },
        { cash_balance: newPharmacyBalance },
      );

      // 4. 回復庫存數量並準備回應數據
      interface CancelledItem {
        pharmacy_id: string;
        pharmacy_name: string;
        mask_type_id: string;
        mask_display_name: string;
        quantity: number;
        unit_price: number;
        refund_amount: number;
      }

      const cancelledItems: CancelledItem[] = [];

      for (const purchaseDetail of purchaseHistory.purchaseDetails) {
        // 找到對應的庫存記錄
        const inventory = await manager.findOne(Inventory, {
          where: {
            pharmacy_id: pharmacy.pharmacy_id,
            mask_type_id: purchaseDetail.mask_type_id,
          },
        });

        if (!inventory) {
          // 如果找不到庫存記錄，創建新的庫存記錄
          const newInventory = manager.create(Inventory, {
            pharmacy_id: pharmacy.pharmacy_id,
            mask_type_id: purchaseDetail.mask_type_id,
            price: purchaseDetail.price,
            quantity: purchaseDetail.quantity,
          });
          await manager.save(Inventory, newInventory);
        } else {
          // 更新現有庫存數量
          const newQuantity = inventory.quantity + purchaseDetail.quantity;
          await manager.update(
            Inventory,
            { inventory_id: inventory.inventory_id },
            { quantity: newQuantity },
          );
        }

        // 準備取消項目資訊
        cancelledItems.push({
          pharmacy_id: pharmacy.pharmacy_id,
          pharmacy_name: pharmacy.name,
          mask_type_id: purchaseDetail.maskType.mask_type_id,
          mask_display_name: purchaseDetail.maskType.display_name,
          quantity: purchaseDetail.quantity,
          unit_price: Number(purchaseDetail.price),
          refund_amount: Number(purchaseDetail.total_price),
        });
      }

      // 5. 更新購買記錄狀態為取消
      await manager.update(
        PurchaseHistory,
        { purchase_history_id },
        { status: TransactionStatus.CANCELLED },
      );

      // 6. 回傳取消結果
      return {
        purchase_history_id,
        user_id: user.user_id,
        user_name: user.name,
        previous_user_balance: currentUserBalance,
        total_refund_amount: transactionAmount,
        new_user_balance: newUserBalance,
        cancellation_date: new Date(),
        original_transaction_date: purchaseHistory.transaction_date,
        cancelled_items: cancelledItems,
      };
    });
  }

  /**
   * 管理員更新使用者現金餘額
   * @param updateDto 包含使用者 ID 和新餘額的更新請求
   * @param adminId 執行操作的管理員 ID
   * @returns 餘額更新結果
   */
  async updateUserBalance(
    updateDto: UpdateUserBalanceDto,
    adminId: string,
  ): Promise<UpdateUserBalanceResponseDto> {
    const { user_id, new_balance } = updateDto;

    // 使用資料庫事務確保操作的原子性
    return await this.dataSource.transaction(async (manager) => {
      // 1. 檢查使用者是否存在
      const user = await manager.findOne(User, {
        where: { user_id },
      });

      if (!user) {
        throw new NotFoundException(`找不到 ID 為 ${user_id} 的使用者`);
      }

      const previousBalance = Number(user.cash_balance);

      // 2. 更新使用者餘額
      await manager.update(User, { user_id }, { cash_balance: new_balance });

      // 3. 計算餘額變更
      const balanceChange = new_balance - previousBalance;

      // 4. 回傳更新結果
      return {
        user_id: user.user_id,
        user_name: user.name,
        previous_balance: previousBalance,
        new_balance: new_balance,
        balance_change: balanceChange,
        updated_at: new Date(),
        updated_by: adminId,
      };
    });
  }

  /**
   * 更新藥局特定口罩的庫存數量
   * @param updateDto 包含藥局 ID、口罩類型 ID 和新庫存數量的更新請求
   * @returns 庫存更新結果
   */
  async updateInventory(
    updateDto: UpdateInventoryDto,
  ): Promise<UpdateInventoryResponseDto> {
    const { pharmacy_id, mask_type_id, new_quantity } = updateDto;

    // 使用資料庫事務確保操作的原子性
    return await this.dataSource.transaction(async (manager) => {
      // 1. 檢查藥局是否存在
      const pharmacy = await manager.findOne(Pharmacy, {
        where: { pharmacy_id },
      });

      if (!pharmacy) {
        throw new NotFoundException(`找不到 ID 為 ${pharmacy_id} 的藥局`);
      }

      // 2. 檢查口罩類型是否存在
      const maskType = await manager.findOne(MaskType, {
        where: { mask_type_id },
      });

      if (!maskType) {
        throw new NotFoundException(`找不到 ID 為 ${mask_type_id} 的口罩類型`);
      }

      // 3. 檢查該藥局是否有此口罩的庫存記錄
      const inventory = await manager.findOne(Inventory, {
        where: { pharmacy_id, mask_type_id },
      });

      if (!inventory) {
        throw new NotFoundException(
          `藥局 ${pharmacy.name} 沒有 ${maskType.display_name} 的庫存記錄`,
        );
      }

      const previousQuantity = inventory.quantity;
      const quantityChange = new_quantity - previousQuantity;

      // 4. 更新庫存數量
      await manager.update(
        Inventory,
        { inventory_id: inventory.inventory_id },
        { quantity: new_quantity },
      );

      // 5. 回傳更新結果
      return {
        pharmacy_id: pharmacy.pharmacy_id,
        pharmacy_name: pharmacy.name,
        mask_type_id: maskType.mask_type_id,
        mask_display_name: maskType.display_name,
        previous_quantity: previousQuantity,
        new_quantity: new_quantity,
        quantity_change: quantityChange,
        updated_at: new Date(),
      };
    });
  }

  /**
   * 批量新增或更新藥局的口罩產品
   * @param upsertDto 包含藥局 ID 和口罩產品列表的批量更新請求
   * @returns 批量 upsert 結果
   */
  async bulkUpsertMaskProducts(
    upsertDto: BulkUpsertMaskProductsDto,
  ): Promise<BulkUpsertMaskProductsResponseDto> {
    const { pharmacy_id, products } = upsertDto;

    // 使用資料庫事務確保所有操作的原子性
    return await this.dataSource.transaction(async (manager) => {
      // 1. 檢查藥局是否存在
      const pharmacy = await manager.findOne(Pharmacy, {
        where: { pharmacy_id },
      });

      if (!pharmacy) {
        throw new NotFoundException(`找不到 ID 為 ${pharmacy_id} 的藥局`);
      }

      const processedProducts: any[] = [];
      let createdCount = 0;
      let updatedCount = 0;

      // 2. 處理每個口罩產品
      for (const productData of products) {
        let maskType: MaskType | null;
        let inventory: Inventory | null;
        let action: 'created' | 'updated';

        // 3. 處理口罩類型
        if (productData.mask_type_id) {
          // 如果提供了 mask_type_id，嘗試找到現有的口罩類型
          maskType = await manager.findOne(MaskType, {
            where: { mask_type_id: productData.mask_type_id },
          });

          if (!maskType) {
            throw new NotFoundException(
              `找不到 ID 為 ${productData.mask_type_id} 的口罩類型`,
            );
          }

          // 更新現有口罩類型的資訊
          maskType.brand = productData.brand;
          maskType.color = productData.color;
          maskType.pack_size = productData.pack_size;
          maskType.display_name = productData.display_name;

          await manager.save(MaskType, maskType);
          action = 'updated';
        } else {
          // 檢查是否已存在相同的口罩類型（根據品牌、顏色、包裝規格）
          maskType = await manager.findOne(MaskType, {
            where: {
              brand: productData.brand,
              color: productData.color,
              pack_size: productData.pack_size,
            },
          });

          if (maskType) {
            // 更新現有口罩類型的顯示名稱
            maskType.display_name = productData.display_name;
            await manager.save(MaskType, maskType);
            action = 'updated';
          } else {
            // 建立新的口罩類型
            maskType = manager.create(MaskType, {
              brand: productData.brand,
              color: productData.color,
              pack_size: productData.pack_size,
              display_name: productData.display_name,
            });
            maskType = await manager.save(MaskType, maskType);
            action = 'created';
          }
        }

        // 4. 處理庫存記錄
        inventory = await manager.findOne(Inventory, {
          where: {
            pharmacy_id: pharmacy_id,
            mask_type_id: maskType.mask_type_id,
          },
        });

        if (inventory) {
          // 更新現有庫存
          inventory.price = productData.price;
          inventory.quantity = productData.quantity;
          await manager.save(Inventory, inventory);

          // 如果口罩類型是新建的但庫存已存在，視為更新操作
          if (action === 'created') {
            action = 'updated';
          }
        } else {
          // 建立新的庫存記錄
          inventory = manager.create(Inventory, {
            pharmacy_id: pharmacy_id,
            mask_type_id: maskType.mask_type_id,
            price: productData.price,
            quantity: productData.quantity,
          });
          inventory = await manager.save(Inventory, inventory);

          // 如果是新的庫存記錄，即使口罩類型存在，也算作新增
          action = 'created';
        }

        // 5. 統計操作數量
        if (action === 'created') {
          createdCount++;
        } else {
          updatedCount++;
        }

        // 6. 收集處理結果
        processedProducts.push({
          mask_type_id: maskType.mask_type_id,
          inventory_id: inventory.inventory_id,
          brand: maskType.brand,
          color: maskType.color,
          pack_size: maskType.pack_size,
          display_name: maskType.display_name,
          price: Number(inventory.price),
          quantity: inventory.quantity,
          action: action,
        });
      }

      // 7. 回傳處理結果
      return {
        pharmacy_id: pharmacy.pharmacy_id,
        pharmacy_name: pharmacy.name,
        total_processed: processedProducts.length,
        created_count: createdCount,
        updated_count: updatedCount,
        processed_products: processedProducts,
        processed_at: new Date(),
      };
    });
  }

  /**
   * 搜尋藥局和口罩
   * 依名稱搜尋藥局或口罩，並依搜尋詞的相關性對結果進行排名
   * @param searchDto 搜尋條件
   * @returns 搜尋結果，包含藥局和/或口罩資訊
   */
  async searchPharmaciesAndMasks(
    searchDto: SearchRequestDto,
  ): Promise<SearchResponseDto> {
    const { query, type = SearchType.ALL, limit = 10, offset = 0 } = searchDto;

    let allResults: any[] = [];

    // 搜尋藥局
    if (type === SearchType.PHARMACY || type === SearchType.ALL) {
      const pharmacyResults = await this.searchPharmacies(query, limit * 2);
      allResults = [...allResults, ...pharmacyResults];
    }

    // 搜尋口罩
    if (type === SearchType.MASK || type === SearchType.ALL) {
      const maskResults = await this.searchMasks(query, limit * 2);
      allResults = [...allResults, ...maskResults];
    }

    // 依相關性排序
    allResults.sort((a, b) => b.relevance - a.relevance);

    // 分頁處理
    const totalResults = allResults.length;
    const paginatedResults = allResults.slice(offset, offset + limit);

    return {
      results: paginatedResults,
      total: totalResults,
      page: Math.floor(offset / limit) + 1,
      limit: limit,
      query: query,
      search_type: type,
    };
  }

  /**
   * 搜尋藥局
   * @param searchTerm 搜尋關鍵字
   * @param limit 結果限制數量
   * @returns 藥局搜尋結果
   */
  private async searchPharmacies(
    searchTerm: string,
    limit: number,
  ): Promise<any[]> {
    const queryBuilder = this.pharmacyRepository
      .createQueryBuilder('pharmacy')
      .leftJoinAndSelect('pharmacy.pharmacyHours', 'pharmacyHours')
      .leftJoinAndSelect('pharmacyHours.weekday', 'weekday')
      .where('LOWER(pharmacy.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .limit(limit);

    const pharmacies = await queryBuilder.getMany();

    return pharmacies.map((pharmacy) => ({
      type: SearchType.PHARMACY,
      id: pharmacy.pharmacy_id,
      name: pharmacy.name,
      relevance: this.calculateRelevance(searchTerm, pharmacy.name),
      data: {
        pharmacy_id: pharmacy.pharmacy_id,
        name: pharmacy.name,
        cash_balance: Number(pharmacy.cash_balance),
        opening_hours: pharmacy.pharmacyHours.map((hour) => ({
          weekday: hour.weekday.name,
          open_time: hour.open_time,
          close_time: hour.close_time,
        })),
      },
    }));
  }

  /**
   * 搜尋口罩
   * @param searchTerm 搜尋關鍵字
   * @param limit 結果限制數量
   * @returns 口罩搜尋結果
   */
  private async searchMasks(searchTerm: string, limit: number): Promise<any[]> {
    const queryBuilder = this.maskTypeRepository
      .createQueryBuilder('maskType')
      .leftJoinAndSelect('maskType.inventories', 'inventory')
      .leftJoinAndSelect('inventory.pharmacy', 'pharmacy')
      .where(
        new Brackets((qb) => {
          qb.where('LOWER(maskType.brand) LIKE LOWER(:searchTerm)', {
            searchTerm: `%${searchTerm}%`,
          })
            .orWhere('LOWER(maskType.color) LIKE LOWER(:searchTerm)', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('LOWER(maskType.display_name) LIKE LOWER(:searchTerm)', {
              searchTerm: `%${searchTerm}%`,
            });
        }),
      )
      .andWhere('inventory.quantity > 0') // 只顯示有庫存的口罩
      .limit(limit);

    const masks = await queryBuilder.getMany();

    const results: any[] = [];

    masks.forEach((mask) => {
      mask.inventories.forEach((inventory) => {
        if (inventory.quantity > 0) {
          // 計算每個口罩名稱的相關性
          const brandRelevance = this.calculateRelevance(
            searchTerm,
            mask.brand,
          );
          const colorRelevance = this.calculateRelevance(
            searchTerm,
            mask.color || '',
          );
          const displayNameRelevance = this.calculateRelevance(
            searchTerm,
            mask.display_name || '',
          );
          const maxRelevance = Math.max(
            brandRelevance,
            colorRelevance,
            displayNameRelevance,
          );

          results.push({
            type: SearchType.MASK,
            id: mask.mask_type_id,
            name:
              mask.display_name || `${mask.brand} ${mask.color || ''}`.trim(),
            relevance: maxRelevance,
            pharmacy_name: inventory.pharmacy?.name,
            data: {
              mask_type_id: mask.mask_type_id,
              brand: mask.brand,
              color: mask.color,
              pack_size: mask.pack_size,
              display_name: mask.display_name,
              price: Number(inventory.price),
              quantity: inventory.quantity,
              pharmacy: {
                pharmacy_id: inventory.pharmacy?.pharmacy_id,
                name: inventory.pharmacy?.name,
              },
            },
          });
        }
      });
    });

    return results;
  }

  /**
   * 計算搜尋相關性分數
   * @param searchTerm 搜尋關鍵字
   * @param targetName 目標名稱
   * @returns 相關性分數 (0-1)
   */
  private calculateRelevance(searchTerm: string, targetName: string): number {
    if (!targetName) return 0;

    const term = searchTerm.toLowerCase().trim();
    const name = targetName.toLowerCase().trim();

    if (name === term) return 1.0; // 完全匹配
    if (name.startsWith(term)) return 0.8; // 前綴匹配
    if (name.includes(term)) return 0.6; // 包含匹配

    // 模糊匹配 - 簡單的字元距離計算
    const distance = this.levenshteinDistance(name, term);
    const maxLength = Math.max(name.length, term.length);
    if (distance <= 2 && maxLength > 0) {
      return Math.max(0.2, 1 - distance / maxLength);
    }

    return 0;
  }

  /**
   * 計算 Levenshtein 距離
   * @param str1 第一個字串
   * @param str2 第二個字串
   * @returns 編輯距離
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i] + 1, // deletion
          matrix[j - 1][i - 1] + substitutionCost, // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}
