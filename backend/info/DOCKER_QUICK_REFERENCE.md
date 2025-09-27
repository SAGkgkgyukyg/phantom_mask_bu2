# Docker Compose 快速參考

## 🚀 快速開始

```bash
# 1. 複製環境變數檔案
cp .env.example .env

# 2. 修改 .env 檔案中的設定
nano .env

# 3. 啟動服務
docker-compose up -d

# 4. 檢查服務狀態
docker-compose ps
```

## 📋 常用命令速查

### 服務管理

```bash
# 啟動所有服務
docker-compose up -d

# 停止所有服務
docker-compose stop

# 重新啟動服務
docker-compose restart

# 停止並移除容器
docker-compose down

# 檢視服務狀態
docker-compose ps
```

### 日誌查看

```bash
# 查看所有日誌
docker-compose logs

# 查看後端日誌
docker-compose logs backend

# 即時跟蹤日誌
docker-compose logs -f backend

# 查看最新 50 行日誌
docker-compose logs --tail=50 backend
```

### 容器操作

```bash
# 進入後端容器
docker-compose exec backend sh

# 進入資料庫容器
docker-compose exec db psql -U ${DB_USERNAME} -d ${DB_NAME}

# 在容器內執行命令
docker-compose exec backend npm run migration:run
```

### 建置與重建

```bash
# 重新建置映像檔
docker-compose build --no-cache

# 強制重新建置並啟動
docker-compose up --build -d

# 只建置特定服務
docker-compose build backend
```

## ⚡ 開發模式

### 方法 1：只啟動資料庫

```bash
# 只啟動資料庫服務
docker-compose up -d db

# 本地運行後端（需要修改 DB_HOST=localhost）
npm run start:dev
```

### 方法 2：建立開發配置

```bash
# 建立 docker-compose.dev.yml
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

volumes:
  db_data_dev:
EOF

# 使用開發配置
docker-compose -f docker-compose.dev.yml up -d
```

## 🗄️ 資料庫操作

### 基本操作

```bash
# 連接資料庫
docker-compose exec db psql -U ${DB_USERNAME} -d ${DB_NAME}

# 執行 SQL 檔案
docker-compose exec -T db psql -U ${DB_USERNAME} -d ${DB_NAME} < script.sql

# 查看資料庫狀態
docker-compose exec db pg_isready -U ${DB_USERNAME}
```

### 備份與還原

```bash
# 建立備份
docker-compose exec db pg_dump -U ${DB_USERNAME} ${DB_NAME} > backup.sql

# 還原備份
docker-compose exec -T db psql -U ${DB_USERNAME} -d ${DB_NAME} < backup.sql

# 壓縮備份
docker-compose exec db pg_dump -U ${DB_USERNAME} ${DB_NAME} | gzip > backup.sql.gz
```

### TypeORM Migration

```bash
# 執行 migration
docker-compose exec backend npm run migration:run

# 產生 migration
docker-compose exec backend npm run migration:generate -- src/migrations/NewFeature

# 回滾 migration
docker-compose exec backend npm run migration:revert
```

## 🔧 故障排除

### 常見錯誤

#### 1. 連接埠被占用

```bash
# 檢查連接埠使用情況
lsof -i :3000
lsof -i :5432

# 終止占用程序
sudo kill -9 <PID>

# 修改 .env 中的連接埠
PORT=3001
DB_PORT=5433
```

#### 2. 資料庫連接失敗

```bash
# 檢查資料庫容器狀態
docker-compose ps db

# 查看資料庫日誌
docker-compose logs db

# 測試資料庫連線
docker-compose exec db pg_isready -U ${DB_USERNAME}

# 重新啟動資料庫
docker-compose restart db
```

#### 3. 後端啟動失敗

```bash
# 查看後端日誌
docker-compose logs backend

# 重新建置後端映像檔
docker-compose build --no-cache backend

# 檢查環境變數
docker-compose exec backend env | grep DB_
```

#### 4. 映像檔建置問題

```bash
# 清理 Docker 快取
docker builder prune -a

# 重新下載基礎映像檔
docker pull node:18-alpine
docker pull postgres:15

# 強制重新建置
docker-compose build --no-cache --pull
```

### 診斷命令

```bash
# 檢查 Docker Compose 配置
docker-compose config

# 檢查服務健康狀態
docker-compose ps
docker-compose top

# 檢查容器資源使用
docker stats

# 檢查網路連線
docker-compose exec backend ping db
docker-compose exec backend nc -zv db 5432

# 清理系統資源
docker system prune -a
docker volume prune
```

## 🛡️ 安全檢查清單

- [ ] `.env` 檔案不應提交到版本控制
- [ ] 資料庫密碼使用強密碼
- [ ] JWT_SECRET 使用隨機長字串
- [ ] 生產環境禁用 CORS_ORIGIN=\*
- [ ] 定期更新映像檔版本
- [ ] 啟用容器資源限制

## 📊 監控檢查

```bash
# 檢查容器狀態
docker-compose ps

# 檢查資源使用
docker stats --no-stream

# 檢查磁碟空間
df -h
docker system df

# 檢查日誌大小
du -sh /var/lib/docker/containers/*/
```

## 🔄 更新流程

```bash
# 1. 停止服務
docker-compose down

# 2. 備份資料
docker-compose exec db pg_dump -U ${DB_USERNAME} ${DB_NAME} > backup_before_update.sql

# 3. 拉取最新程式碼
git pull origin main

# 4. 重新建置
docker-compose build --no-cache

# 5. 啟動服務
docker-compose up -d

# 6. 檢查狀態
docker-compose ps
docker-compose logs --tail=50
```

## 📞 緊急回復

如果服務出現問題，可以快速回復：

```bash
# 快速重置（會清除所有資料！）
docker-compose down -v --rmi all
docker-compose up --build -d

# 保留資料的重置
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

_建議將此文件加入書籤，以便快速查詢！_
