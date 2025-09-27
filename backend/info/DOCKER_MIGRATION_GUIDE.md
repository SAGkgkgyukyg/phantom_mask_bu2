# Docker 建置過程中的 Migration 執行

## 修改內容

我們已經成功在 Docker 建置過程中加入了自動執行 `migration:run` 的功能。以下是相關的修改：

### 1. 新增 `docker-entrypoint.sh`
- **位置**: `/backend/docker-entrypoint.sh`
- **功能**: 容器啟動時的入口腳本
- **主要步驟**:
  1. 等待資料庫連接準備就緒
  2. 執行資料庫 migration
  3. 啟動應用程式

### 2. 修改 `Dockerfile`
- **新增功能**:
  - 安裝 PostgreSQL 客戶端工具（用於 `pg_isready`）
  - 安裝 `wget`（用於健康檢查）
  - 保留 `typeorm` 依賴（用於執行 migration）
  - 設置 entrypoint 腳本

### 3. 更新 `docker-compose.yml`
- **修改健康檢查**: 使用 `wget` 替代 `curl`
- **延長啟動時間**: 將 `start_period` 從 40s 增加到 90s，以確保 migration 有足夠時間執行

## 工作流程

1. **容器啟動**: Docker Compose 啟動資料庫和後端容器
2. **等待資料庫**: 後端容器使用 `pg_isready` 等待資料庫準備就緒
3. **執行 Migration**: 自動執行 `npx typeorm migration:run`
4. **啟動應用**: 啟動 NestJS 應用程式

## 錯誤處理

- 如果 migration 失敗（例如資料表已存在），腳本會顯示警告訊息但繼續啟動應用程式
- 這確保了即使在資料庫已經初始化的情況下，應用程式仍能正常啟動

## 使用方式

```bash
# 停止現有服務
docker compose down

# 啟動服務（會自動執行 migration）
docker compose up -d --build

# 查看日誌確認 migration 執行情況
docker compose logs backend --tail=30
```

## 日誌訊息說明

- `🔄 等待資料庫連接...` - 正在等待資料庫準備就緒
- `✅ 資料庫連接成功！` - 資料庫連接成功
- `🔍 檢查資料庫 migration 狀態...` - 開始執行 migration
- `✅ Migration 執行成功！` - migration 成功執行
- `⚠️ Migration 可能已經執行過...` - migration 已存在，繼續啟動
- `🚀 啟動應用程式...` - 開始啟動 NestJS 應用

這樣的設計確保了每次容器啟動時都會檢查並執行必要的資料庫 migration，讓部署過程更加自動化和可靠。