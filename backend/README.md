# Phantom Mask Backend

基於 NestJS 框架構建的口罩庫存管理系統後端 API。

## 🚀 Docker 建置方式

### 前置需求

- Docker
- Docker Compose

### 📝 環境設定

1. **複製環境變數檔案**
   ```bash
   cp .env.example .env
   ```

2. **編輯環境變數**
   ```bash
   # 修改資料庫密碼和其他設定
   nano .env
   ```

### 建置與啟動

#### 使用 Docker Compose

```bash
# 啟動所有服務（資料庫 + 後端）
docker-compose up -d

# 檢查服務狀態
docker-compose ps

# 查看服務日誌
docker-compose logs -f

# 停止所有服務
docker-compose down
```

### 🗄️ 資料庫初始化

```bash
# 執行資料庫 migration
docker-compose exec backend npm run migration:run

# 檢查資料庫狀態
docker-compose exec db pg_isready -U phantom_user
```

### 服務管理

```bash
# 查看特定服務日誌
docker-compose logs -f backend
docker-compose logs -f db

# 進入容器
docker-compose exec backend sh
docker-compose exec db psql -U phantom_user -d phantom_mask_db

# 重新建置映像檔
docker-compose build --no-cache

# 重啟特定服務
docker-compose restart backend
```

### 🔧 環境變數說明

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| `DB_HOST` | 資料庫主機 | `db` |
| `DB_PORT` | 資料庫連接埠 | `5432` |
| `DB_USERNAME` | 資料庫使用者名稱 | `phantom_user` |
| `DB_PASSWORD` | 資料庫密碼 | - |
| `DB_NAME` | 資料庫名稱 | `phantom_mask_db` |
| `NODE_ENV` | 執行環境 | `development` |
| `PORT` | API 服務連接埠 | `3000` |

### 🎯 服務存取

- **後端 API**: http://localhost:3000
- **資料庫**: localhost:5432

###  常見問題排除

**1. 服務無法啟動**
```bash
# 檢查服務狀態
docker-compose ps

# 查看錯誤日誌
docker-compose logs
```

**2. 資料庫連線失敗**
```bash
# 檢查資料庫狀態
docker-compose exec db pg_isready -U phantom_user

# 重啟資料庫服務
docker-compose restart db
```

**3. 連接埠衝突**
```bash
# 檢查連接埠使用情況
lsof -i :3000
lsof -i :5432

# 修改 .env 檔案中的連接埠設定
```
