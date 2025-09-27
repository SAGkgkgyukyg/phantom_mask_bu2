# Phantom Mask Backend - Makefile (修正版)
# 簡化 Docker Compose 操作的便捷工具

.PHONY: help setup up down restart logs build clean db-backup db-restore dev prod test validate-tools

# 預設目標
.DEFAULT_GOAL := help

# 顏色定義
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
RESET := \033[0m

# 專案名稱
PROJECT_NAME := phantom_mask

# Docker Compose 命令（自動偵測）
DOCKER_COMPOSE := $(shell if command -v docker-compose >/dev/null 2>&1; then echo "docker-compose"; else echo "docker compose"; fi)

help: ## 顯示此幫助訊息
	@echo "$(BLUE)Phantom Mask Backend - Docker Compose 管理工具$(RESET)"
	@echo ""
	@echo "$(GREEN)使用方式:$(RESET) make [目標]"
	@echo ""
	@echo "$(YELLOW)🏗️ 分離式架構 (推薦):$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^(db-|backend-|separated-).*:.*?## / {printf "  $(BLUE)%-20s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)🔄 整合式架構 (傳統):$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && !/^(db-|backend-|separated-|help|validate-).*:.*?## / {printf "  $(BLUE)%-20s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)🔧 系統工具:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^validate-.*:.*?## / {printf "  $(BLUE)%-20s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

validate-tools: ## 🔧 驗證所需工具是否可用
	@echo "$(BLUE)🔧 驗證系統工具...$(RESET)"
	@echo ""
	@echo "$(YELLOW)檢查 Docker:$(RESET)"
	@if command -v docker >/dev/null 2>&1; then \
		echo "$(GREEN)✅ Docker: $(shell docker --version)$(RESET)"; \
	else \
		echo "$(RED)❌ Docker 未安裝$(RESET)"; \
		exit 1; \
	fi
	@echo ""
	@echo "$(YELLOW)檢查 Docker Compose:$(RESET)"
	@if command -v docker-compose >/dev/null 2>&1; then \
		echo "$(GREEN)✅ docker-compose: $(shell docker-compose --version)$(RESET)"; \
		echo "$(BLUE)使用命令: docker-compose$(RESET)"; \
	elif docker compose version >/dev/null 2>&1; then \
		echo "$(GREEN)✅ docker compose: $(shell docker compose version)$(RESET)"; \
		echo "$(BLUE)使用命令: docker compose$(RESET)"; \
	else \
		echo "$(RED)❌ Docker Compose 未安裝$(RESET)"; \
		exit 1; \
	fi
	@echo ""
	@echo "$(YELLOW)檢查其他工具:$(RESET)"
	@if command -v curl >/dev/null 2>&1; then \
		echo "$(GREEN)✅ curl: $(shell curl --version | head -n1)$(RESET)"; \
	else \
		echo "$(YELLOW)⚠️  curl 未安裝 (影響健康檢查功能)$(RESET)"; \
	fi
	@if command -v git >/dev/null 2>&1; then \
		echo "$(GREEN)✅ git: $(shell git --version)$(RESET)"; \
	else \
		echo "$(YELLOW)⚠️  git 未安裝 (影響更新功能)$(RESET)"; \
	fi
	@echo ""
	@echo "$(GREEN)🎉 工具驗證完成！使用命令: $(DOCKER_COMPOSE)$(RESET)"

# ==========================================
# 🏗️ 分離式架構命令 (推薦使用)
# ==========================================

separated-init: validate-tools ## 🚀 初始化分離式環境 (資料庫+網路)
	@echo "$(GREEN)🏗️ 初始化分離式架構環境...$(RESET)"
	@if [ ! -f .env ]; then \
		cp .env.example .env && \
		echo "$(YELLOW)📋 已建立 .env 檔案，請修改其中的設定值$(RESET)"; \
	fi
	@mkdir -p backups
	@echo "$(BLUE)🌐 建立共用網路...$(RESET)"
	@docker network create phantom_network 2>/dev/null || echo "$(YELLOW)網路 phantom_network 已存在$(RESET)"
	@make db-start
	@make _init-db-if-needed
	@echo "$(GREEN)✅ 分離式環境初始化完成！$(RESET)"
	@echo "$(BLUE)💡 接下來可以使用 'make backend-start' 啟動後端服務$(RESET)"

