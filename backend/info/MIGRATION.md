# Migration 使用指南

本專案使用 TypeORM Migration 來管理資料庫結構變更，並整合外部 SQL 檔案來執行資料庫初始化。

## 專案架構

- `backend/src/migrations/` - Migration 檔案目錄
- `extratDB/sql/` - 外部 SQL 腳本目錄
- `backend/src/migrations/sql-file-utils.ts` - SQL 檔案執行工具

## Migration 檔案說明

### 1. InitialMigration (1758872998293-InitialMigration.ts)
- **用途**: 建立所有資料表結構（SERIAL 主鍵版本）
- **執行**: 讀取並執行 `extratDB/sql/init_all_tables.sql`
- **回復**: 按相依性順序刪除所有資料表

### 2. SeedInitialData (1758873862223-SeedInitialData.ts)  
- **用途**: 插入初始資料（SERIAL 主鍵版本）
- **執行順序**: 根據 `extratDB/sql/README.md` 的建議依序執行
- **總計**: 約 482 筆記錄
- **回復**: 清除所有資料並重置序列

### 3. ConvertToUUID (1758874771038-ConvertToUUID.ts)
- **用途**: 將所有主鍵和外鍵從 SERIAL 轉換為 UUID
- **執行內容**:
  - 啟用 PostgreSQL 的 `uuid-ossp` 擴展
  - 備份現有資料到臨時表格
  - 移除所有外鍵約束
  - 將主鍵和外鍵欄位轉換為 UUID 類型
  - 重新建立外鍵約束
  - 清理臨時表格
- **注意**: 執行後所有資料會被清空，需要重新執行資料插入
- **回復**: 將 UUID 主鍵回復為 SERIAL 類型

### 4. SeedUUIDData (1758874840474-SeedUUIDData.ts)
- **用途**: 插入 UUID 版本的初始資料
- **特殊處理**:
  - `weekdays` 使用固定的 UUID 對應（便於參照）
  - 其他基礎表使用 `uuid_generate_v4()` 生成新 UUID
  - 外鍵表使用子查詢來關聯正確的 UUID
- **總計**: 約 482 筆記錄（UUID 版本）
- **回復**: 清除所有 UUID 版本資料

## 環境設定

1. 複製 `.env.example` 為 `.env` 並設定您的資料庫連接參數：
   ```bash
   cp .env.example .env
   ```

2. 修改 `.env` 檔案中的資料庫連接設定。

## Migration 常用命令

### 查看 Migration 狀態
```bash
npm run migration:show
```

### 執行 Migration（將未執行的 migration 套用到資料庫）
```bash
npm run migration:run
```

### 回復最後一次 Migration
```bash
npm run migration:revert
```

### 建立新的空白 Migration
```bash
npm run migration:create -- src/migrations/YourMigrationName
```

### 自動產生 Migration（基於 Entity 變更）
```bash
npm run migration:generate -- src/migrations/YourMigrationName
```

## 完整部署流程

### 新環境初始化

#### 選項 1: SERIAL 主鍵版本（傳統方式）
1. **確保資料庫已建立**: 建立空的 PostgreSQL 資料庫
2. **設定環境變數**: 複製並編輯 `.env` 檔案
3. **執行前兩個 Migration**: 
   ```bash
   npm run migration:run
   ```
   這將會執行 `InitialMigration` 和 `SeedInitialData`，使用傳統的 SERIAL 主鍵

#### 選項 2: UUID 主鍵版本（推薦）
1. **確保資料庫已建立**: 建立空的 PostgreSQL 資料庫
2. **設定環境變數**: 複製並編輯 `.env` 檔案
3. **執行所有 Migration**: 
   ```bash
   npm run migration:run
   ```
   這將會執行：
   - `InitialMigration` 建立資料表（SERIAL）
   - `SeedInitialData` 插入初始資料（SERIAL）
   - `ConvertToUUID` 轉換為 UUID 格式
   - `SeedUUIDData` 插入 UUID 版本資料

### 從 SERIAL 轉換到 UUID

如果您已經有使用 SERIAL 主鍵的現有資料庫：

1. **備份資料庫**（重要！）
2. **執行 UUID 轉換**:
   ```bash
   npm run migration:run  # 這會執行 ConvertToUUID Migration
   ```
3. **重新插入資料**:
   ```bash
   npm run migration:run  # 這會執行 SeedUUIDData Migration
   ```

### 開發期間
- 當您修改 Entity 時，使用 `migration:generate` 產生新的 migration
- 定期執行 `npm run migration:run` 來同步資料庫結構

### 生產環境部署
1. 執行 `npm run migration:show` 檢查待執行的 migration
2. 備份現有資料庫
3. 執行 `npm run migration:run` 來更新生產環境資料庫

## 回復操作

如果需要回復 migration：

```bash
# 回復最後一次 migration
npm run migration:revert

# 回復到初始狀態（清除所有資料）
npm run migration:revert  # 回復 SeedInitialData
npm run migration:revert  # 回復 InitialMigration
```

## SQL 檔案整合

### SqlFileUtils 工具
本專案包含一個 `SqlFileUtils` 工具類別，提供：
- 讀取外部 SQL 檔案
- 智能分割 SQL 語句（處理字串內的分號）
- 執行 SQL 檔案內容
- 自動路徑解析

### 新增 SQL 檔案
如需新增 SQL 檔案：
1. 將檔案放置在 `extratDB/sql/` 目錄
2. 在 Migration 中使用 `SqlFileUtils.executeSqlFile()` 執行
3. 確保按照相依性順序執行

## 注意事項

- Migration 檔案一旦執行過就不應該再修改
- 在生產環境執行 migration 前請先備份資料庫
- SQL 檔案路徑是相對於 Migration 檔案位置計算的
- 每次 Entity 變更後都應該產生對應的 migration
- Migration 檔案的命名應該要有意義且按時間順序排列

## 故障排除

### Migration 錯誤
1. 檢查資料庫連線設定是否正確
2. 確認資料庫使用者有足夠權限
3. 查看 migration 檔案中的 SQL 語法是否正確
4. 如需回復，使用 `npm run migration:revert`

### SQL 檔案錯誤
1. 檢查 SQL 檔案路徑是否正確
2. 確認 SQL 語法是否正確
3. 注意檔案編碼（建議使用 UTF-8）
4. 檢查外鍵相依性是否正確

### 測試工具
使用測試腳本驗證設定：
```bash
npx ts-node src/test-sql-paths.ts  # 測試 SQL 檔案路徑
npx ts-node src/test-db-connection.ts  # 測試資料庫連接
```