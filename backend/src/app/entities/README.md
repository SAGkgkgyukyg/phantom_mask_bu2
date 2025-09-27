# TypeORM Entities

這個目錄包含了根據資料庫結構建立的 TypeORM entity 檔案，並已正確設定雙向關聯關係。

## Entity 清單

- **MaskType** (`mask-type.entity.ts`) - 口罩類型實體
- **Pharmacy** (`pharmacy.entity.ts`) - 藥局實體
- **User** (`user.entity.ts`) - 使用者實體
- **Weekday** (`weekday.entity.ts`) - 星期實體
- **Inventory** (`inventory.entity.ts`) - 庫存實體
- **PurchaseHistory** (`purchase-history.entity.ts`) - 購買紀錄實體
- **PurchaseDetail** (`purchase-detail.entity.ts`) - 購買詳細資料實體
- **PharmacyHour** (`pharmacy-hour.entity.ts`) - 藥局營業時間實體

## 關聯關係圖

## 詳細關聯說明

### MaskType 關聯：

- **OneToMany** → Inventory (`inventories`)
- **OneToMany** → PurchaseDetail (`purchaseDetails`)

### Pharmacy 關聯：

- **OneToMany** → Inventory (`inventories`)
- **OneToMany** → PurchaseHistory (`purchaseHistories`)
- **OneToMany** → PharmacyHour (`pharmacyHours`)

### User 關聯：

- **OneToMany** → PurchaseHistory (`purchaseHistories`)

### Weekday 關聯：

- **OneToMany** → PharmacyHour (`pharmacyHours`)

### PurchaseHistory 關聯：

- **ManyToOne** → User (`user`)
- **ManyToOne** → Pharmacy (`pharmacy`)
- **OneToMany** → PurchaseDetail (`purchaseDetails`)

### Inventory 關聯：

- **ManyToOne** → Pharmacy (`pharmacy`)
- **ManyToOne** → MaskType (`maskType`)

### PurchaseDetail 關聯：

- **ManyToOne** → PurchaseHistory (`purchaseHistory`)
- **ManyToOne** → MaskType (`maskType`)

### PharmacyHour 關聯：

- **ManyToOne** → Pharmacy (`pharmacy`)
- **ManyToOne** → Weekday (`weekday`)

## 資料庫結構對應

這些 entity 是根據 `/db/sql/init_all_tables.sql` 檔案中的表格結構建立，包含了：

- ✅ 主鍵 (Primary Keys)
- ✅ 外鍵關聯 (Foreign Key Relations) - 已設定雙向關聯
- ✅ 欄位型別和限制 (Column Types and Constraints)
- ✅ 索引和預設值 (Indexes and Default Values)

## 使用方式

```typescript
import {
  MaskType,
  Pharmacy,
  User,
  Weekday,
  Inventory,
  PurchaseHistory,
  PurchaseDetail,
  PharmacyHour,
} from './entities';

// 查詢時可以使用關聯
const pharmacy = await pharmacyRepository.findOne({
  where: { pharmacy_id: 1 },
  relations: ['inventories', 'purchaseHistories', 'pharmacyHours'],
});

// 透過關聯存取相關資料
console.log(pharmacy.inventories); // 該藥局的庫存
console.log(pharmacy.purchaseHistories); // 該藥局的購買紀錄
console.log(pharmacy.pharmacyHours); // 該藥局的營業時間
```

## 注意事項

- ✅ 所有的 entity 都使用 TypeORM 裝飾器進行設定
- ✅ 關聯關係已正確建立雙向連結
- ✅ 數值型別使用 `decimal` 來確保精準度
- ✅ 時間欄位使用適當的型別 (`timestamp`, `time`)
- ✅ 已通過編譯測試，無任何錯誤