db-start: ## 🗄️ 啟動獨立資料庫服務
	@echo "$(GREEN)🗄️ 啟動獨立資料庫服務...$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.db.yml up -d
	@echo "$(GREEN)✅ 資料庫服務啟動完成！$(RESET)"
	@make _wait-for-db

db-stop: ## 🛑 停止資料庫服務 (保留資料)
	@echo "$(YELLOW)🛑 停止資料庫服務...$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.db.yml stop
	@echo "$(GREEN)✅ 資料庫服務已停止$(RESET)"

db-restart: ## 🔄 重新啟動資料庫服務
	@echo "$(YELLOW)🔄 重新啟動資料庫服務...$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.db.yml restart
	@make _wait-for-db
	@echo "$(GREEN)✅ 資料庫服務重新啟動完成！$(RESET)"

db-logs: ## 📋 查看資料庫日誌
	@echo "$(BLUE)📋 查看資料庫日誌:$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.db.yml logs -f

db-shell: ## 🐚 連接到獨立資料庫
	@echo "$(BLUE)🐚 連接到獨立資料庫...$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.db.yml exec db psql -U $${DB_USERNAME:-phantom_user} -d $${DB_NAME:-phantom_mask_db}

db-backup-auto: ## 💾 自動備份資料庫 (含時間戳記)
	@echo "$(GREEN)💾 建立自動資料庫備份...$(RESET)"
	@mkdir -p backups
	@BACKUP_FILE="backups/auto_backup_$(shell date +%Y%m%d_%H%M%S).sql"; \
	$(DOCKER_COMPOSE) -f docker-compose.db.yml exec -T db pg_dump -U $${DB_USERNAME:-phantom_user} $${DB_NAME:-phantom_mask_db} > $$BACKUP_FILE; \
	if [ $$? -eq 0 ]; then \
		echo "$(GREEN)✅ 備份成功儲存至: $$BACKUP_FILE$(RESET)"; \
		echo "$(BLUE)📊 備份檔案大小: $(shell du -h $$BACKUP_FILE 2>/dev/null | cut -f1 || echo 'unknown')$(RESET)"; \
	else \
		echo "$(RED)❌ 備份失敗！$(RESET)"; \
		rm -f $$BACKUP_FILE; \
		exit 1; \
	fi

db-restore-latest: ## 📥 還原最新的自動備份
	@echo "$(GREEN)📥 尋找最新的備份檔案...$(RESET)"
	@LATEST_BACKUP=$$(ls -t backups/auto_backup_*.sql 2>/dev/null | head -n1); \
	if [ -z "$$LATEST_BACKUP" ]; then \
		echo "$(RED)❌ 找不到自動備份檔案！$(RESET)"; \
		exit 1; \
	fi; \
	echo "$(BLUE)📁 找到最新備份: $$LATEST_BACKUP$(RESET)"; \
	echo "$(YELLOW)⚠️  警告：這將覆蓋現有資料庫！$(RESET)"; \
	read -p "確定要還原資料庫嗎？(y/N) " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "$(GREEN)📥 還原資料庫...$(RESET)"; \
		$(DOCKER_COMPOSE) -f docker-compose.db.yml exec -T db psql -U $${DB_USERNAME:-phantom_user} -d $${DB_NAME:-phantom_mask_db} < $$LATEST_BACKUP; \
		if [ $$? -eq 0 ]; then \
			echo "$(GREEN)✅ 資料庫還原完成！$(RESET)"; \
		else \
			echo "$(RED)❌ 資料庫還原失敗！$(RESET)"; \
			exit 1; \
		fi; \
	else \
		echo "$(BLUE)❌ 已取消還原操作$(RESET)"; \
	fi

backend-start: ## 🚀 啟動後端服務 (需要獨立資料庫已運行)
	@echo "$(GREEN)🚀 啟動後端服務...$(RESET)"
	@make _check-db-running
	@$(DOCKER_COMPOSE) -f docker-compose.backend.yml up -d --build
	@echo "$(GREEN)✅ 後端服務啟動完成！$(RESET)"
	@make _wait-for-backend

backend-stop: ## 🛑 停止後端服務
	@echo "$(YELLOW)🛑 停止後端服務...$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.backend.yml stop
	@echo "$(GREEN)✅ 後端服務已停止$(RESET)"

