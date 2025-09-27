import { QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 使用 /data 資料夾中原始的 JSON 檔案來插入資料
 * 這些原始檔案包含了 pharmacies.json 和 users.json
 */
export class NormalizedJsonSeeder {
  /**
   * 從原始的 JSON 檔案中載入並插入所有資料
   */
  public static async seedFromNormalizedJson(
    queryRunner: QueryRunner,
  ): Promise<void> {
    console.log('🌱 開始從原始 JSON 檔案插入資料...');

    const dataPath = path.resolve(__dirname, '../../extractDB/data');

    try {
      // 儲存 ID 映射
      const pharmacyIdMap = new Map<string, string>(); // 原始名稱 -> UUID
      const userIdMap = new Map<string, string>(); // 原始名稱 -> UUID
      const maskTypeIdMap = new Map<string, string>(); // 面具名稱 -> UUID

      // 1. 插入 weekdays (必須先插入，因為其他表會參照)
      await this.insertWeekdays(queryRunner);

      // 2. 讀取並處理 pharmacies.json
      const pharmaciesData = this.loadPharmaciesData(dataPath);

      // 3. 建立所有獨特的口罩類型
      const uniqueMasks = this.extractUniqueMaskTypes(pharmaciesData);
      await this.insertMaskTypes(queryRunner, uniqueMasks, maskTypeIdMap);

      // 4. 插入 pharmacies
      await this.insertPharmacies(queryRunner, pharmaciesData, pharmacyIdMap);

      // 5. 插入 pharmacy_hours
      await this.insertPharmacyHours(
        queryRunner,
        pharmaciesData,
        pharmacyIdMap,
      );

      // 6. 插入 inventory
      await this.insertInventory(
        queryRunner,
        pharmaciesData,
        pharmacyIdMap,
        maskTypeIdMap,
      );

      // 7. 讀取並處理 users.json
      const usersData = this.loadUsersData(dataPath);

      // 8. 插入 users
      await this.insertUsers(queryRunner, usersData, userIdMap);

      // 9. 插入 purchase_histories 和 purchase_details
      await this.insertPurchaseData(
        queryRunner,
        usersData,
        userIdMap,
        pharmacyIdMap,
        maskTypeIdMap,
      );

      console.log('✅ 原始 JSON 資料插入完成！');
    } catch (error) {
      console.error('❌ 插入原始 JSON 資料時發生錯誤:', error);
      throw error;
    }
  }

  /**
   * 載入 pharmacies.json 資料
   */
  private static loadPharmaciesData(dataPath: string): any[] {
    const filePath = path.join(dataPath, 'pharmacies.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  /**
   * 載入 users.json 資料
   */
  private static loadUsersData(dataPath: string): any[] {
    const filePath = path.join(dataPath, 'users.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  /**
   * 從藥局資料中提取所有獨特的面具類型
   */
  private static extractUniqueMaskTypes(pharmaciesData: any[]): any[] {
    const maskSet = new Set<string>();
    const uniqueMasks: any[] = [];

    for (const pharmacy of pharmaciesData) {
      for (const mask of pharmacy.masks) {
        if (!maskSet.has(mask.name)) {
          maskSet.add(mask.name);

          // 解析面具名稱 "Brand (color) (X per pack)"
          const match = mask.name.match(
            /^(.+?)\s+\((.+?)\)\s+\((\d+)\s+per\s+pack\)$/,
          );
          if (match) {
            const [, brand, color, packSize] = match;
            uniqueMasks.push({
              name: mask.name,
              brand: brand.trim(),
              color: color.trim(),
              pack_size: parseInt(packSize),
              display_name: mask.name,
            });
          } else {
            console.warn(`無法解析面具名稱: ${mask.name}`);
          }
        }
      }
    }

    return uniqueMasks;
  }

  /**
   * 插入 weekdays
   */
  private static async insertWeekdays(queryRunner: QueryRunner): Promise<void> {
    console.log('插入 weekdays...');

    // 使用固定的 UUID
    const weekdays = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Monday',
        short_name: 'Mon',
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Tuesday',
        short_name: 'Tue',
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Wednesday',
        short_name: 'Wed',
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Thursday',
        short_name: 'Thur',
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Friday',
        short_name: 'Fri',
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'Saturday',
        short_name: 'Sat',
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        name: 'Sunday',
        short_name: 'Sun',
      },
    ];

    for (const weekday of weekdays) {
      await queryRunner.query(
        `
        INSERT INTO weekdays (weekday_id, name, short_name) 
        VALUES ($1, $2, $3)
        ON CONFLICT (weekday_id) DO NOTHING
      `,
        [weekday.id, weekday.name, weekday.short_name],
      );
    }

    console.log(`✓ 插入了 ${weekdays.length} 筆 weekdays 資料`);
  }

  /**
   * 插入 mask_types 並建立 ID 映射
   */
  private static async insertMaskTypes(
    queryRunner: QueryRunner,
    maskTypes: any[],
    maskTypeIdMap: Map<string, string>,
  ): Promise<void> {
    console.log('插入 mask_types...');

    for (const maskType of maskTypes) {
      const result = await queryRunner.query(
        `
        INSERT INTO mask_types (mask_type_id, brand, color, pack_size, display_name) 
        VALUES (uuid_generate_v4(), $1, $2, $3, $4)
        RETURNING mask_type_id
      `,
        [
          maskType.brand,
          maskType.color,
          maskType.pack_size.toString(),
          maskType.display_name,
        ],
      );

      maskTypeIdMap.set(maskType.name, result[0].mask_type_id);
    }

    console.log(`✓ 插入了 ${maskTypes.length} 筆 mask_types 資料`);
  }

  /**
   * 插入 pharmacies 並建立 ID 映射
   */
  private static async insertPharmacies(
    queryRunner: QueryRunner,
    pharmaciesData: any[],
    pharmacyIdMap: Map<string, string>,
  ): Promise<void> {
    console.log('插入 pharmacies...');

    for (const pharmacy of pharmaciesData) {
      const result = await queryRunner.query(
        `
        INSERT INTO pharmacies (pharmacy_id, name, cash_balance, opening_hours) 
        VALUES (uuid_generate_v4(), $1, $2, $3)
        RETURNING pharmacy_id
      `,
        [pharmacy.name, pharmacy.cashBalance, pharmacy.openingHours],
      );

      pharmacyIdMap.set(pharmacy.name, result[0].pharmacy_id);
    }

    console.log(`✓ 插入了 ${pharmaciesData.length} 筆 pharmacies 資料`);
  }

  /**
   * 解析營業時間並插入 pharmacy_hours
   */
  private static async insertPharmacyHours(
    queryRunner: QueryRunner,
    pharmaciesData: any[],
    pharmacyIdMap: Map<string, string>,
  ): Promise<void> {
    console.log('插入 pharmacy_hours...');

    const weekdayMap = {
      Mon: '11111111-1111-1111-1111-111111111111',
      Tue: '22222222-2222-2222-2222-222222222222',
      Wed: '33333333-3333-3333-3333-333333333333',
      Thur: '44444444-4444-4444-4444-444444444444',
      Fri: '55555555-5555-5555-5555-555555555555',
      Sat: '66666666-6666-6666-6666-666666666666',
      Sun: '77777777-7777-7777-7777-777777777777',
    };

    let totalHours = 0;

    for (const pharmacy of pharmaciesData) {
      const pharmacyUuid = pharmacyIdMap.get(pharmacy.name);
      if (!pharmacyUuid) continue;

      // 解析營業時間字串
      const hours = this.parseOpeningHours(pharmacy.openingHours);

      for (const hour of hours) {
        const weekdayUuid = weekdayMap[hour.day];
        if (weekdayUuid) {
          await queryRunner.query(
            `
            INSERT INTO pharmacy_hours (schedule_id, pharmacy_id, weekday_id, open_time, close_time, is_overnight)
            VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)
          `,
            [
              pharmacyUuid,
              weekdayUuid,
              hour.open_time,
              hour.close_time,
              hour.is_overnight,
            ],
          );
          totalHours++;
        }
      }
    }

    console.log(`✓ 插入了 ${totalHours} 筆 pharmacy_hours 資料`);
  }

  /**
   * 解析營業時間字串
   */
  private static parseOpeningHours(openingHours: string): any[] {
    const hours: any[] = [];

    // 拆分不同日期的時間段
    const dayTimeBlocks = openingHours.split(', ');

    for (const block of dayTimeBlocks) {
      // 匹配 "Day HH:MM - HH:MM" 格式
      const match = block.match(
        /^(\w+)\s+(\d{2}):(\d{2})\s+-\s+(\d{2}):(\d{2})$/,
      );
      if (match) {
        const [, day, openHour, openMin, closeHour, closeMin] = match;
        const openTime = `${openHour}:${openMin}:00`;
        const closeTime = `${closeHour}:${closeMin}:00`;

        // 判斷是否跨夜 (關閉時間小於開始時間 或者 開始時間晚於關閉時間)
        const isOvernight =
          parseInt(closeHour) < parseInt(openHour) ||
          (parseInt(closeHour) === 0 && parseInt(openHour) > 12) ||
          (parseInt(closeHour) <= 12 && parseInt(openHour) >= 16);

        hours.push({
          day,
          open_time: openTime,
          close_time: closeTime,
          is_overnight: isOvernight,
        });
      }
    }

    return hours;
  }

  /**
   * 插入 inventory
   */
  private static async insertInventory(
    queryRunner: QueryRunner,
    pharmaciesData: any[],
    pharmacyIdMap: Map<string, string>,
    maskTypeIdMap: Map<string, string>,
  ): Promise<void> {
    console.log('插入 inventory...');

    let totalItems = 0;

    for (const pharmacy of pharmaciesData) {
      const pharmacyUuid = pharmacyIdMap.get(pharmacy.name);
      if (!pharmacyUuid) continue;

      for (const mask of pharmacy.masks) {
        const maskTypeUuid = maskTypeIdMap.get(mask.name);
        if (maskTypeUuid) {
          await queryRunner.query(
            `
            INSERT INTO inventory (inventory_id, pharmacy_id, mask_type_id, price, quantity)
            VALUES (uuid_generate_v4(), $1, $2, $3, $4)
          `,
            [pharmacyUuid, maskTypeUuid, mask.price, mask.stockQuantity],
          );
          totalItems++;
        } else {
          console.warn(`找不到面具類型: ${mask.name}`);
        }
      }
    }

    console.log(`✓ 插入了 ${totalItems} 筆 inventory 資料`);
  }

  /**
   * 插入 users 並建立 ID 映射
   */
  private static async insertUsers(
    queryRunner: QueryRunner,
    usersData: any[],
    userIdMap: Map<string, string>,
  ): Promise<void> {
    console.log('插入 users...');

    for (const user of usersData) {
      const result = await queryRunner.query(
        `
        INSERT INTO users (user_id, name, cash_balance) 
        VALUES (uuid_generate_v4(), $1, $2)
        RETURNING user_id
      `,
        [user.name, user.cashBalance],
      );

      userIdMap.set(user.name, result[0].user_id);
    }

    console.log(`✓ 插入了 ${usersData.length} 筆 users 資料`);
  }

  /**
   * 插入購買歷史和詳情
   */
  private static async insertPurchaseData(
    queryRunner: QueryRunner,
    usersData: any[],
    userIdMap: Map<string, string>,
    pharmacyIdMap: Map<string, string>,
    maskTypeIdMap: Map<string, string>,
  ): Promise<void> {
    console.log('插入 purchase_histories 和 purchase_details...');

    let totalHistories = 0;
    let totalDetails = 0;

    for (const user of usersData) {
      const userUuid = userIdMap.get(user.name);
      if (!userUuid || !user.purchaseHistories) continue;

      for (const purchase of user.purchaseHistories) {
        const pharmacyUuid = pharmacyIdMap.get(purchase.pharmacyName);
        const maskTypeUuid = maskTypeIdMap.get(purchase.maskName);

        if (userUuid && pharmacyUuid && maskTypeUuid) {
          // 插入購買歷史
          const historyResult = await queryRunner.query(
            `
            INSERT INTO purchase_histories (purchase_history_id, user_id, pharmacy_id, transaction_amount, transaction_date)
            VALUES (uuid_generate_v4(), $1, $2, $3, $4)
            RETURNING purchase_history_id
          `,
            [
              userUuid,
              pharmacyUuid,
              purchase.transactionAmount,
              purchase.transactionDatetime,
            ],
          );

          const purchaseHistoryId = historyResult[0].purchase_history_id;
          totalHistories++;

          // 插入購買詳情 - 需要計算單價
          const unitPrice =
            purchase.transactionAmount / purchase.transactionQuantity;

          await queryRunner.query(
            `
            INSERT INTO purchase_details (purchase_detail_id, purchase_history_id, mask_type_id, quantity, price, total_price)
            VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)
          `,
            [
              purchaseHistoryId,
              maskTypeUuid,
              purchase.transactionQuantity,
              unitPrice,
              purchase.transactionAmount,
            ],
          );
          totalDetails++;
        } else {
          console.warn(
            `找不到映射: user=${user.name}, pharmacy=${purchase.pharmacyName}, mask=${purchase.maskName}`,
          );
        }
      }
    }

    console.log(`✓ 插入了 ${totalHistories} 筆 purchase_histories 資料`);
    console.log(`✓ 插入了 ${totalDetails} 筆 purchase_details 資料`);
  }
}
