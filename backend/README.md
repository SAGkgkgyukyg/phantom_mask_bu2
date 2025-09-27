# Phantom Mask Backend

基於 NestJS 框架構建的口罩庫存管理系統後端 API。

## 🚀 快速開始

### 🏗️ 分離式架構（推薦）

分離式架構將資料庫和後端服務分開管理，提供更好的穩定性和資料安全性：

```bash
# 一鍵啟動分離式環境
$ make quick-start-separated

# 或逐步啟動
$ make separated-init    # 初始化環境（資料庫+網路）
$ make backend-start     # 啟動後端服務
```

**分離式架構優勢：**
- ✅ 資料庫獨立運行，重建後端時資料不會丟失
- ✅ 自動備份機制，重建前自動備份資料
- ✅ 可單獨更新後端，不影響資料庫穩定性
- ✅ 更好的資源管理和監控

### 🔄 整合式架構（傳統）

```bash
# 快速開始 - 自動設置環境並啟動所有服務
$ make quick-start

# 查看所有可用命令
$ make help
```

### 使用 Docker Compose（手動）

```bash
# 1. 複製環境變數檔案
$ cp .env.example .env

# 2. 修改 .env 檔案中的設定（特別是密碼）
$ nano .env

# 3. 啟動所有服務（資料庫 + 後端）
$ docker-compose up -d

# 4. 檢查服務狀態
$ docker-compose ps
```

### 開發模式設置

```bash
# 方法 1: 使用分離式架構（推薦）
$ make separated-init    # 啟動資料庫
$ npm run start:dev      # 本地運行後端

# 方法 2: 只啟動資料庫，本地運行後端
$ docker-compose up -d db
$ npm install
$ npm run start:dev

# 方法 3: 使用 Makefile 啟動開發環境
$ make dev
$ npm run start:dev
```

## 📋 Docker Compose 操作

### 🏗️ 分離式架構操作（推薦）

分離式架構將資料庫和後端分開管理，提供更好的穩定性：

```bash
# === 資料庫管理（一次建立，長期使用） ===
$ make db-start          # 啟動獨立資料庫
$ make db-stop           # 停止資料庫（保留資料）
$ make db-backup-auto    # 自動備份資料庫
$ make db-restore-latest # 還原最新備份

# === 後端管理（可頻繁重建） ===
$ make backend-start     # 啟動後端服務
$ make backend-stop      # 停止後端服務
$ make backend-rebuild   # 安全重建（自動備份→重建→驗證）

# === 監控與檢查 ===
$ make separated-status  # 查看服務狀態
$ make separated-health  # 檢查健康狀態
$ make separated-logs    # 查看所有日誌
```

**🔄 安全重建流程**：
`make backend-rebuild` 提供完全自動化的重建：
1. 🔒 自動備份資料庫
2. 🛑 停止舊的後端服務  
3. 🔨 重新建置映像檔
4. 🚀 啟動新的後端服務
5. ✅ 驗證服務狀態

### 🔄 整合式架構操作（傳統）

```bash
# 啟動服務
$ docker-compose up -d

# 停止服務
$ docker-compose down

# 重新啟動服務
$ docker-compose restart

# 查看服務狀態
$ docker-compose ps

# 查看日誌
$ docker-compose logs -f
```

### 服務管理

```bash
# 查看後端日誌
$ docker-compose logs -f backend

# 進入後端容器
$ docker-compose exec backend sh

# 進入資料庫
$ docker-compose exec db psql -U ${DB_USERNAME} -d ${DB_NAME}

# 重新建置映像檔
$ docker-compose build --no-cache
```

**📚 詳細文件：**
- [分離式架構完整指南](./SEPARATED_ARCHITECTURE_GUIDE.md) ⭐
- [Docker Compose 完整指南](./DOCKER_COMPOSE_GUIDE.md)
- [Docker Compose 快速參考](./DOCKER_QUICK_REFERENCE.md)

## 🗄️ 資料庫設置

### 自動化設置（推薦）

使用 Docker Compose 啟動時，會自動：
1. 建立 PostgreSQL 15 資料庫
2. 設定資料庫使用者和權限
3. 準備好接受 migration

```bash
# 執行資料庫 migration（建立結構 + 插入初始資料）
$ docker-compose exec backend npm run migration:run
```

