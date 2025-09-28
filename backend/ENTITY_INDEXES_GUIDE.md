# Entity 索引配置說明

## 📋 概述

所有的效能索引現在都已經透過 TypeORM 的 `@Index` decorator 直接在實體中定義。這些索引會在執行 `npm run migration:run` 或資料庫同步時自動建立。

## 🏗️ 已配置的索引

### 1. Pharmacy Entity
```typescript
// 基本索引
- idx_pharmacies_name: 藥局名稱索引

// 需要手動建立的特殊索引
- idx_pharmacies_name_lower: CREATE INDEX idx_pharmacies_name_lower ON pharmacies (LOWER(name))
```

### 2. MaskType Entity
```typescript
// 基本索引
- idx_mask_types_brand: 品牌索引
- idx_mask_types_color: 顏色索引  
- idx_mask_types_display_name: 顯示名稱索引

// 複合索引
- idx_mask_types_brand_color: 品牌和顏色複合索引

// 需要手動建立的特殊索引
- idx_mask_types_search_lower: CREATE INDEX idx_mask_types_search_lower ON mask_types (LOWER(brand), LOWER(color), LOWER(display_name))
```

### 3. Inventory Entity
```typescript
// 基本索引
- idx_inventory_pharmacy_id: 藥局 ID 索引
- idx_inventory_mask_type_id: 口罩類型 ID 索引
- idx_inventory_price: 價格索引
- idx_inventory_quantity: 數量索引

// 複合索引
- idx_inventory_pharmacy_mask: 藥局和口罩類型複合索引
- idx_inventory_price_quantity: 價格和數量複合索引
- idx_inventory_complete: 完整複合索引 (pharmacy_id, mask_type_id, quantity, price)

// 需要手動建立的特殊索引
- idx_inventory_active: CREATE INDEX idx_inventory_active ON inventory (pharmacy_id, mask_type_id) WHERE quantity > 0
```

### 4. PurchaseHistory Entity
```typescript
// 基本索引
- idx_purchase_histories_user_id: 使用者 ID 索引
- idx_purchase_histories_pharmacy_id: 藥局 ID 索引
- idx_purchase_histories_amount: 交易金額索引
- idx_purchase_histories_transaction_date: 交易日期索引
- idx_purchase_histories_status: 狀態索引

// 複合索引
- idx_purchase_histories_date_user: 日期、使用者、狀態複合索引
- idx_purchase_histories_user_date: 使用者和日期複合索引
- idx_purchase_analysis: 完整分析複合索引
```

### 5. PurchaseDetail Entity
```typescript
// 基本索引
- idx_purchase_details_history_id: 購買歷史 ID 索引
- idx_purchase_details_mask_type_id: 口罩類型 ID 索引

// 複合索引
- idx_purchase_details_history_mask: 歷史和口罩類型複合索引
- idx_purchase_details_quantity_price: 數量和總價複合索引
```

### 6. PharmacyHour Entity
```typescript
// 基本索引
- idx_pharmacy_hours_pharmacy_id: 藥局 ID 索引
- idx_pharmacy_hours_weekday_id: 星期 ID 索引
- idx_pharmacy_hours_open_time: 開門時間索引
- idx_pharmacy_hours_close_time: 關門時間索引
- idx_pharmacy_hours_overnight: 跨夜營業索引

// 複合索引
- idx_pharmacy_hours_pharmacy_weekday: 藥局和星期複合索引
- idx_pharmacy_hours_weekday_time: 星期和時間複合索引
- idx_pharmacy_hours_schedule: 完整排程複合索引
```

### 7. User Entity
```typescript
// 基本索引
- idx_users_name: 姓名索引（用於搜尋功能）
- idx_users_cash_balance: 現金餘額索引（用於分析）
```

### 8. Weekday Entity
```typescript
// 基本索引
- idx_weekdays_name: 星期名稱索引
- idx_weekdays_short_name: 星期縮寫索引
```

## 🔧 部署步驟

### 1. 自動建立的索引
執行以下命令，大部分索引會自動建立：
```bash
npm run migration:generate -- --name AddEntityIndexes
npm run migration:run
```

### 2. 手動建立的特殊索引
某些索引需要手動建立（主要是使用函數的索引）：

```sql
-- 藥局名稱搜尋索引
CREATE INDEX idx_pharmacies_name_lower ON pharmacies (LOWER(name));

-- 口罩搜尋索引
CREATE INDEX idx_mask_types_search_lower ON mask_types (LOWER(brand), LOWER(color), LOWER(display_name));

-- 有庫存的存貨索引
CREATE INDEX idx_inventory_active ON inventory (pharmacy_id, mask_type_id) WHERE quantity > 0;

-- PostgreSQL 全文搜尋索引（可選，效能更佳）
CREATE INDEX idx_pharmacies_fulltext ON pharmacies USING gin (to_tsvector('english', name));
CREATE INDEX idx_masks_fulltext ON mask_types USING gin (to_tsvector('english', brand || ' ' || color || ' ' || display_name));
```

## 📊 索引效能說明

### 搜尋功能優化
- `LOWER()` 索引支援不分大小寫的搜尋
- 複合索引減少多表 JOIN 查詢的成本
- 部分索引 `WHERE quantity > 0` 只索引有庫存的商品

### 查詢優化
- 日期範圍查詢：`idx_purchase_histories_transaction_date`
- 使用者消費分析：`idx_purchase_analysis`
- 營業時間篩選：`idx_pharmacy_hours_schedule`
- 價格範圍篩選：`idx_inventory_price_quantity`

## ⚠️ 注意事項

1. **索引維護成本**：每次 INSERT/UPDATE/DELETE 都會影響索引效能
2. **磁碟空間**：索引會占用額外的儲存空間
3. **查詢計畫**：定期使用 `EXPLAIN ANALYZE` 檢查查詢是否使用到索引
4. **索引統計**：定期執行 `ANALYZE` 更新資料庫統計資訊

## 🔍 監控和調優

### 檢查索引使用率
```sql
-- PostgreSQL 查看索引使用統計
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 查看未使用的索引
```sql
-- 找出很少使用的索引
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan < 10
ORDER BY idx_scan;
```

## 🚀 效能預期

實作這些索引後，預期的效能提升：

- **搜尋功能**：50-80% 的查詢時間減少
- **分頁查詢**：60-90% 的查詢時間減少  
- **日期範圍查詢**：70-95% 的查詢時間減少
- **外鍵 JOIN**：40-70% 的查詢時間減少
- **複雜篩選**：50-85% 的查詢時間減少