backend-restart: ## 🔄 重新啟動後端服務
	@echo "$(YELLOW)🔄 重新啟動後端服務...$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.backend.yml restart
	@make _wait-for-backend
	@echo "$(GREEN)✅ 後端服務重新啟動完成！$(RESET)"

backend-rebuild: ## 🔨 安全重建後端 (自動備份→重建→驗證)
	@echo "$(GREEN)🔨 開始安全重建後端服務...$(RESET)"
	@echo "$(BLUE)📋 步驟 1/5: 建立備份...$(RESET)"
	@make db-backup-auto
	@echo "$(BLUE)📋 步驟 2/5: 停止舊的後端服務...$(RESET)"
	@make backend-stop 2>/dev/null || true
	@echo "$(BLUE)📋 步驟 3/5: 重新建置映像檔...$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.backend.yml build --no-cache
	@echo "$(BLUE)📋 步驟 4/5: 啟動新的後端服務...$(RESET)"
	@make backend-start
	@echo "$(BLUE)📋 步驟 5/5: 驗證服務狀態...$(RESET)"
	@make separated-health
	@echo "$(GREEN)🎉 後端服務安全重建完成！$(RESET)"

backend-logs: ## 📋 查看後端日誌
	@echo "$(BLUE)📋 查看後端日誌:$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.backend.yml logs -f

backend-shell: ## 🐚 進入後端容器
	@echo "$(BLUE)🐚 進入後端容器...$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.backend.yml exec backend sh

separated-status: ## 📊 查看分離式服務狀態
	@echo "$(BLUE)📊 分離式服務狀態:$(RESET)"
	@echo ""
	@echo "$(YELLOW)資料庫服務:$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.db.yml ps 2>/dev/null || echo "$(RED)❌ 資料庫服務未運行$(RESET)"
	@echo ""
	@echo "$(YELLOW)後端服務:$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.backend.yml ps 2>/dev/null || echo "$(RED)❌ 後端服務未運行$(RESET)"
	@echo ""

separated-health: ## 🏥 檢查分離式服務健康狀態
	@echo "$(BLUE)🏥 檢查分離式服務健康狀態...$(RESET)"
	@echo "$(YELLOW)資料庫健康狀態:$(RESET)"
	@if $(DOCKER_COMPOSE) -f docker-compose.db.yml exec -T db pg_isready -U $${DB_USERNAME:-phantom_user} >/dev/null 2>&1; then \
		echo "$(GREEN)✅ 資料庫服務正常$(RESET)"; \
	else \
		echo "$(RED)❌ 資料庫服務異常$(RESET)"; \
	fi
	@echo "$(YELLOW)後端健康狀態:$(RESET)"
	@if command -v curl >/dev/null 2>&1; then \
		if curl -f http://localhost:$${PORT:-3000}/api/docs >/dev/null 2>&1; then \
			echo "$(GREEN)✅ 後端服務正常$(RESET)"; \
		else \
			echo "$(RED)❌ 後端服務異常或未啟動$(RESET)"; \
		fi; \
	else \
		echo "$(YELLOW)⚠️  無法檢查後端健康狀態 (curl 未安裝)$(RESET)"; \
	fi

separated-logs: ## 📋 查看所有分離式服務日誌
	@echo "$(BLUE)📋 查看所有分離式服務日誌:$(RESET)"
	@echo "$(YELLOW)=== 資料庫日誌 ====$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.db.yml logs --tail=20 2>/dev/null || echo "資料庫服務未運行"
	@echo ""
	@echo "$(YELLOW)=== 後端日誌 ====$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.backend.yml logs --tail=20 2>/dev/null || echo "後端服務未運行"

separated-down: ## 🛑 停止所有分離式服務 (保留資料)
	@echo "$(YELLOW)🛑 停止所有分離式服務...$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.backend.yml down 2>/dev/null || true
	@$(DOCKER_COMPOSE) -f docker-compose.db.yml down 2>/dev/null || true
	@echo "$(GREEN)✅ 所有分離式服務已停止$(RESET)"

