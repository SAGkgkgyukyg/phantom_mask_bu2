# Phantom Mask Backend

基於 NestJS 框架的口罩庫存管理系統後端 API。

## 服務架構
- **後端 API**: 使用 NestJS 框架，提供 RESTful API 介面。
- **資料庫**: 使用 PostgreSQL，存儲藥局、口罩產品和使用者資料。
- **TypeORM**: 使用 TypeORM 作為 ORM 工具，簡化資料庫操作和 Migration 管理。
- **環境變數**: 使用 `.env` 檔案管理敏感資訊和配置參數。
- **Docker**: 使用 Docker 容器化後端服務和資料庫，方便部署和管理。
- **Docker Compose**: 使用 Docker Compose 編排多個服務，簡化啟動和管理流程。

## 🚀 快速開始

### 前置需求

- 確認安裝 Docker & Docker Compose
- 環境變數檔案

### 環境設定

1. 複製並設定環境變數：
   ```bash
   cp .env.example .env
   # 編輯 .env 檔案設定資料庫密碼等配置
   ```

## 🔧 建置與部署

### 快速腳本

| 腳本 | 用途 | 適用場景 |
|------|------|----------|
| `./script/rebuild-full.sh` | 完全重建所有服務（清除快取） | 初次部署 |
| `./script/rebuild-backend.sh` | 僅重建後端服務（保持資料庫） | 開發階段、後端版本更新 |

### Docker Compose 指令

```bash
# 啟動服務
docker compose up -d

# 停止服務
docker compose down

# 重建後端
docker compose build --no-cache backend && docker compose restart backend

# 查看日誌
docker compose logs -f backend
```

## 🗄️ 資料庫操作

```bash
# 執行 Migration
docker compose exec backend npm run migration:run

# 檢查資料庫連線
docker compose exec db pg_isready -U ${DB_USERNAME}

# 進入資料庫
docker compose exec db psql -U ${DB_USERNAME} -d ${DB_NAME}
```

## ⚙️ 環境變數設定

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `DB_HOST` | 資料庫主機 | `db` |
| `DB_PORT` | 資料庫埠號 | `5432` |
| `DB_USERNAME` | 資料庫使用者 | `phantom_user` |
| `DB_PASSWORD` | 資料庫密碼 | - |
| `DB_NAME` | 資料庫名稱 | `phantom_mask_db` |
| `PORT` | API 服務埠號 | `3000` |
| `NODE_ENV` | 執行環境 | `development` |

## 服務存取

- **後端 API**: http://localhost:3000
- **後端 API 文件**: http://localhost:3000/api/docs


## 🛠️ 故障排除

### 常見問題

**服務無法啟動**
```bash
# 檢查服務狀態
docker compose ps

# 查看錯誤日誌
docker compose logs backend
```

**資料庫連線失敗**
```bash
# 檢查資料庫狀態
docker compose exec db pg_isready -U phantom_user

# 重啟資料庫
docker compose restart db
```

**埠號衝突**
```bash
# 檢查埠號使用狀況
lsof -i :3000
lsof -i :5432

# 修改 .env 中的 PORT 設定
```

### 清理與重置

```bash
# 清理 Docker 資源
docker system prune -f

# 完全重置（會刪除所有資料）
docker compose down -v
./script/rebuild-full.sh
```

## 📋 開發流程建議

1. **初次設定**：`./script/rebuild-full.sh`
2. **日常開發**：修改代碼後執行 `./script/rebuild-backend.sh`
3. **查看日誌**：`docker compose logs -f backend`
4. **資料庫更新**：執行 migration 指令

## 🔒 安全性注意事項

- 生產環境請務必修改預設密碼
- 定期更新依賴套件
- 監控系統資源使用狀況