這將會執行兩個 Migration：
- **InitialMigration**: 建立所有資料表結構（從 `extractDB/sql/init_all_tables.sql`）
- **SeedInitialData**: 插入約 482 筆初始資料記錄

### 手動設置

如果您有自己的 PostgreSQL 資料庫：

1. 建立資料庫 `phantom_mask`
2. 設定 `.env` 檔案中的資料庫連接參數
3. 執行 migration：`npm run migration:run`

### 資料庫操作

```bash
# 使用 Makefile（推薦）
$ make db-backup              # 建立備份
$ make db-restore FILE=backup.sql  # 還原備份
$ make migration-run          # 執行 migration
$ make migration-revert       # 回滾 migration

# 或使用 Docker Compose
$ docker-compose exec db pg_dump -U ${DB_USERNAME} ${DB_NAME} > backup.sql
$ docker-compose exec -T db psql -U ${DB_USERNAME} -d ${DB_NAME} < backup.sql
```

## 🛠️ 開發工具

### 🏗️ 分離式架構命令（推薦）

```bash
$ make help                      # 查看所有可用命令
$ make quick-start-separated     # 🚀 一鍵啟動分離式環境
$ make separated-init            # 初始化分離式環境
$ make db-start                  # 啟動獨立資料庫
$ make backend-start             # 啟動後端服務
$ make backend-rebuild           # 安全重建後端（含自動備份）
$ make separated-status          # 查看分離式服務狀態
$ make separated-health          # 檢查服務健康狀態
$ make db-backup-auto            # 自動備份資料庫
$ make db-restore-latest         # 還原最新備份
```

### 🔄 整合式架構命令（傳統）

```bash
$ make up                     # 啟動所有服務
$ make down                   # 停止所有服務
$ make logs                   # 查看日誌
$ make build                  # 重新建置映像檔
$ make shell-backend          # 進入後端容器
$ make shell-db              # 連接資料庫
$ make test                  # 執行測試
$ make health                # 檢查服務健康狀態
```

### 💾 備份與安全

分離式架構提供完整的資料保護機制：

- **自動備份**：重建前自動建立備份
- **時間戳記**：每個備份都有唯一的時間戳記
- **驗證機制**：備份和還原都有完整性檢查
- **一鍵還原**：可快速還原最新或指定備份

```bash
# 檢視所有備份
$ ls -la backups/

# 範例輸出：
# auto_backup_20240927_143022.sql
# auto_backup_20240927_151055.sql
```

## ⚡ 編譯並運行專案

### Docker 方式（生產環境）

```bash
# 啟動生產環境
$ make prod

# 或手動操作
$ NODE_ENV=production docker-compose up -d --build
```

### 本地開發方式

```bash
# 安裝依賴
$ npm install

# 開發模式（熱重載）
$ npm run start:dev

# 一般開發模式
$ npm run start

# 生產模式
$ npm run start:prod
```

## 🧪 執行測試

```bash
# 使用 Makefile（在容器內執行）
$ make test              # 單元測試
$ make test-e2e          # 端對端測試
$ make lint              # 代碼檢查
$ make format            # 代碼格式化

# 或本地執行
$ npm run test           # 單元測試
$ npm run test:e2e       # 端對端測試
$ npm run test:cov       # 測試覆蓋率
```

## 📊 監控和維護

```bash
# 檢查服務狀態
$ make status

# 檢查健康狀態
$ make health

# 監控資源使用
$ make monitor

# 查看配置
$ make config

# 更新專案
$ make update
```

## 📚 相關文件

### Docker 相關
- [Docker Compose 完整操作指南](./DOCKER_COMPOSE_GUIDE.md) - 詳細的 Docker Compose 操作說明
- [Docker Compose 快速參考](./DOCKER_QUICK_REFERENCE.md) - 常用命令速查
- [Makefile](./Makefile) - 自動化操作腳本

### 專案文件
- **[分離式架構指南](./SEPARATED_ARCHITECTURE_GUIDE.md)** ⭐ - 推薦的分離式 Docker 架構
- [資料庫 Migration 指南](./info/MIGRATION.md) - 資料庫結構變更管理
- [登入功能說明](./info/LOGIN_COMPLETED.md) - 使用者認證實作
- [商店 API 說明](./info/STORE_API.md) - 商店相關 API 文件
- [資料庫初始化腳本](./extractDB/README.md) - 資料庫初始化說明