separated-clean: ## 🧹 清理分離式服務 (保留資料和網路)
	@echo "$(YELLOW)🧹 清理分離式服務容器...$(RESET)"
	@$(DOCKER_COMPOSE) -f docker-compose.backend.yml down --rmi local 2>/dev/null || true
	@$(DOCKER_COMPOSE) -f docker-compose.db.yml down 2>/dev/null || true
	@echo "$(GREEN)✅ 分離式服務清理完成（資料已保留）$(RESET)"

separated-destroy: ## ⚠️ 完全清理分離式環境 (包含資料!)
	@echo "$(RED)⚠️  警告：這將刪除所有分離式服務的資料！$(RESET)"
	@read -p "確定要完全清理環境嗎？輸入 'DELETE' 確認: " confirm; \
	if [ "$$confirm" = "DELETE" ]; then \
		echo "$(YELLOW)🗑️ 完全清理分離式環境...$(RESET)"; \
		$(DOCKER_COMPOSE) -f docker-compose.backend.yml down -v --rmi all 2>/dev/null || true; \
		$(DOCKER_COMPOSE) -f docker-compose.db.yml down -v --rmi all 2>/dev/null || true; \
		docker network rm phantom_network 2>/dev/null || true; \
		docker volume rm phantom_db_data 2>/dev/null || true; \
		echo "$(GREEN)✅ 分離式環境已完全清理$(RESET)"; \
	else \
		echo "$(BLUE)❌ 已取消清理操作$(RESET)"; \
	fi

# ==========================================
# 🔄 整合式架構命令 (傳統模式)
# ==========================================

setup: ## 初始化專案環境
	@make validate-tools
	@echo "$(GREEN)🚀 初始化 Phantom Mask Backend 環境...$(RESET)"
	@if [ ! -f .env ]; then \
		cp .env.example .env && \
		echo "$(YELLOW)📋 已建立 .env 檔案，請修改其中的設定值$(RESET)"; \
	else \
		echo "$(BLUE)📋 .env 檔案已存在$(RESET)"; \
	fi
	@mkdir -p backups
	@echo "$(GREEN)✅ 環境設定完成！請檢查並修改 .env 檔案中的設定$(RESET)"

up: ## 啟動所有服務 (整合模式)
	@echo "$(GREEN)🚀 啟動所有服務...$(RESET)"
	@$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✅ 服務啟動完成！$(RESET)"
	@make status

down: ## 停止所有服務 (整合模式)
	@echo "$(YELLOW)🛑 停止所有服務...$(RESET)"
	@$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✅ 服務已停止$(RESET)"

restart: ## 重新啟動所有服務 (整合模式)
	@echo "$(YELLOW)🔄 重新啟動所有服務...$(RESET)"
	@$(DOCKER_COMPOSE) restart
	@echo "$(GREEN)✅ 服務重新啟動完成！$(RESET)"
	@make status

status: ## 檢查服務狀態 (整合模式)
	@echo "$(BLUE)📊 服務狀態:$(RESET)"
	@$(DOCKER_COMPOSE) ps

logs: ## 查看所有服務日誌 (整合模式)
	@echo "$(BLUE)📋 查看服務日誌:$(RESET)"
	@$(DOCKER_COMPOSE) logs --tail=50 -f

logs-backend: ## 查看後端日誌 (整合模式)
	@echo "$(BLUE)📋 查看後端日誌:$(RESET)"
	@$(DOCKER_COMPOSE) logs --tail=50 -f backend

logs-db: ## 查看資料庫日誌 (整合模式)
	@echo "$(BLUE)📋 查看資料庫日誌:$(RESET)"
	@$(DOCKER_COMPOSE) logs --tail=50 -f db

build: ## 重新建置所有映像檔 (整合模式)
	@echo "$(GREEN)🔨 重新建置映像檔...$(RESET)"
	@$(DOCKER_COMPOSE) build --no-cache
	@echo "$(GREEN)✅ 映像檔建置完成！$(RESET)"

build-backend: ## 只重新建置後端映像檔 (整合模式)
	@echo "$(GREEN)🔨 重新建置後端映像檔...$(RESET)"
	@$(DOCKER_COMPOSE) build --no-cache backend
	@echo "$(GREEN)✅ 後端映像檔建置完成！$(RESET)"

shell-backend: ## 進入後端容器 shell (整合模式)
	@echo "$(BLUE)🐚 進入後端容器...$(RESET)"
	@$(DOCKER_COMPOSE) exec backend sh

