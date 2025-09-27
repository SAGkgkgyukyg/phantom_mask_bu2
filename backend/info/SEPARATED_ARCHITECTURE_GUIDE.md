# 分離式 Docker 架構指南

## 🏗️ 架構概述

分離式架構將資料庫和後端服務完全分開管理，提供更好的穩定性和開發彈性。

### 架構比較

| 特點         | 整合式架構     | 分離式架構 ✨     |
| ------------ | -------------- | ----------------- |
| 資料庫穩定性 | 與後端一起重啟 | 完全獨立運行      |
| 開發彈性     | 需要同時管理   | 可單獨更新後端    |
| 資料安全性   | 一般           | **高** - 自動備份 |
| 資源使用     | 較高           | 較低              |
| 部署複雜度   | 簡單           | 中等              |

## 🚀 快速開始

### 方法 1: 一鍵啟動

```bash
# 自動初始化並啟動分離式環境
make quick-start-separated
```

### 方法 2: 逐步啟動

```bash
# 1. 初始化環境（建立網路、啟動資料庫）
make separated-init

# 2. 啟動後端服務
make backend-start

# 3. 檢查服務狀態
make separated-status
```

## 📋 服務管理

### 資料庫管理（一次建立，長期使用）

```bash
# 啟動資料庫服務
make db-start

# 停止資料庫服務（保留資料）
make db-stop

# 重新啟動資料庫
make db-restart

# 查看資料庫日誌
make db-logs

# 連接資料庫
make db-shell
```

### 後端管理（可頻繁重建）

```bash
# 啟動後端服務
make backend-start

# 停止後端服務
make backend-stop

# 重新啟動後端
make backend-restart

# 安全重建後端（自動備份 → 重建 → 驗證）
make backend-rebuild

# 查看後端日誌
make backend-logs

# 進入後端容器
make backend-shell
```

## 🔄 安全重建流程

`make backend-rebuild` 命令提供完全自動化的安全重建流程：

1. **🔒 自動備份資料庫**
   - 建立帶時間戳記的備份檔案
   - 驗證備份完整性

2. **🛑 停止舊的後端服務**
   - 優雅地停止容器
   - 清理舊的映像檔

3. **🔨 重新建置映像檔**
   - 使用最新程式碼
   - 清除快取確保乾淨建置

4. **🚀 啟動新的後端服務**
   - 等待服務完全就緒
   - 自動健康檢查

5. **✅ 驗證服務狀態**
   - 檢查所有服務健康狀態
   - 確保系統正常運作

## 💾 備份與還原

### 自動備份

```bash
# 建立自動備份（包含時間戳記）
make db-backup-auto

# 檢視備份檔案
ls -la backups/
```

### 還原最新備份

```bash
# 自動還原最新的備份
make db-restore-latest

# 手動還原指定備份
make db-restore FILE=backups/auto_backup_20240927_143022.sql
```

## 📊 監控與檢查

### 服務狀態檢查

```bash
# 查看所有分離式服務狀態
make separated-status

# 檢查服務健康狀態
make separated-health

# 查看所有服務日誌
make separated-logs
```

### 健康檢查輸出範例

```
🏥 檢查分離式服務健康狀態...
資料庫健康狀態:
✅ 資料庫服務正常
後端健康狀態:
✅ 後端服務正常
```

## 🗄️ 資料庫遷移

### 執行 Migration

```bash
# 執行資料庫 migration
make migration-run

# 回滾 migration
make migration-revert

# 產生新的 migration
make migration-generate NAME=AddNewFeature
```

## 🧪 開發與測試

### 執行測試

```bash
# 執行單元測試
make test

# 執行端對端測試
make test-e2e
```

## 🌐 網路架構

分離式架構使用 Docker 自訂網路 `phantom_network`：

```
┌─────────────────────────────────────────┐
│            phantom_network              │
│  ┌─────────────────┐ ┌─────────────────┐ │
│  │   Database      │ │    Backend      │ │
│  │ (persistent)    │ │  (rebuildable)  │ │
│  │ Port: 5432      │◄┤ Port: 3000      │ │
│  └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────┘
          │                      │
    ┌─────▼──────┐        ┌──────▼─────┐
    │ Host:5432  │        │ Host:3000  │
    │ (DB Access)│        │ (API)      │
    └────────────┘        └────────────┘
```

## 🔧 環境配置

### .env 檔案設定

```bash
# 分離式架構的重要設定
DB_HOST=localhost  # 本地開發時使用
# DB_HOST=phantom_db_persistent  # 如果後端也在 Docker 中

DB_PORT=5432
DB_USERNAME=phantom_user
DB_PASSWORD=your_secure_password
DB_NAME=phantom_mask_db
```

## 🛠️ 故障排除

### 常見問題

#### 1. 後端無法連接資料庫

```bash
# 檢查資料庫是否運行
make db-start

# 檢查網路連通性
docker network inspect phantom_network

# 驗證環境變數
grep DB_ .env
```

#### 2. 資料庫服務無法啟動

```bash
# 檢查連接埠是否被占用
lsof -i :5432

# 查看資料庫日誌
make db-logs

# 重新建立網路
docker network rm phantom_network
make separated-init
```

#### 3. 備份失敗

```bash
# 檢查備份目錄權限
mkdir -p backups
chmod 755 backups

# 手動測試備份
docker-compose -f docker-compose.db.yml exec db pg_dump -U ${DB_USERNAME} ${DB_NAME}
```

## 🧹 清理與維護

### 定期維護

```bash
# 清理分離式服務容器（保留資料）
make separated-clean

# 查看資源使用情況
make monitor
```

### 完全重置

```bash
# ⚠️ 警告：這將刪除所有資料！
make separated-destroy
```

## 📈 效能最佳化

### 資料庫最佳化設定

docker-compose.db.yml 中已包含：

- 健康檢查
- 資源限制
- 優化的初始化參數
- 自動重啟設定

### 後端最佳化設定

docker-compose.backend.yml 中已包含：

- 健康檢查
- 資源限制
- 依賴關係管理
- 環境變數最佳化

## 🔒 安全建議

1. **環境變數安全**

   ```bash
   # 確保 .env 檔案權限正確
   chmod 600 .env
   ```

2. **資料庫存取控制**
   - 使用強密碼
   - 定期更新憑證
   - 限制網路存取

3. **定期備份**
   ```bash
   # 設定定期備份（可加入 crontab）
   0 2 * * * cd /path/to/project && make db-backup-auto
   ```

## 📚 相關文件

- [Docker Compose 完整指南](./DOCKER_COMPOSE_GUIDE.md)
- [Docker Compose 快速參考](./DOCKER_QUICK_REFERENCE.md)
- [專案 README](./README.md)

---

_分離式架構讓您的開發更安全、更靈活！_