## 🏗️ 專案架構

```
backend/
├── docker-compose.yml          # Docker Compose 配置
├── Dockerfile                  # Docker 映像檔定義
├── Makefile                   # 自動化操作腳本
├── .env.example               # 環境變數範例
├── DOCKER_COMPOSE_GUIDE.md    # Docker 完整指南
├── DOCKER_QUICK_REFERENCE.md  # Docker 快速參考
│
├── src/                       # 原始碼
│   ├── entities/             # TypeORM 實體定義
│   ├── migrations/           # 資料庫 migration 檔案
│   ├── app/                  # 應用程式模組
│   │   ├── auth/            # 認證模組
│   │   ├── store/           # 商店模組
│   │   └── user/            # 使用者模組
│   ├── middlewares/         # 中介軟體
│   ├── utils/               # 工具函數
│   ├── app.module.ts        # 主應用模組
│   ├── data-source.ts       # TypeORM 配置
│   └── main.ts             # 應用程式入口
│
├── extractDB/               # 資料庫相關腳本
│   ├── sql/                # SQL 初始化檔案
│   └── extract_sql.py      # 資料提取腳本
│
├── info/                    # 專案說明文件
└── test/                    # 測試檔案
```

## 🔧 環境變數說明

主要環境變數（請參考 `.env.example` 的完整列表）：

| 變數 | 說明 | 預設值 | 必需 |
|------|------|--------|------|
| `DB_HOST` | 資料庫主機 | `db` | ✅ |
| `DB_PORT` | 資料庫連接埠 | `5432` | ✅ |
| `DB_USERNAME` | 資料庫使用者 | `phantom_user` | ✅ |
| `DB_PASSWORD` | 資料庫密碼 | - | ✅ |
| `DB_NAME` | 資料庫名稱 | `phantom_mask_db` | ✅ |
| `NODE_ENV` | 執行環境 | `development` | ✅ |
| `PORT` | API 服務連接埠 | `3000` | ✅ |
| `JWT_SECRET` | JWT 金鑰 | - | 認證功能需要 |

## 🚀 API 端點

啟動應用後，可以存取以下端點：

- **API 文檔（Swagger）**: `http://localhost:3000/api`
- **健康檢查**: `http://localhost:3000/health`
- **主要 API**: `http://localhost:3000/api/v1/`

### 主要功能模組

- **認證系統** (`/api/auth`): 使用者登入、註冊、JWT 認證
- **商店管理** (`/api/store`): 藥局資訊查詢、庫存管理
- **使用者管理** (`/api/user`): 使用者相關操作

## 📋 開發檢查清單

啟動開發環境前，請確認：

- [ ] 已安裝 Docker 和 Docker Compose
- [ ] 已複製 `.env.example` 為 `.env`
- [ ] 已設定資料庫密碼和其他敏感資訊
- [ ] 已執行 `make quick-start` 或 `docker-compose up -d`
- [ ] 資料庫服務正常運行
- [ ] 已執行 `make migration-run` 建立資料表結構

## 🐛 常見問題

### 1. 服務無法啟動
```bash
# 檢查服務狀態
$ make status

# 查看錯誤日誌
$ make logs

# 重新建置映像檔
$ make build
```

### 2. 資料庫連線失敗
```bash
# 檢查資料庫狀態
$ docker-compose exec db pg_isready -U ${DB_USERNAME}

# 重新啟動資料庫
$ docker-compose restart db
```

### 3. 連接埠衝突
```bash
# 檢查連接埠使用情況
$ lsof -i :3000
$ lsof -i :5432

# 修改 .env 檔案中的 PORT 和 DB_PORT 設定
```

更多問題解決方案，請參考 [Docker Compose 快速參考](./DOCKER_QUICK_REFERENCE.md#故障排除)。

## 🤝 參與貢獻

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📞 支援

如果遇到問題或需要協助：

1. 查看 [Docker Compose 指南](./DOCKER_COMPOSE_GUIDE.md)
2. 檢查 [快速參考](./DOCKER_QUICK_REFERENCE.md)
3. 查看日誌：`make logs` 或 `docker-compose logs`
4. 建立 GitHub Issue

## 📄 授權

本專案使用 MIT 授權。詳見 [LICENSE](../LICENSE) 檔案。

---

*最後更新：2024年9月27日*

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