shell-db: ## 進入資料庫容器 (整合模式)
	@echo "$(BLUE)🐚 連接到資料庫...$(RESET)"
	@$(DOCKER_COMPOSE) exec db psql -U $${DB_USERNAME:-phantom_user} -d $${DB_NAME:-phantom_mask_db}

db-backup: ## 備份資料庫 (整合模式)
	@echo "$(GREEN)💾 建立資料庫備份...$(RESET)"
	@mkdir -p backups
	@BACKUP_FILE="backups/backup_$(shell date +%Y%m%d_%H%M%S).sql"; \
	$(DOCKER_COMPOSE) exec -T db pg_dump -U $${DB_USERNAME:-phantom_user} $${DB_NAME:-phantom_mask_db} > $$BACKUP_FILE; \
	echo "$(GREEN)✅ 備份已儲存至: $$BACKUP_FILE$(RESET)"

db-restore: ## 還原資料庫 (使用方式: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ 請指定備份檔案：make db-restore FILE=backup.sql$(RESET)"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		echo "$(RED)❌ 找不到檔案: $(FILE)$(RESET)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)⚠️  警告：這將覆蓋現有資料庫！$(RESET)"
	@read -p "確定要還原資料庫嗎？(y/N) " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "$(GREEN)📥 還原資料庫...$(RESET)"; \
		$(DOCKER_COMPOSE) exec -T db psql -U $${DB_USERNAME:-phantom_user} -d $${DB_NAME:-phantom_mask_db} < $(FILE); \
		echo "$(GREEN)✅ 資料庫還原完成！$(RESET)"; \
	else \
		echo "$(BLUE)❌ 已取消還原操作$(RESET)"; \
	fi

# ==========================================
# 🔧 開發和維護工具
# ==========================================

dev: ## 啟動開發環境（僅資料庫）
	@echo "$(GREEN)💻 啟動開發環境...$(RESET)"
	@if [ ! -f docker-compose.dev.yml ]; then \
		echo "services:\n  db:\n    image: postgres:15\n    container_name: phantom_db_dev\n    environment:\n      POSTGRES_USER: \$${DB_USERNAME}\n      POSTGRES_PASSWORD: \$${DB_PASSWORD}\n      POSTGRES_DB: \$${DB_NAME}\n    ports:\n      - \"\$${DB_PORT}:5432\"\n    volumes:\n      - db_data_dev:/var/lib/postgresql/data\n      - ./extractDB/sql:/docker-entrypoint-initdb.d\n\nvolumes:\n  db_data_dev:" > docker-compose.dev.yml; \
		echo "$(YELLOW)📋 已建立 docker-compose.dev.yml$(RESET)"; \
	fi
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml up -d db
	@echo "$(GREEN)✅ 開發環境啟動完成！$(RESET)"
	@echo "$(BLUE)💡 現在可以使用 'npm run start:dev' 啟動後端服務$(RESET)"

prod: ## 啟動生產環境
	@echo "$(GREEN)🏭 啟動生產環境...$(RESET)"
	@NODE_ENV=production $(DOCKER_COMPOSE) up -d --build
	@echo "$(GREEN)✅ 生產環境啟動完成！$(RESET)"
	@make status

migration-run: ## 執行資料庫 migration
	@echo "$(GREEN)🗂️  執行資料庫 migration...$(RESET)"
	@if $(DOCKER_COMPOSE) ps 2>/dev/null | grep -q phantom_backend_integrated; then \
		$(DOCKER_COMPOSE) exec backend npm run migration:run; \
	elif $(DOCKER_COMPOSE) -f docker-compose.backend.yml ps 2>/dev/null | grep -q phantom_backend_dev; then \
		$(DOCKER_COMPOSE) -f docker-compose.backend.yml exec backend npm run migration:run; \
	else \
		echo "$(RED)❌ 找不到運行中的後端服務$(RESET)"; \
		echo "$(YELLOW)💡 請先啟動後端服務：make backend-start 或 make up$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Migration 執行完成！$(RESET)"

