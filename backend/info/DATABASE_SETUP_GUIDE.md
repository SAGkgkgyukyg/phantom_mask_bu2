# 資料庫容器自動建立使用者和資料庫設定

## ✅ 已完成的配置

您的 Docker 資料庫容器現在已經配置為根據 `.env` 檔案自動建立對應的使用者和資料庫。

### 🔧 配置檔案

#### 1. `.env` 檔案設定
```properties
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=phantom_user
DB_PASSWORD=phantom_password
DB_NAME=phantom_mask_db
```

#### 2. `docker-compose.yml` 資料庫服務配置
- 使用環境變數：`${DB_USERNAME}`, `${DB_PASSWORD}`, `${DB_NAME}`
- 初始化腳本執行順序：
  1. `init-db.sh` - Bash 初始化腳本
  2. `init-database.sql` - SQL 初始化腳本
  3. `extractDB/sql/` - 應用程式結構 SQL 檔案

### 🎯 自動建立的內容

當容器第一次啟動時，會自動建立：

✅ **資料庫**：`phantom_mask_db`
✅ **使用者**：`phantom_user` (具備超級使用者權限)
✅ **密碼**：`phantom_password`
✅ **擴充套件**：
   - `uuid-ossp` (UUID 生成功能)
   - `citext` (不區分大小寫文字類型)
✅ **時區設定**：Asia/Taipei (在 SQL 腳本中設定，但容器預設仍為 UTC)

### 📊 驗證結果

使用測試腳本 `./test-db-connection.sh` 驗證：
- 資料庫連接正常 ✅
- 使用者權限正確 ✅
- 擴充套件安裝成功 ✅
- 資料庫建立成功 ✅

### 🚀 使用方式

1. **確保環境變數正確**：
   ```bash
   ./check-env.sh
   ```

2. **啟動服務**：
   ```bash
   docker compose up -d --build
   ```

3. **測試資料庫連接**：
   ```bash
   ./test-db-connection.sh
   ```

4. **連接到資料庫**：
   ```bash
   docker compose exec db psql -U phantom_user -d phantom_mask_db
   ```

### 🔄 重新初始化

如果需要重新初始化資料庫（會刪除所有資料）：
```bash
# 停止服務
docker compose down

# 刪除資料卷
docker volume rm phantom_db_data_integrated

# 重新啟動
docker compose up -d --build
```

### 📝 注意事項

- 初始化腳本只在容器**第一次**建立時執行
- 如果資料庫資料卷已存在，初始化腳本會被跳過
- 所有設定都來自 `.env` 檔案，修改 `.env` 後需要重新建立容器才會生效
- 使用者 `phantom_user` 具備超級使用者權限，可以執行所有資料庫操作

您現在可以放心使用 Docker Compose，資料庫會根據您的 `.env` 設定自動建立對應的使用者和資料庫！