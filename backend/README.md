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

### 資料庫設定
| 變數 | 說明 | 預設值 | 備註 |
|------|------|--------|------|
| `DB_HOST` | PostgreSQL 資料庫主機位址 | `localhost` | Docker 環境請設為 `db` |
| `DB_PORT` | PostgreSQL 連接埠號 | `5432` | 標準 PostgreSQL 埠號 |
| `DB_USERNAME` | 資料庫使用者名稱 | - | **必須設定** |
| `DB_PASSWORD` | 資料庫使用者密碼 | - | **必須設定**，生產環境請使用強密碼 |
| `DB_NAME` | 資料庫名稱 | - | **必須設定** |

### 應用程式設定
| 變數 | 說明 | 預設值 | 備註 |
|------|------|--------|------|
| `NODE_ENV` | 應用程式執行環境 | `development` | `development` \| `production` \| `test` |
| `PORT` | API 服務監聽埠號 | `3000` | 可自訂，避免埠號衝突 |
| `LOG_LEVEL` | 日誌記錄等級 | `debug` | `error` \| `warn` \| `info` \| `debug` \| `verbose` |

### 安全性設定
| 變數 | 說明 | 預設值 | 備註 |
|------|------|--------|------|
| `JWT_SECRET` | JWT 簽名密鑰 | `test` | **生產環境必須更改**，建議 32+ 字元 |
| `JWT_EXPIRES_IN` | JWT Token 有效期限 | `24h` | 格式：數字+單位 (h/d/m) |
| `ALLOWED_ORIGINS` | CORS 允許的前端來源 | - | 多個網址用逗號分隔，生產環境必須設定 |

### 預設使用者帳號
| 變數 | 說明 | 預設值 | 備註 |
|------|------|--------|------|
| `NORMAL_USER_USERNAME` | 普通使用者帳號 | `user` | 系統初始化時建立 |
| `NORMAL_USER_PASSWORD` | 普通使用者密碼 | - | **必須設定** bcrypt 雜湊值 |
| `ADMIN_USER_USERNAME` | 管理者帳號 | `admin` | 系統初始化時建立 |
| `ADMIN_USER_PASSWORD` | 管理者密碼 | - | **必須設定** bcrypt 雜湊值 |

> ⚠️ **重要提醒**: 
> - 標記為 **必須設定** 的變數在啟動前必須配置
> - 生產環境部署前，請務必更改所有預設密碼和密鑰
> - 密碼需使用 bcrypt 加密，可使用線上工具或程式碼生成

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