migration-revert: ## 回滾資料庫 migration
	@echo "$(YELLOW)⏪ 回滾資料庫 migration...$(RESET)"
	@if $(DOCKER_COMPOSE) ps 2>/dev/null | grep -q phantom_backend_integrated; then \
		$(DOCKER_COMPOSE) exec backend npm run migration:revert; \
	elif $(DOCKER_COMPOSE) -f docker-compose.backend.yml ps 2>/dev/null | grep -q phantom_backend_dev; then \
		$(DOCKER_COMPOSE) -f docker-compose.backend.yml exec backend npm run migration:revert; \
	else \
		echo "$(RED)❌ 找不到運行中的後端服務$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Migration 回滾完成！$(RESET)"

migration-generate: ## 產生新的 migration (使用方式: make migration-generate NAME=AddUserTable)
	@if [ -z "$(NAME)" ]; then \
		echo "$(RED)❌ 請指定 migration 名稱：make migration-generate NAME=AddUserTable$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)📝 產生新的 migration: $(NAME)...$(RESET)"
	@if $(DOCKER_COMPOSE) ps 2>/dev/null | grep -q phantom_backend_integrated; then \
		$(DOCKER_COMPOSE) exec backend npm run migration:generate -- src/migrations/$(NAME); \
	elif $(DOCKER_COMPOSE) -f docker-compose.backend.yml ps 2>/dev/null | grep -q phantom_backend_dev; then \
		$(DOCKER_COMPOSE) -f docker-compose.backend.yml exec backend npm run migration:generate -- src/migrations/$(NAME); \
	else \
		echo "$(RED)❌ 找不到運行中的後端服務$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Migration 檔案已產生！$(RESET)"

test: ## 執行測試
	@echo "$(GREEN)🧪 執行測試...$(RESET)"
	@if $(DOCKER_COMPOSE) ps 2>/dev/null | grep -q phantom_backend_integrated; then \
		$(DOCKER_COMPOSE) exec backend npm run test; \
	elif $(DOCKER_COMPOSE) -f docker-compose.backend.yml ps 2>/dev/null | grep -q phantom_backend_dev; then \
		$(DOCKER_COMPOSE) -f docker-compose.backend.yml exec backend npm run test; \
	else \
		echo "$(RED)❌ 找不到運行中的後端服務$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ 測試完成！$(RESET)"

test-e2e: ## 執行端對端測試
	@echo "$(GREEN)🧪 執行端對端測試...$(RESET)"
	@if $(DOCKER_COMPOSE) ps 2>/dev/null | grep -q phantom_backend_integrated; then \
		$(DOCKER_COMPOSE) exec backend npm run test:e2e; \
	elif $(DOCKER_COMPOSE) -f docker-compose.backend.yml ps 2>/dev/null | grep -q phantom_backend_dev; then \
		$(DOCKER_COMPOSE) -f docker-compose.backend.yml exec backend npm run test:e2e; \
	else \
		echo "$(RED)❌ 找不到運行中的後端服務$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ E2E 測試完成！$(RESET)"

health: ## 檢查服務健康狀態
	@echo "$(BLUE)🏥 檢查服務健康狀態...$(RESET)"
	@echo "$(YELLOW)後端服務:$(RESET)"
	@if command -v curl >/dev/null 2>&1; then \
		if curl -s http://localhost:$${PORT:-3000}/api/docs >/dev/null 2>&1; then \
			echo "$(GREEN)✅ 後端服務正常$(RESET)"; \
		else \
			echo "$(RED)❌ 後端服務無回應$(RESET)"; \
		fi; \
	else \
		echo "$(YELLOW)⚠️  無法檢查後端狀態 (curl 未安裝)$(RESET)"; \
	fi
	@echo "$(YELLOW)資料庫服務:$(RESET)"
	@if $(DOCKER_COMPOSE) ps 2>/dev/null | grep -q phantom_db_integrated; then \
		$(DOCKER_COMPOSE) exec db pg_isready -U $${DB_USERNAME:-phantom_user} && echo "$(GREEN)✅ 資料庫服務正常$(RESET)" || echo "$(RED)❌ 資料庫服務異常$(RESET)"; \
	elif $(DOCKER_COMPOSE) -f docker-compose.db.yml ps 2>/dev/null | grep -q phantom_db_persistent; then \
		$(DOCKER_COMPOSE) -f docker-compose.db.yml exec db pg_isready -U $${DB_USERNAME:-phantom_user} && echo "$(GREEN)✅ 資料庫服務正常$(RESET)" || echo "$(RED)❌ 資料庫服務異常$(RESET)"; \
	else \
		echo "$(RED)❌ 找不到運行中的資料庫服務$(RESET)"; \
	fi

