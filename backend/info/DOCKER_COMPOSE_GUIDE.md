# Docker Compose 操作指南

本指南提供了 Phantom Mask Backend 專案的 Docker Compose 相關操作說明。

## 📋 目錄

- [系統架構](#系統架構)
- [環境設定](#環境設定)
- [基本操作](#基本操作)
- [開發模式操作](#開發模式操作)
- [生產模式操作](#生產模式操作)
- [資料庫操作](#資料庫操作)
- [日誌查看](#日誌查看)
- [疑難排解](#疑難排解)
- [常用命令參考](#常用命令參考)

## 🏗️ 系統架構

本專案使用 Docker Compose 管理以下服務：

```
┌─────────────────────┐    ┌─────────────────────┐
│     Backend         │    │     Database        │
│   (NestJS App)      │◄───┤   (PostgreSQL 15)  │
│   Port: ${PORT}     │    │   Port: ${DB_PORT}  │
│   Container: phantom│    │   Container: phantom│
│   _backend          │    │   _db               │
└─────────────────────┘    └─────────────────────┘
```

### 服務說明：

- **backend**: NestJS 應用程式，提供 API 服務
- **db**: PostgreSQL 15 資料庫，儲存應用程式資料

## ⚙️ 環境設定

### 1. 建立 .env 檔案

在 `backend` 目錄下建立 `.env` 檔案：

```bash
# 資料庫設定
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=phantom_user
DB_PASSWORD=your_secure_password
DB_NAME=phantom_mask_db

# 應用程式設定
NODE_ENV=development
PORT=3000

# JWT 設定 (可選，用於認證)
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 2. 檔案權限設定

確保 Docker Compose 檔案具有適當的權限：

```bash
chmod 644 docker-compose.yml
chmod 600 .env  # 保護敏感資訊
```

## 🚀 基本操作

### 啟動所有服務

```bash
# 在背景啟動所有服務
docker-compose up -d

# 前景啟動（可看到即時日誌）
docker-compose up

# 指定環境檔案啟動
docker-compose --env-file .env up -d
```

### 停止所有服務

```bash
# 停止服務（保留容器）
docker-compose stop

# 停止並移除容器
docker-compose down

# 停止並移除容器、網路、映像檔
docker-compose down --rmi all

# 停止並移除所有資料（包含 volumes）
docker-compose down -v --rmi all
```

### 重新啟動服務

```bash
# 重新啟動所有服務
docker-compose restart

# 重新啟動特定服務
docker-compose restart backend
docker-compose restart db
```

## 🔧 開發模式操作

### 即時程式碼更新

由於目前的 Dockerfile 是為生產環境設計，開發時建議使用以下方式：

1. **建立開發用的 docker-compose.dev.yml**：

```bash
# 建立開發環境配置
cat > docker-compose.dev.yml << 'EOF'
services:
  db:
    image: postgres:15
    container_name: phantom_db_dev
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - db_data_dev:/var/lib/postgresql/data
      - ./extractDB/sql:/docker-entrypoint-initdb.d  # 自動執行初始化 SQL

volumes:
  db_data_dev:
EOF
```

2. **開發時啟動**：

```bash
# 只啟動資料庫
docker-compose -f docker-compose.dev.yml up -d db

# 本地運行後端
npm run start:dev
```

### 建立開發版本

```bash
# 重新建置開發版本
docker-compose build --no-cache backend

# 使用特定 Node.js 版本建置
docker-compose build --build-arg NODE_VERSION=18-alpine backend
```

## 🌐 生產模式操作

### 建置與部署

```bash
# 建置生產版本映像檔
docker-compose build --no-cache

# 啟動生產環境
NODE_ENV=production docker-compose up -d

# 檢查服務狀態
docker-compose ps
```

### 健康檢查

```bash
# 檢查容器狀態
docker-compose ps

# 檢查服務健康狀態
curl http://localhost:${PORT}/health

# 檢查資料庫連線
docker-compose exec db pg_isready -U ${DB_USERNAME}
```

## 🗄️ 資料庫操作

### 連接資料庫

```bash
# 進入 PostgreSQL 容器
docker-compose exec db psql -U ${DB_USERNAME} -d ${DB_NAME}

# 執行 SQL 指令
docker-compose exec db psql -U ${DB_USERNAME} -d ${DB_NAME} -c "SELECT version();"

# 匯入 SQL 檔案
docker-compose exec -T db psql -U ${DB_USERNAME} -d ${DB_NAME} < backup.sql
```

### 資料庫備份與還原

```bash
# 建立備份
docker-compose exec db pg_dump -U ${DB_USERNAME} ${DB_NAME} > backup_$(date +%Y%m%d_%H%M%S).sql

# 還原備份
docker-compose exec -T db psql -U ${DB_USERNAME} -d ${DB_NAME} < backup.sql

# 建立 gzip 壓縮備份
docker-compose exec db pg_dump -U ${DB_USERNAME} ${DB_NAME} | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 資料庫初始化

```bash
# 執行初始化 SQL（如果有的話）
docker-compose exec db psql -U ${DB_USERNAME} -d ${DB_NAME} -f /docker-entrypoint-initdb.d/init_all_tables.sql
```

### TypeORM Migration 操作

```bash
# 在容器內執行 migration
docker-compose exec backend npm run migration:run

# 產生新的 migration
docker-compose exec backend npm run migration:generate -- src/migrations/NewMigration

# 回滾 migration
docker-compose exec backend npm run migration:revert

# 查看 migration 狀態
docker-compose exec backend npm run migration:show
```

## 📋 日誌查看

### 查看服務日誌

```bash
# 查看所有服務日誌
docker-compose logs

# 查看特定服務日誌
docker-compose logs backend
docker-compose logs db

# 即時跟蹤日誌
docker-compose logs -f

# 查看最近 100 行日誌
docker-compose logs --tail=100

# 查看特定時間的日誌
docker-compose logs --since=2024-01-01T10:00:00
```

### 日誌管理

```bash
# 清除日誌
docker-compose logs --no-log-prefix > /dev/null 2>&1

# 設定日誌輪轉（在 docker-compose.yml 中）
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 🛠️ 服務管理

### 容器操作

```bash
# 進入後端容器
docker-compose exec backend sh

# 進入資料庫容器
docker-compose exec db bash

# 檢查容器資源使用情況
docker-compose top

# 查看容器詳細資訊
docker-compose exec backend env
```

### 網路管理

```bash
# 查看網路資訊
docker network ls | grep phantom

# 檢查服務間的網路連通性
docker-compose exec backend ping db
```

### Volume 管理

```bash
# 查看 volumes
docker volume ls | grep phantom

# 檢查 volume 詳細資訊
docker volume inspect phantom_mask_bu2_db_data

# 清理未使用的 volumes
docker volume prune
```

## 🐛 疑難排解

### 常見問題與解決方案

#### 1. 服務無法啟動

```bash
# 檢查容器狀態
docker-compose ps

# 查看錯誤日誌
docker-compose logs backend

# 重新建置映像檔
docker-compose build --no-cache backend
```

#### 2. 資料庫連線失敗

```bash
# 檢查資料庫容器狀態
docker-compose exec db pg_isready -U ${DB_USERNAME}

# 檢查網路連線
docker-compose exec backend nc -zv db 5432

# 重新啟動資料庫服務
docker-compose restart db
```

#### 3. Port 被佔用

```bash
# 檢查 Port 使用情況
lsof -i :3000
lsof -i :5432

# 停止佔用 Port 的程序
sudo kill -9 <PID>

# 修改 .env 檔案中的 Port 設定
```

#### 4. 磁碟空間不足

```bash
# 清理 Docker 資源
docker system prune -a

# 清理未使用的映像檔
docker image prune -a

# 清理未使用的 volumes
docker volume prune
```

#### 5. 權限問題

```bash
# 修正檔案權限
sudo chown -R $(whoami):$(whoami) .

# 修正 Docker socket 權限
sudo usermod -aG docker $USER
newgrp docker
```

### 除錯技巧

```bash
# 1. 檢查環境變數
docker-compose config

# 2. 驗證 Docker Compose 語法
docker-compose -f docker-compose.yml config

# 3. 查看容器內的程序
docker-compose exec backend ps aux

# 4. 檢查容器內的檔案系統
docker-compose exec backend ls -la /usr/src/app

# 5. 測試服務端點
curl -I http://localhost:${PORT}
```

## 📚 常用命令參考

### Docker Compose 基本命令

| 命令                     | 說明             |
| ------------------------ | ---------------- |
| `docker-compose up`      | 啟動服務         |
| `docker-compose up -d`   | 背景啟動服務     |
| `docker-compose down`    | 停止並移除容器   |
| `docker-compose stop`    | 停止服務         |
| `docker-compose start`   | 啟動已停止的服務 |
| `docker-compose restart` | 重新啟動服務     |
| `docker-compose ps`      | 查看服務狀態     |
| `docker-compose logs`    | 查看日誌         |
| `docker-compose exec`    | 執行容器內命令   |
| `docker-compose build`   | 建置映像檔       |

### 開發相關命令

| 命令                                                | 說明                 |
| --------------------------------------------------- | -------------------- |
| `docker-compose -f docker-compose.dev.yml up`       | 使用開發配置         |
| `docker-compose exec backend npm run start:dev`     | 開發模式啟動         |
| `docker-compose exec backend npm run test`          | 執行測試             |
| `docker-compose exec backend npm run migration:run` | 執行資料庫 migration |

### 維護相關命令

| 命令                    | 說明         |
| ----------------------- | ------------ |
| `docker-compose pull`   | 更新映像檔   |
| `docker system prune`   | 清理系統資源 |
| `docker-compose config` | 驗證配置檔案 |
| `docker-compose top`    | 查看容器程序 |

## 🔄 更新與維護

### 定期維護作業

1. **每週**：

   ```bash
   # 更新映像檔
   docker-compose pull

   # 重新建置服務
   docker-compose build --no-cache
   ```

2. **每月**：

   ```bash
   # 清理未使用的資源
   docker system prune -f

   # 備份資料庫
   docker compose exec db pg_dump -U ${DB_USERNAME} ${DB_NAME} > monthly_backup.sql
   ```

3. **版本更新**：

   ```bash
   # 停止服務
   docker compose down

   # 更新程式碼
   git pull origin main

   # 重新建置並啟動
   docker compose build --no-cache
   docker compose up -d
   ```

## 📞 支援與協助

如果遇到問題或需要協助，請檢查：

1. **日誌檔案**：使用 `docker-compose logs` 查看詳細錯誤訊息
2. **環境變數**：確認 `.env` 檔案設定正確
3. **網路連線**：檢查服務間的網路通訊
4. **磁碟空間**：確保有足夠的儲存空間
5. **權限設定**：驗證檔案和目錄權限

---

_最後更新：2024年9月27日_
_版本：1.0.0_
