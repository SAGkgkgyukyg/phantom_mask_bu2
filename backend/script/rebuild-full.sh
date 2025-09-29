#!/bin/bash

# Docker Compose 完全重建腳本
# 每次都清除快取重新建置所有服務，請注意！ 這會刪除所有資料
# 這個腳本會：
# 1. 停止並移除所有現有容器
# 2. 清理所有相關的映像檔
# 3. 清理 Docker 建置快取
# 4. 重新建置所有服務（無快取）
# 5. 啟動所有服務

set -e

echo "🔧 Docker Compose 完全重建腳本"
echo "================================"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查 .env 檔案
if [ ! -f .env ]; then
    echo -e "${RED}❌ 找不到 .env 檔案，請先建立環境設定檔${NC}"
    exit 1
fi

echo -e "${BLUE}📋 載入環境變數...${NC}"
source .env

# 停止所有容器並清理
echo -e "${YELLOW}🛑 停止並清理現有容器...${NC}"
docker compose down --remove-orphans --volumes

# 清理相關的 Docker 映像檔
echo -e "${YELLOW}🧹 清理舊的映像檔...${NC}"
docker rmi $(docker images --filter "label=phantom.service" -q) 2>/dev/null || true
docker rmi $(docker images "phantom_mask_bu2-backend" -q) 2>/dev/null || true

# 清理 Docker 系統快取（可選，比較激進）
# echo -e "${YELLOW}🧹 清理 Docker 建置快取...${NC}"
# docker builder prune -f

# 重新建置所有服務（無快取）
echo -e "${GREEN}🔨 重新建置所有服務（無快取）...${NC}"
docker compose build --no-cache --pull

# 啟動所有服務
echo -e "${GREEN}🚀 啟動所有服務...${NC}"
docker compose up -d

# 等待服務啟動
echo -e "${BLUE}⏳ 等待服務啟動...${NC}"
timeout=180  # 增加等待時間，因為是完全重建
counter=0

while [ $counter -lt $timeout ]; do
    # 檢查資料庫是否就緒
    if docker compose exec -T db pg_isready -U ${DB_USERNAME} -d ${DB_NAME} > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 資料庫服務已就緒${NC}"
        
        # 檢查後端服務是否就緒
        if curl -s "http://localhost:${PORT:-3000}/api/docs" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend 服務已成功啟動！${NC}"
            echo -e "${GREEN}📖 Swagger 文件：http://localhost:${PORT:-3000}/api/docs${NC}"
            echo -e "${GREEN}🔗 API 端點：http://localhost:${PORT:-3000}/api${NC}"
            echo -e "${GREEN}🗄️ 資料庫：localhost:${DB_PORT:-5432}${NC}"
            break
        fi
    fi
    
    echo -e "${YELLOW}⏳ 等待中... ($counter/${timeout}s)${NC}"
    sleep 10
    counter=$((counter + 10))
done

if [ $counter -ge $timeout ]; then
    echo -e "${RED}❌ 服務啟動超時！${NC}"
    echo -e "${YELLOW}📋 檢查容器狀態：${NC}"
    docker compose ps
    echo -e "${YELLOW}📋 檢查容器日誌：${NC}"
    docker compose logs --tail=50
    exit 1
fi

echo -e "${GREEN}🎉 完全重建完成！${NC}"
echo ""
echo -e "${BLUE}📋 常用指令：${NC}"
echo -e "  查看服務狀態: ${YELLOW}docker compose ps${NC}"
echo -e "  查看日誌: ${YELLOW}docker compose logs -f${NC}"
echo -e "  停止服務: ${YELLOW}docker compose down${NC}"
echo -e "  進入 backend: ${YELLOW}docker compose exec backend /bin/sh${NC}"
echo -e "  進入資料庫: ${YELLOW}docker compose exec db psql -U ${DB_USERNAME} -d ${DB_NAME}${NC}"