monitor: ## 監控容器資源使用情況
	@echo "$(BLUE)📊 容器資源監控 (按 Ctrl+C 結束):$(RESET)"
	@docker stats

clean: ## 清理未使用的 Docker 資源
	@echo "$(YELLOW)🧹 清理 Docker 資源...$(RESET)"
	@read -p "這將清理所有未使用的 Docker 映像檔、容器和網路。繼續嗎？(y/N) " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker system prune -a -f; \
		echo "$(GREEN)✅ 清理完成！$(RESET)"; \
	else \
		echo "$(BLUE)❌ 已取消清理操作$(RESET)"; \
	fi

clean-all: ## 清理所有資源（包含 volumes）
	@echo "$(RED)⚠️  警告：這將刪除所有資料！$(RESET)"
	@read -p "確定要刪除所有容器、映像檔和資料嗎？(y/N) " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		$(DOCKER_COMPOSE) down -v --rmi all 2>/dev/null || true; \
		docker system prune -a -f; \
		echo "$(GREEN)✅ 完全清理完成！$(RESET)"; \
	else \
		echo "$(BLUE)❌ 已取消清理操作$(RESET)"; \
	fi

config: ## 檢查 Docker Compose 配置
	@echo "$(BLUE)⚙️  Docker Compose 配置:$(RESET)"
	@$(DOCKER_COMPOSE) config

update: ## 更新專案（拉取最新代碼並重新建置）
	@echo "$(GREEN)🔄 更新專案...$(RESET)"
	@if command -v git >/dev/null 2>&1; then \
		make db-backup; \
		git pull origin main; \
		make build; \
		make up; \
		echo "$(GREEN)✅ 專案更新完成！$(RESET)"; \
	else \
		echo "$(RED)❌ Git 未安裝，無法更新專案$(RESET)"; \
		exit 1; \
	fi

quick-start: setup up ## 快速開始（設定環境並啟動服務）
	@echo "$(GREEN)🎉 Phantom Mask Backend 已準備就緒！$(RESET)"
	@echo "$(BLUE)💡 接下來可以：$(RESET)"
	@echo "   • 查看服務狀態: make status"
	@echo "   • 查看日誌: make logs"
	@echo "   • 進入後端容器: make shell-backend"
	@echo "   • 執行 migration: make migration-run"

quick-start-separated: separated-init backend-start ## 🚀 快速開始分離式架構
	@echo "$(GREEN)🎉 分離式 Phantom Mask Backend 已準備就緒！$(RESET)"
	@echo "$(BLUE)💡 分離式架構優勢：$(RESET)"
	@echo "   • 資料庫獨立運行，資料更安全"
	@echo "   • 後端可隨時重建而不影響資料"
	@echo "   • 開發時可只重新部署需要的服務"
	@echo ""
	@echo "$(BLUE)💡 常用命令：$(RESET)"
	@echo "   • 查看服務狀態: make separated-status"
	@echo "   • 安全重建後端: make backend-rebuild"
	@echo "   • 執行 migration: make migration-run"
	@echo "   • 檢查健康狀態: make separated-health"

validate-makefile: ## 🔧 驗證 Makefile 所有命令
	@echo "$(BLUE)🔧 驗證 Makefile 所有命令...$(RESET)"
	@echo ""
	@echo "$(YELLOW)檢查語法...$(RESET)"
	@make -n help >/dev/null 2>&1 && echo "$(GREEN)✅ Makefile 語法正確$(RESET)" || echo "$(RED)❌ Makefile 語法錯誤$(RESET)"
	@echo ""
	@echo "$(YELLOW)檢查所有目標...$(RESET)"
	@TARGETS=$$(make -qp | grep -E '^[a-zA-Z_-]+:' | grep -v '^#' | cut -d':' -f1 | sort -u); \
	for target in $$TARGETS; do \
		if [ "$$target" != "Makefile" ] && [ "$$target" != ".PHONY" ]; then \
			if make -n "$$target" >/dev/null 2>&1; then \
				echo "$(GREEN)✅ $$target$(RESET)"; \
			else \
				echo "$(RED)❌ $$target$(RESET)"; \
			fi; \
		fi; \
	done

