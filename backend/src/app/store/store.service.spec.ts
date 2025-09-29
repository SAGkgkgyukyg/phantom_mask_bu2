import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository, QueryBuilder } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StoreService } from './store.service';
import {
  Pharmacy,
  User,
  Inventory,
  PurchaseHistory,
  PurchaseDetail,
  MaskType,
} from '../entities';
import {
  StoreFilterDto,
  InventoryFilterDto,
  PriceQuantityFilterDto,
  BulkPurchaseDto,
  CancelTransactionDto,
  SearchRequestDto,
  SortBy,
  SortOrder,
  QuantityThresholdType,
  SearchType,
} from './dto/req';
import { TransactionStatus } from './enum/transaction-status.enum';

describe('StoreService', () => {
  let service: StoreService;
  let mockPharmacyRepository: jest.Mocked<Repository<Pharmacy>>;
  let mockPurchaseHistoryRepository: jest.Mocked<Repository<PurchaseHistory>>;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockInventoryRepository: jest.Mocked<Repository<Inventory>>;
  let mockPurchaseDetailRepository: jest.Mocked<Repository<PurchaseDetail>>;
  let mockMaskTypeRepository: jest.Mocked<Repository<MaskType>>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    // Create comprehensive query builder mock
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    };

    // Mock repositories with all necessary methods
    mockPharmacyRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    } as any;

    mockPurchaseHistoryRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    } as any;

    mockUserRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as any;

    mockInventoryRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as any;

    mockPurchaseDetailRepository = {
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    mockMaskTypeRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as any;

    // Mock DataSource with transaction support
    const mockManager = {
      findOne: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    mockDataSource = {
      transaction: jest
        .fn()
        .mockImplementation((callback) => callback(mockManager)),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: getRepositoryToken(Pharmacy),
          useValue: mockPharmacyRepository,
        },
        {
          provide: getRepositoryToken(PurchaseHistory),
          useValue: mockPurchaseHistoryRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Inventory),
          useValue: mockInventoryRepository,
        },
        {
          provide: getRepositoryToken(PurchaseDetail),
          useValue: mockPurchaseDetailRepository,
        },
        {
          provide: getRepositoryToken(MaskType),
          useValue: mockMaskTypeRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getAllStores', () => {
    const mockPharmacyData = {
      pharmacy_id: 'pharmacy-1',
      name: 'Test Pharmacy',
      cash_balance: 1000,
      opening_hours: 'Mon-Fri 9:00-18:00',
      inventories: [
        {
          inventory_id: 'inventory-1',
          price: 25.5,
          quantity: 100,
          maskType: {
            mask_type_id: 'mask-1',
            brand: 'Brand A',
            color: 'Blue',
            pack_size: 50,
            display_name: 'Brand A Blue (50pcs)',
          },
        },
      ],
      pharmacyHours: [
        {
          open_time: '09:00',
          close_time: '18:00',
          is_overnight: false,
          weekday: {
            name: 'Monday',
            short_name: 'Mon',
          },
        },
      ],
    };

    it('should return all stores without filters', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockPharmacyData]);

      const result = await service.getAllStores();

      expect(mockPharmacyRepository.createQueryBuilder).toHaveBeenCalledWith(
        'pharmacy',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'pharmacy.inventories',
        'inventories',
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
        cash_balance: 1000,
        opening_hours: 'Mon-Fri 9:00-18:00',
        inventories: [
          {
            inventory_id: 'inventory-1',
            price: 25.5,
            quantity: 100,
            maskType: {
              mask_type_id: 'mask-1',
              brand: 'Brand A',
              color: 'Blue',
              pack_size: 50,
              display_name: 'Brand A Blue (50pcs)',
            },
          },
        ],
        pharmacyHours: [
          {
            open_time: '09:00',
            close_time: '18:00',
            is_overnight: false,
            weekday: {
              name: 'Monday',
              short_name: 'Mon',
            },
          },
        ],
      });
    });

    it('should throw BadRequestException when only start_time is provided', async () => {
      const filterDto: StoreFilterDto = {
        start_time: '09:00',
      };

      await expect(service.getAllStores(filterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getAllStores(filterDto)).rejects.toThrow(
        'start_time 和 end_time 必須同時提供',
      );
    });

    it('should throw BadRequestException when only end_time is provided', async () => {
      const filterDto: StoreFilterDto = {
        end_time: '18:00',
      };

      await expect(service.getAllStores(filterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getAllStores(filterDto)).rejects.toThrow(
        'start_time 和 end_time 必須同時提供',
      );
    });

    it('should apply filters correctly when both start_time and end_time are provided', async () => {
      const filterDto: StoreFilterDto = {
        start_time: '09:00',
        end_time: '18:00',
        weekdays: ['Monday'],
      };

      mockQueryBuilder.getMany.mockResolvedValue([mockPharmacyData]);

      await service.getAllStores(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'weekday.short_name IN (:...weekdays)',
        { weekdays: ['Mon'] },
      );
      // Check that time filtering was called (it uses Brackets which is a function)
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });

  describe('getStoreById', () => {
    const storeId = 'pharmacy-1';

    it('should return store when found', async () => {
      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
        cash_balance: 1000,
        opening_hours: 'Mon-Fri 9:00-18:00',
        inventories: [],
        pharmacyHours: [],
        purchaseHistories: [],
      } as Pharmacy;

      mockPharmacyRepository.findOne.mockResolvedValue(mockPharmacy);

      const result = await service.getStoreById(storeId);

      expect(mockPharmacyRepository.findOne).toHaveBeenCalledWith({
        where: { pharmacy_id: storeId },
        relations: {
          inventories: { maskType: true },
          pharmacyHours: { weekday: true },
        },
        order: {
          inventories: { maskType: { display_name: 'ASC' } },
          pharmacyHours: { weekday: { weekday_id: 'ASC' } },
        },
      });
      expect(result).toEqual(mockPharmacy);
    });

    it('should return null when store not found', async () => {
      mockPharmacyRepository.findOne.mockResolvedValue(null);

      const result = await service.getStoreById(storeId);

      expect(result).toBeNull();
    });
  });

  describe('getPharmacyInventory', () => {
    const filterDto: InventoryFilterDto = {
      pharmacy_id: 'pharmacy-1',
      sort_by: SortBy.NAME,
      sort_order: SortOrder.ASC,
    };

    it('should return pharmacy inventory with default sorting', async () => {
      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
        cash_balance: 1000,
        opening_hours: 'Mon-Fri 9:00-18:00',
        inventories: [
          {
            inventory_id: 'inventory-1',
            price: 25.5,
            quantity: 100,
            maskType: {
              mask_type_id: 'mask-1',
              brand: 'Brand A',
              color: 'Blue',
              pack_size: 50,
              display_name: 'Brand A Blue (50pcs)',
            },
          },
        ],
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockPharmacy);

      const result = await service.getPharmacyInventory(filterDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'maskType.display_name',
        SortOrder.ASC,
      );
      expect(result.pharmacy_id).toBe('pharmacy-1');
      expect(result.inventories).toHaveLength(1);
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.getPharmacyInventory(filterDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getPharmacyInventory(filterDto)).rejects.toThrow(
        '找不到 ID 為 pharmacy-1 的藥局',
      );
    });

    it('should sort by price when specified', async () => {
      const priceFilterDto: InventoryFilterDto = {
        pharmacy_id: 'pharmacy-1',
        sort_by: SortBy.PRICE,
        sort_order: SortOrder.DESC,
      };

      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
        cash_balance: 1000,
        opening_hours: 'Mon-Fri 9:00-18:00',
        inventories: [],
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockPharmacy);

      await service.getPharmacyInventory(priceFilterDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'inventories.price',
        SortOrder.DESC,
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'maskType.display_name',
        'ASC',
      );
    });
  });

  describe('getPharmaciesByPriceAndQuantity', () => {
    it('should throw BadRequestException when min_price > max_price', async () => {
      const filterDto: PriceQuantityFilterDto = {
        min_price: 50,
        max_price: 25,
        threshold_type: QuantityThresholdType.ABOVE,
        quantity_threshold: 10,
      };

      await expect(
        service.getPharmaciesByPriceAndQuantity(filterDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getPharmaciesByPriceAndQuantity(filterDto),
      ).rejects.toThrow('價格下限不能大於價格上限');
    });

    it('should throw BadRequestException when threshold_type is BETWEEN but quantity_threshold_max is undefined', async () => {
      const filterDto: PriceQuantityFilterDto = {
        threshold_type: QuantityThresholdType.BETWEEN,
        quantity_threshold: 10,
      };

      await expect(
        service.getPharmaciesByPriceAndQuantity(filterDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getPharmaciesByPriceAndQuantity(filterDto),
      ).rejects.toThrow('當門檻類型為 between 時，必須提供數量上限門檻值');
    });

    it('should throw BadRequestException when quantity_threshold >= quantity_threshold_max in BETWEEN type', async () => {
      const filterDto: PriceQuantityFilterDto = {
        threshold_type: QuantityThresholdType.BETWEEN,
        quantity_threshold: 50,
        quantity_threshold_max: 50, // Equal to threshold
      };

      await expect(
        service.getPharmaciesByPriceAndQuantity(filterDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getPharmaciesByPriceAndQuantity(filterDto),
      ).rejects.toThrow('數量下限門檻不能大於或等於上限門檻');
    });

    it('should throw BadRequestException when quantity_threshold > quantity_threshold_max in BETWEEN type', async () => {
      const filterDto: PriceQuantityFilterDto = {
        threshold_type: QuantityThresholdType.BETWEEN,
        quantity_threshold: 100,
        quantity_threshold_max: 50, // Less than threshold
      };

      await expect(
        service.getPharmaciesByPriceAndQuantity(filterDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getPharmaciesByPriceAndQuantity(filterDto),
      ).rejects.toThrow('數量下限門檻不能大於或等於上限門檻');
    });

    it('should filter pharmacies by price and quantity successfully', async () => {
      const filterDto: PriceQuantityFilterDto = {
        min_price: 20,
        max_price: 50,
        threshold_type: QuantityThresholdType.ABOVE,
        quantity_threshold: 50,
      };

      const mockPharmacies = [
        {
          pharmacy_id: 'pharmacy-1',
          name: 'Test Pharmacy',
          cash_balance: 1000,
          opening_hours: 'Mon-Fri 9:00-18:00',
          inventories: [
            {
              inventory_id: 'inventory-1',
              price: 25,
              quantity: 100,
              maskType: {
                mask_type_id: 'mask-1',
                brand: 'Brand A',
                color: 'Blue',
                pack_size: 50,
                display_name: 'Brand A Blue (50pcs)',
              },
            },
          ],
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockPharmacies);

      const result = await service.getPharmaciesByPriceAndQuantity(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'inventories.price >= :min_price',
        { min_price: 20 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'inventories.price <= :max_price',
        { max_price: 50 },
      );
      expect(result).toHaveLength(1);
      expect(result[0].total_filtered_products).toBe(1);
    });

    it('should filter pharmacies by BELOW threshold type', async () => {
      const filterDto: PriceQuantityFilterDto = {
        threshold_type: QuantityThresholdType.BELOW,
        quantity_threshold: 30,
      };

      const mockPharmacies = [
        {
          pharmacy_id: 'pharmacy-1',
          name: 'Test Pharmacy',
          cash_balance: 1000,
          opening_hours: 'Mon-Fri 9:00-18:00',
          inventories: [
            {
              inventory_id: 'inventory-1',
              price: 25,
              quantity: 20, // Below threshold of 30
              maskType: {
                mask_type_id: 'mask-1',
                brand: 'Brand A',
                color: 'Blue',
                pack_size: 50,
                display_name: 'Brand A Blue (50pcs)',
              },
            },
          ],
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockPharmacies);

      const result = await service.getPharmaciesByPriceAndQuantity(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'inventories.quantity < :quantity_threshold',
        { quantity_threshold: 30 },
      );
      expect(result).toHaveLength(1);
      expect(result[0].total_filtered_products).toBe(1);
    });

    it('should filter pharmacies by BETWEEN threshold type', async () => {
      const filterDto: PriceQuantityFilterDto = {
        threshold_type: QuantityThresholdType.BETWEEN,
        quantity_threshold: 50,
        quantity_threshold_max: 150,
      };

      const mockPharmacies = [
        {
          pharmacy_id: 'pharmacy-1',
          name: 'Test Pharmacy',
          cash_balance: 1000,
          opening_hours: 'Mon-Fri 9:00-18:00',
          inventories: [
            {
              inventory_id: 'inventory-1',
              price: 25,
              quantity: 100, // Between 50 and 150
              maskType: {
                mask_type_id: 'mask-1',
                brand: 'Brand A',
                color: 'Blue',
                pack_size: 50,
                display_name: 'Brand A Blue (50pcs)',
              },
            },
          ],
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockPharmacies);

      const result = await service.getPharmaciesByPriceAndQuantity(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'inventories.quantity >= :quantity_threshold',
        { quantity_threshold: 50 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'inventories.quantity <= :quantity_threshold_max',
        { quantity_threshold_max: 150 },
      );
      expect(result).toHaveLength(1);
      expect(result[0].total_filtered_products).toBe(1);
    });
  });

  describe('processBulkPurchase', () => {
    const mockUser = {
      user_id: 'user-1',
      name: 'Test User',
      cash_balance: 1000,
    } as User;

    const mockPharmacy = {
      pharmacy_id: 'pharmacy-1',
      name: 'Test Pharmacy',
      cash_balance: 500,
    } as Pharmacy;

    const mockMaskType = {
      mask_type_id: 'mask-1',
      brand: 'Brand A',
      color: 'Blue',
      pack_size: 50,
      display_name: 'Brand A Blue (50pcs)',
    } as MaskType;

    const mockInventory = {
      inventory_id: 'inventory-1',
      pharmacy_id: 'pharmacy-1',
      mask_type_id: 'mask-1',
      price: 25,
      quantity: 100,
    } as Inventory;

    it('should throw NotFoundException when user not found', async () => {
      const purchaseDto: BulkPurchaseDto = {
        user_id: 'nonexistent-user',
        items: [],
      };

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((callback: any) =>
        callback(mockManager),
      );

      await expect(service.processBulkPurchase(purchaseDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.processBulkPurchase(purchaseDto)).rejects.toThrow(
        '找不到 ID 為 nonexistent-user 的使用者',
      );
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      const purchaseDto: BulkPurchaseDto = {
        user_id: 'user-1',
        items: [
          {
            pharmacy_id: 'nonexistent-pharmacy',
            mask_type_id: 'mask-1',
            quantity: 1,
          },
        ],
      };

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockUser) // User found
          .mockResolvedValueOnce(null), // Pharmacy not found
        save: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((callback: any) =>
        callback(mockManager),
      );

      await expect(service.processBulkPurchase(purchaseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when user balance is insufficient', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        cash_balance: 10, // Insufficient balance
      } as User;

      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
        cash_balance: 500,
      } as Pharmacy;

      const mockMaskType = {
        mask_type_id: 'mask-1',
        brand: 'Brand A',
        color: 'Blue',
        pack_size: 50,
        display_name: 'Brand A Blue (50pcs)',
      } as MaskType;

      const mockInventory = {
        inventory_id: 'inventory-1',
        pharmacy_id: 'pharmacy-1',
        mask_type_id: 'mask-1',
        price: 25,
        quantity: 100,
      } as Inventory;

      const purchaseDto: BulkPurchaseDto = {
        user_id: 'user-1',
        items: [
          {
            pharmacy_id: 'pharmacy-1',
            mask_type_id: 'mask-1',
            quantity: 2, // Total cost: 50, but user only has 10
          },
        ],
      };

      const mockManager = {
        findOne: jest.fn().mockImplementation((entity, options) => {
          if (entity === User && options?.where?.user_id === 'user-1') {
            return Promise.resolve(mockUser);
          }
          if (
            entity === Pharmacy &&
            options?.where?.pharmacy_id === 'pharmacy-1'
          ) {
            return Promise.resolve(mockPharmacy);
          }
          if (
            entity === MaskType &&
            options?.where?.mask_type_id === 'mask-1'
          ) {
            return Promise.resolve(mockMaskType);
          }
          if (entity === Inventory) {
            return Promise.resolve(mockInventory);
          }
          return Promise.resolve(null);
        }),
        save: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      await expect(service.processBulkPurchase(purchaseDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.processBulkPurchase(purchaseDto)).rejects.toThrow(
        '使用者餘額不足，目前餘額: 10，所需金額: 50',
      );
    });

    it('should process bulk purchase transaction flow', async () => {
      // This test verifies the method can be called without throwing immediate errors
      // More comprehensive integration tests would be in e2e tests
      const purchaseDto: BulkPurchaseDto = {
        user_id: 'user-1',
        items: [
          {
            pharmacy_id: 'pharmacy-1',
            mask_type_id: 'mask-1',
            quantity: 1,
          },
        ],
      };

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockUser) // User found
          .mockResolvedValueOnce(mockPharmacy) // Pharmacy found
          .mockResolvedValueOnce(mockMaskType) // MaskType found
          .mockResolvedValueOnce(mockInventory), // Inventory found
        save: jest.fn().mockResolvedValue({}),
        update: jest.fn(),
        create: jest.fn().mockReturnValue({}),
      };

      // Reset the mock to return the specific manager for this test
      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      const result = await service.processBulkPurchase(purchaseDto);

      expect(result).toBeDefined();
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('getTopSpenders', () => {
    it('should return top spenders successfully', async () => {
      const filterDto = {
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        top_n: 5,
      };

      const mockPurchaseHistories = [
        {
          purchase_history_id: 'ph-1',
          user_id: 'user-1',
          transaction_amount: 500,
          transaction_date: new Date('2023-06-01'),
          user: {
            user_id: 'user-1',
            name: 'User One',
          },
          pharmacy: {
            pharmacy_id: 'pharmacy-1',
            name: 'Test Pharmacy',
          },
          purchaseDetails: [
            {
              purchase_detail_id: 'pd-1',
              quantity: 2,
              price: 25,
              total_price: 50,
              maskType: {
                mask_type_id: 'mask-1',
                brand: 'Brand A',
                color: 'Blue',
                pack_size: 50,
                display_name: 'Brand A Blue (50pcs)',
              },
            },
          ],
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockPurchaseHistories);

      const result = await service.getTopSpenders(filterDto);

      expect(
        mockPurchaseHistoryRepository.createQueryBuilder,
      ).toHaveBeenCalledWith('ph');
      expect(result).toEqual({
        date_range: {
          start_date: '2023-01-01',
          end_date: '2023-12-31',
        },
        top_n: 5,
        actual_count: 1,
        top_spenders: expect.arrayContaining([
          expect.objectContaining({
            user_id: 'user-1',
            name: 'User One',
            total_spending: 500,
            total_transactions: 1,
          }),
        ]),
      });
    });

    it('should throw BadRequestException when start_date >= end_date', async () => {
      const filterDto = {
        start_date: '2023-12-31',
        end_date: '2023-01-01', // End date before start date
        top_n: 5,
      };

      await expect(service.getTopSpenders(filterDto)).rejects.toThrow(
        '開始日期必須早於結束日期',
      );
    });

    it('should handle end date without time correctly', async () => {
      const filterDto = {
        start_date: '2023-01-01',
        end_date: '2023-01-01', // Same date, should set end time to 23:59:59.999
        top_n: 5,
      };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getTopSpenders(filterDto);

      // Should not throw error and should process correctly
      expect(
        mockPurchaseHistoryRepository.createQueryBuilder,
      ).toHaveBeenCalled();
    });
  });

  describe('updateUserBalance', () => {
    it('should update user balance successfully', async () => {
      const updateDto = {
        user_id: 'user-1',
        new_balance: 1500,
      };
      const adminId = 'admin-1';

      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        cash_balance: 1000,
      } as User;

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      const result = await service.updateUserBalance(updateDto, adminId);

      expect(mockManager.findOne).toHaveBeenCalledWith(User, {
        where: { user_id: 'user-1' },
      });
      expect(mockManager.update).toHaveBeenCalledWith(
        User,
        { user_id: 'user-1' },
        { cash_balance: 1500 },
      );
      expect(result).toEqual({
        user_id: 'user-1',
        user_name: 'Test User',
        previous_balance: 1000,
        new_balance: 1500,
        balance_change: 500,
        updated_at: expect.any(Date),
        updated_by: adminId,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateDto = {
        user_id: 'nonexistent-user',
        new_balance: 1500,
      };
      const adminId = 'admin-1';

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      await expect(
        service.updateUserBalance(updateDto, adminId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateUserBalance(updateDto, adminId),
      ).rejects.toThrow('找不到 ID 為 nonexistent-user 的使用者');
    });
  });

  describe('updateInventory', () => {
    it('should update inventory successfully', async () => {
      const updateDto = {
        pharmacy_id: 'pharmacy-1',
        mask_type_id: 'mask-1',
        new_quantity: 150,
      };

      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
      } as Pharmacy;

      const mockMaskType = {
        mask_type_id: 'mask-1',
        display_name: 'Brand A Blue (50pcs)',
      } as MaskType;

      const mockInventory = {
        inventory_id: 'inventory-1',
        quantity: 100,
      } as Inventory;

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockPharmacy)
          .mockResolvedValueOnce(mockMaskType)
          .mockResolvedValueOnce(mockInventory),
        update: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      const result = await service.updateInventory(updateDto);

      expect(result).toEqual({
        pharmacy_id: 'pharmacy-1',
        pharmacy_name: 'Test Pharmacy',
        mask_type_id: 'mask-1',
        mask_display_name: 'Brand A Blue (50pcs)',
        previous_quantity: 100,
        new_quantity: 150,
        quantity_change: 50,
        updated_at: expect.any(Date),
      });
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      const updateDto = {
        pharmacy_id: 'nonexistent-pharmacy',
        mask_type_id: 'mask-1',
        new_quantity: 150,
      };

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      await expect(service.updateInventory(updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateInventory(updateDto)).rejects.toThrow(
        '找不到 ID 為 nonexistent-pharmacy 的藥局',
      );
    });

    it('should throw NotFoundException when inventory not found', async () => {
      const updateDto = {
        pharmacy_id: 'pharmacy-1',
        mask_type_id: 'mask-1',
        new_quantity: 150,
      };

      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
      } as Pharmacy;

      const mockMaskType = {
        mask_type_id: 'mask-1',
        display_name: 'Brand A Blue (50pcs)',
      } as MaskType;

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockPharmacy) // First call - pharmacy found
          .mockResolvedValueOnce(mockMaskType) // Second call - mask type found
          .mockResolvedValueOnce(null), // Third call - inventory not found
        update: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      await expect(service.updateInventory(updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateInventory(updateDto)).rejects.toThrow(
        `找不到 ID 為 ${updateDto.pharmacy_id} 的藥局`,
      );
    });
  });

  describe('bulkUpsertMaskProducts', () => {
    it('should create new mask products successfully', async () => {
      const upsertDto = {
        pharmacy_id: 'pharmacy-1',
        products: [
          {
            brand: 'New Brand',
            color: 'Red',
            pack_size: 30,
            display_name: 'New Brand Red (30pcs)',
            price: 20,
            quantity: 200,
          },
        ],
      };

      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
      } as Pharmacy;

      const mockNewMaskType = {
        mask_type_id: 'new-mask-1',
        brand: 'New Brand',
        color: 'Red',
        pack_size: 30,
        display_name: 'New Brand Red (30pcs)',
      } as MaskType;

      const mockNewInventory = {
        inventory_id: 'new-inventory-1',
        pharmacy_id: 'pharmacy-1',
        mask_type_id: 'new-mask-1',
        price: 20,
        quantity: 200,
      } as Inventory;

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockPharmacy) // Pharmacy found
          .mockResolvedValueOnce(null) // MaskType not found (new)
          .mockResolvedValueOnce(null), // Inventory not found (new)
        save: jest
          .fn()
          .mockResolvedValueOnce(mockNewMaskType)
          .mockResolvedValueOnce(mockNewInventory),
        create: jest
          .fn()
          .mockReturnValueOnce(mockNewMaskType)
          .mockReturnValueOnce(mockNewInventory),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      const result = await service.bulkUpsertMaskProducts(upsertDto);

      expect(result.pharmacy_id).toBe('pharmacy-1');
      expect(result.created_count).toBe(1);
      expect(result.updated_count).toBe(0);
      expect(result.processed_products).toHaveLength(1);
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      const upsertDto = {
        pharmacy_id: 'nonexistent-pharmacy',
        products: [],
      };

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
        create: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      await expect(service.bulkUpsertMaskProducts(upsertDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.bulkUpsertMaskProducts(upsertDto)).rejects.toThrow(
        '找不到 ID 為 nonexistent-pharmacy 的藥局',
      );
    });

    it('should throw NotFoundException when provided mask_type_id is not found', async () => {
      const upsertDto = {
        pharmacy_id: 'pharmacy-1',
        products: [
          {
            mask_type_id: 'nonexistent-mask',
            brand: 'Brand A',
            color: 'Blue',
            pack_size: 50,
            display_name: 'Brand A Blue (50pcs)',
            price: 25,
            quantity: 100,
          },
        ],
      };

      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
      } as Pharmacy;

      const mockManager = {
        findOne: jest.fn().mockImplementation((entity, options) => {
          if (
            entity === Pharmacy &&
            options?.where?.pharmacy_id === 'pharmacy-1'
          ) {
            return Promise.resolve(mockPharmacy);
          }
          if (
            entity === MaskType &&
            options?.where?.mask_type_id === 'nonexistent-mask'
          ) {
            return Promise.resolve(null);
          }
          return Promise.resolve(null);
        }),
        save: jest.fn(),
        create: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      await expect(service.bulkUpsertMaskProducts(upsertDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.bulkUpsertMaskProducts(upsertDto)).rejects.toThrow(
        '找不到 ID 為 nonexistent-mask 的口罩類型',
      );
    });

    it('should update existing mask type when mask_type_id is provided and found', async () => {
      const upsertDto = {
        pharmacy_id: 'pharmacy-1',
        products: [
          {
            mask_type_id: 'mask-1',
            brand: 'Updated Brand',
            color: 'Updated Color',
            pack_size: 60,
            display_name: 'Updated Brand Updated Color (60pcs)',
            price: 30,
            quantity: 150,
          },
        ],
      };

      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
      } as Pharmacy;

      const mockExistingMaskType = {
        mask_type_id: 'mask-1',
        brand: 'Old Brand',
        color: 'Old Color',
        pack_size: 50,
        display_name: 'Old Brand Old Color (50pcs)',
      } as MaskType;

      const mockExistingInventory = {
        inventory_id: 'inventory-1',
        pharmacy_id: 'pharmacy-1',
        mask_type_id: 'mask-1',
        price: 20,
        quantity: 100,
      } as Inventory;

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockPharmacy) // Pharmacy found
          .mockResolvedValueOnce(mockExistingMaskType) // MaskType found
          .mockResolvedValueOnce(mockExistingInventory), // Inventory found
        save: jest.fn(),
        create: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      const result = await service.bulkUpsertMaskProducts(upsertDto);

      expect(result.created_count).toBe(0);
      expect(result.updated_count).toBe(1);
      expect(mockManager.save).toHaveBeenCalledWith(
        MaskType,
        expect.objectContaining({
          brand: 'Updated Brand',
          color: 'Updated Color',
          pack_size: 60,
          display_name: 'Updated Brand Updated Color (60pcs)',
        }),
      );
    });

    it('should update existing mask type by brand, color, pack_size when mask exists', async () => {
      const upsertDto = {
        pharmacy_id: 'pharmacy-1',
        products: [
          {
            brand: 'Existing Brand',
            color: 'Existing Color',
            pack_size: 50,
            display_name: 'Updated Display Name',
            price: 25,
            quantity: 100,
          },
        ],
      };

      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
      } as Pharmacy;

      const mockExistingMaskType = {
        mask_type_id: 'mask-1',
        brand: 'Existing Brand',
        color: 'Existing Color',
        pack_size: 50,
        display_name: 'Old Display Name',
      } as MaskType;

      const mockExistingInventory = {
        inventory_id: 'inventory-1',
        pharmacy_id: 'pharmacy-1',
        mask_type_id: 'mask-1',
        price: 20,
        quantity: 80,
      } as Inventory;

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockPharmacy) // Pharmacy found
          .mockResolvedValueOnce(mockExistingMaskType) // MaskType found by brand, color, pack_size
          .mockResolvedValueOnce(mockExistingInventory), // Inventory found
        save: jest.fn(),
        create: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      const result = await service.bulkUpsertMaskProducts(upsertDto);

      expect(result.created_count).toBe(0);
      expect(result.updated_count).toBe(1);
      expect(mockManager.save).toHaveBeenCalledWith(
        MaskType,
        expect.objectContaining({
          display_name: 'Updated Display Name',
        }),
      );
    });

    it('should create new inventory when mask type exists but inventory does not', async () => {
      const upsertDto = {
        pharmacy_id: 'pharmacy-1',
        products: [
          {
            brand: 'Existing Brand',
            color: 'Existing Color',
            pack_size: 50,
            display_name: 'Existing Brand Existing Color (50pcs)',
            price: 25,
            quantity: 100,
          },
        ],
      };

      const mockPharmacy = {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
      } as Pharmacy;

      const mockExistingMaskType = {
        mask_type_id: 'mask-1',
        brand: 'Existing Brand',
        color: 'Existing Color',
        pack_size: 50,
        display_name: 'Existing Brand Existing Color (50pcs)',
      } as MaskType;

      const mockNewInventory = {
        inventory_id: 'inventory-1',
        pharmacy_id: 'pharmacy-1',
        mask_type_id: 'mask-1',
        price: 25,
        quantity: 100,
      } as Inventory;

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockPharmacy) // Pharmacy found
          .mockResolvedValueOnce(mockExistingMaskType) // MaskType found by brand, color, pack_size
          .mockResolvedValueOnce(null), // Inventory not found (create new)
        save: jest.fn().mockResolvedValue(mockNewInventory),
        create: jest.fn().mockReturnValue(mockNewInventory),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      const result = await service.bulkUpsertMaskProducts(upsertDto);

      expect(result.created_count).toBe(1);
      expect(result.updated_count).toBe(0);
      expect(mockManager.create).toHaveBeenCalledWith(
        Inventory,
        expect.objectContaining({
          pharmacy_id: 'pharmacy-1',
          mask_type_id: 'mask-1',
          price: 25,
          quantity: 100,
        }),
      );
    });
  });

  describe('cancelTransaction', () => {
    const mockPurchaseHistory = {
      purchase_history_id: 'purchase-1',
      user_id: 'user-1',
      pharmacy_id: 'pharmacy-1',
      transaction_amount: 100,
      transaction_date: new Date(),
      status: TransactionStatus.DONE,
      user: {
        user_id: 'user-1',
        name: 'Test User',
        cash_balance: 500,
        purchaseHistories: [],
      } as User,
      pharmacy: {
        pharmacy_id: 'pharmacy-1',
        name: 'Test Pharmacy',
        cash_balance: 1000,
        opening_hours: '9:00-18:00',
        inventories: [],
        pharmacyHours: [],
        purchaseHistories: [],
      } as Pharmacy,
      purchaseDetails: [],
    } as PurchaseHistory;

    it('should throw NotFoundException when user not found', async () => {
      const cancelDto: CancelTransactionDto = {
        user_id: 'nonexistent-user',
        purchase_history_id: 'purchase-1',
      };

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      };

      mockDataSource.transaction.mockImplementation((callback: any) =>
        callback(mockManager),
      );

      await expect(service.cancelTransaction(cancelDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.cancelTransaction(cancelDto)).rejects.toThrow(
        '找不到 ID 為 nonexistent-user 的使用者',
      );
    });

    it('should process cancel transaction flow', async () => {
      // This test verifies the method can be called without throwing immediate errors
      // More comprehensive integration tests would be in e2e tests
      const cancelDto: CancelTransactionDto = {
        user_id: 'user-1',
        purchase_history_id: 'purchase-1',
      };

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockPurchaseHistory.user) // Return user first
          .mockResolvedValueOnce(mockPurchaseHistory), // Then return purchase history
        update: jest.fn(),
      };

      // Reset the mock to return the specific manager for this test
      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      const result = await service.cancelTransaction(cancelDto);

      expect(result).toBeDefined();
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('should create new inventory when original inventory not found during cancellation', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        cash_balance: 500,
      } as User;

      const mockPurchaseHistory = {
        purchase_history_id: 'purchase-1',
        user_id: 'user-1',
        pharmacy_id: 'pharmacy-1',
        transaction_amount: 100,
        transaction_date: new Date(),
        status: TransactionStatus.DONE,
        user: mockUser,
        pharmacy: {
          pharmacy_id: 'pharmacy-1',
          name: 'Test Pharmacy',
          cash_balance: 1000,
        },
        purchaseDetails: [
          {
            mask_type_id: 'mask-1',
            quantity: 2,
            price: 25,
            total_price: 50,
            maskType: {
              mask_type_id: 'mask-1',
              display_name: 'Test Mask',
            },
          },
        ],
      } as PurchaseHistory;

      const cancelDto: CancelTransactionDto = {
        user_id: 'user-1',
        purchase_history_id: 'purchase-1',
      };

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockUser) // User found
          .mockResolvedValueOnce(mockPurchaseHistory) // Purchase history found
          .mockResolvedValueOnce(null), // Inventory not found (will create new)
        update: jest.fn(),
        save: jest.fn(),
        create: jest.fn().mockReturnValue({}),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      const result = await service.cancelTransaction(cancelDto);

      expect(result).toBeDefined();
      expect(mockManager.create).toHaveBeenCalledWith(
        Inventory,
        expect.objectContaining({
          pharmacy_id: 'pharmacy-1',
          mask_type_id: 'mask-1',
          price: 25,
          quantity: 2,
        }),
      );
    });

    it('should update existing inventory when found during cancellation', async () => {
      const mockUser = {
        user_id: 'user-1',
        name: 'Test User',
        cash_balance: 500,
      } as User;

      const mockInventory = {
        inventory_id: 'inventory-1',
        quantity: 50,
      } as Inventory;

      const mockPurchaseHistory = {
        purchase_history_id: 'purchase-1',
        user_id: 'user-1',
        pharmacy_id: 'pharmacy-1',
        transaction_amount: 100,
        transaction_date: new Date(),
        status: TransactionStatus.DONE,
        user: mockUser,
        pharmacy: {
          pharmacy_id: 'pharmacy-1',
          name: 'Test Pharmacy',
          cash_balance: 1000,
        },
        purchaseDetails: [
          {
            mask_type_id: 'mask-1',
            quantity: 2,
            price: 25,
            total_price: 50,
            maskType: {
              mask_type_id: 'mask-1',
              display_name: 'Test Mask',
            },
          },
        ],
      } as PurchaseHistory;

      const cancelDto: CancelTransactionDto = {
        user_id: 'user-1',
        purchase_history_id: 'purchase-1',
      };

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(mockUser) // User found
          .mockResolvedValueOnce(mockPurchaseHistory) // Purchase history found
          .mockResolvedValueOnce(mockInventory), // Inventory found
        update: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
      };

      mockDataSource.transaction = jest
        .fn()
        .mockImplementation((callback: any) => callback(mockManager));

      const result = await service.cancelTransaction(cancelDto);

      expect(result).toBeDefined();
      expect(mockManager.update).toHaveBeenCalledWith(
        Inventory,
        { inventory_id: 'inventory-1' },
        { quantity: 52 }, // 50 + 2 returned quantity
      );
    });
  });

  describe('searchPharmaciesAndMasks', () => {
    it('should search pharmacies and masks with default parameters', async () => {
      const searchDto: SearchRequestDto = {
        query: 'test',
      };

      // Mock private methods through service instance
      jest.spyOn(service as any, 'searchPharmacies').mockResolvedValue([
        {
          type: SearchType.PHARMACY,
          id: 'pharmacy-1',
          name: 'Test Pharmacy',
          relevance: 0.8,
          data: {},
        },
      ]);

      jest.spyOn(service as any, 'searchMasks').mockResolvedValue([
        {
          type: SearchType.MASK,
          id: 'mask-1',
          name: 'Test Mask',
          relevance: 0.6,
          data: {},
        },
      ]);

      const result = await service.searchPharmaciesAndMasks(searchDto);

      expect(result.results).toHaveLength(2);
      expect(result.results[0].relevance).toBe(0.8); // Should be sorted by relevance
      expect(result.query).toBe('test');
      expect(result.search_type).toBe(SearchType.ALL);
    });

    it('should search only pharmacies when type is PHARMACY', async () => {
      const searchDto: SearchRequestDto = {
        query: 'test',
        type: SearchType.PHARMACY,
      };

      jest.spyOn(service as any, 'searchPharmacies').mockResolvedValue([
        {
          type: SearchType.PHARMACY,
          id: 'pharmacy-1',
          name: 'Test Pharmacy',
          relevance: 0.8,
          data: {},
        },
      ]);

      jest.spyOn(service as any, 'searchMasks').mockResolvedValue([]);

      const result = await service.searchPharmaciesAndMasks(searchDto);

      expect(service['searchPharmacies']).toHaveBeenCalled();
      expect(service['searchMasks']).not.toHaveBeenCalled();
      expect(result.search_type).toBe(SearchType.PHARMACY);
    });
  });

  describe('calculateRelevance (private method)', () => {
    it('should return 1.0 for exact match', () => {
      const relevance = service['calculateRelevance']('test', 'test');
      expect(relevance).toBe(1.0);
    });

    it('should return 0.8 for prefix match', () => {
      const relevance = service['calculateRelevance']('test', 'testing');
      expect(relevance).toBe(0.8);
    });

    it('should return 0.6 for contains match', () => {
      const relevance = service['calculateRelevance']('test', 'my test string');
      expect(relevance).toBe(0.6);
    });

    it('should return 0 for no match', () => {
      const relevance = service['calculateRelevance'](
        'test',
        'completely different',
      );
      expect(relevance).toBe(0);
    });

    it('should return 0 for empty target name', () => {
      const relevance = service['calculateRelevance']('test', '');
      expect(relevance).toBe(0);
    });
  });

  describe('levenshteinDistance (private method)', () => {
    it('should calculate correct distance for identical strings', () => {
      const distance = service['levenshteinDistance']('test', 'test');
      expect(distance).toBe(0);
    });

    it('should calculate correct distance for different strings', () => {
      const distance = service['levenshteinDistance']('kitten', 'sitting');
      expect(distance).toBe(3);
    });

    it('should calculate correct distance for empty strings', () => {
      const distance = service['levenshteinDistance']('', 'test');
      expect(distance).toBe(4);
    });
  });
});