# ==========================================
# 🔧 輔助函數
# ==========================================

_check-db-running: ## 內部：檢查資料庫是否運行
	@if ! $(DOCKER_COMPOSE) -f docker-compose.db.yml ps 2>/dev/null | grep -q "phantom_db_persistent.*Up"; then \
		echo "$(RED)❌ 資料庫服務未運行！請先執行 'make db-start'$(RESET)"; \
		exit 1; \
	fi

_wait-for-db: ## 內部：等待資料庫就緒
	@echo "$(BLUE)⏳ 等待資料庫服務就緒...$(RESET)"
	@timeout=60; \
	while [ $$timeout -gt 0 ]; do \
		if $(DOCKER_COMPOSE) -f docker-compose.db.yml exec -T db pg_isready -U $${DB_USERNAME:-phantom_user} >/dev/null 2>&1; then \
			echo "$(GREEN)✅ 資料庫服務就緒！$(RESET)"; \
			break; \
		fi; \
		sleep 2; \
		timeout=$$((timeout-2)); \
	done; \
	if [ $$timeout -le 0 ]; then \
		echo "$(RED)❌ 資料庫服務啟動超時$(RESET)"; \
		exit 1; \
	fi

_wait-for-backend: ## 內部：等待後端服務就緒
	@echo "$(BLUE)⏳ 等待後端服務就緒...$(RESET)"
	@if command -v curl >/dev/null 2>&1; then \
		timeout=60; \
		while [ $$timeout -gt 0 ]; do \
			if curl -f http://localhost:$${PORT:-3000}/api/docs >/dev/null 2>&1; then \
				echo "$(GREEN)✅ 後端服務就緒！$(RESET)"; \
				break; \
			fi; \
			sleep 2; \
			timeout=$$((timeout-2)); \
		done; \
		if [ $$timeout -le 0 ]; then \
			echo "$(RED)❌ 後端服務啟動超時$(RESET)"; \
			exit 1; \
		fi; \
	else \
		echo "$(YELLOW)⚠️  無法驗證後端服務狀態 (curl 未安裝)，等待 10 秒...$(RESET)"; \
		sleep 10; \
	fi

# 隱藏目標（不在 help 中顯示）
_check-env:
	@if [ ! -f .env ]; then \
		echo "$(RED)❌ 找不到 .env 檔案，請先執行 'make setup'$(RESET)"; \
		exit 1; \
	fi

_init-db-if-needed: ## 內部：檢查並初始化資料庫
	@echo "$(BLUE)🗂️  檢查資料庫是否需要初始化...$(RESET)"
	@if ! $(DOCKER_COMPOSE) -f docker-compose.db.yml exec -T db psql -U $${DB_USERNAME:-phantom_user} -d $${DB_NAME:-phantom_mask_db} -c "SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename != 'migrations' LIMIT 1;" | grep -q "1" 2>/dev/null; then \
		echo "$(YELLOW)📋 資料庫為空，開始初始化...$(RESET)"; \
		echo "$(BLUE)🚀 啟動臨時後端容器以執行 migration...$(RESET)"; \
		$(DOCKER_COMPOSE) -f docker-compose.backend.yml up -d --no-deps --build backend; \
		echo "$(BLUE)⏳ 等待後端容器啟動...$(RESET)"; \
		sleep 20; \
		echo "$(GREEN)🗂️  只執行基礎資料表 migration...$(RESET)"; \
		if $(DOCKER_COMPOSE) -f docker-compose.backend.yml exec backend npx typeorm migration:run -d dist/data-source.js --transaction each; then \
			echo "$(GREEN)✅ 資料庫基礎結構初始化完成！$(RESET)"; \
		else \
			echo "$(YELLOW)⚠️  Migration 有部分問題，但基礎結構可能已建立$(RESET)"; \
		fi; \
		echo "$(BLUE)🛑 停止臨時後端容器...$(RESET)"; \
		$(DOCKER_COMPOSE) -f docker-compose.backend.yml stop backend; \
	else \
		echo "$(GREEN)✅ 資料庫已存在，跳過初始化$(RESET)"; \
	fi