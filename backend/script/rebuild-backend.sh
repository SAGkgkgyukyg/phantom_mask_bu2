#!/bin/bash

# Backend Docker 重新建置腳本
# 用於單獨重新建置 backend 容器，保持資料庫容器運行
# 這個腳本會：
# 1. 停止並移除現有的 backend 容器
# 2. 清理舊的 backend 映像檔
# 3. 確保資料庫服務正在運行
# 4. 重新建置 backend 映像檔（無快取）
# 5. 啟動新的 backend 容器

set -e

echo "🔧 Backend Docker 重新建置腳本"
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

# 停止現有的 backend 容器（保持資料庫運行）
echo -e "${YELLOW}🛑 停止現有的 backend 容器...${NC}"
# 只停止 backend 服務，不影響資料庫
docker compose stop backend 2>/dev/null || true
docker compose rm -f backend 2>/dev/null || true

# 也處理其他可能存在的 backend 容器
docker stop phantom_backend_integrated 2>/dev/null || true
docker rm phantom_backend_integrated 2>/dev/null || true
docker stop phantom_backend_rebuild 2>/dev/null || true
docker rm phantom_backend_rebuild 2>/dev/null || true

# 清理舊的 backend 映像檔
echo -e "${YELLOW}🧹 清理舊的 backend 映像檔...${NC}"
docker rmi $(docker images --filter "label=phantom.service=backend" -q) 2>/dev/null || true
docker rmi $(docker images "*backend*" -q) 2>/dev/null || true

# 確保資料庫服務運行且網路存在
echo -e "${BLUE}🗄️ 確保資料庫服務運行...${NC}"
# 檢查資料庫是否運行，如果沒有則啟動
if ! docker compose ps db --status running | grep -q "running"; then
    echo -e "${YELLOW}⚠️  資料庫未運行，正在啟動...${NC}"
    docker compose up -d db
    
    # 等待資料庫就緒
    echo -e "${BLUE}⏳ 等待資料庫就緒...${NC}"
    timeout=60
    counter=0
    while [ $counter -lt $timeout ]; do
        if docker compose exec -T db pg_isready -U ${DB_USERNAME} -d ${DB_NAME} > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 資料庫已就緒${NC}"
            break
        fi
        echo -e "${YELLOW}⏳ 等待資料庫... ($counter/${timeout}s)${NC}"
        sleep 3
        counter=$((counter + 3))
    done
else
    echo -e "${GREEN}✅ 資料庫已在運行中${NC}"
fi

# 確保網路存在
docker network create phantom_network 2>/dev/null || true

# 重新建置 backend
echo -e "${GREEN}🔨 重新建置 backend Docker 映像檔...${NC}"
docker compose build --no-cache backend

# 啟動 backend
echo -e "${GREEN}🚀 啟動 backend 服務...${NC}"
docker compose up -d backend

# 等待服務啟動
echo -e "${BLUE}⏳ 等待 backend 服務啟動...${NC}"
timeout=60  # 減少等待時間到 60 秒
counter=0

while [ $counter -lt $timeout ]; do
    # 檢查容器是否運行中
    if docker compose ps backend --status running --format json 2>/dev/null | grep -q "running"; then
        echo -e "${GREEN}✅ Backend 容器已啟動${NC}"
        sleep 5  # 給應用程式一點時間初始化

        # 簡單檢查端口是否可訪問
        if curl -s -m 3 "http://localhost:${PORT:-3000}/api/docs" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend 服務已成功啟動並可訪問！${NC}"
            echo -e "${GREEN}📖 Swagger 文件：http://localhost:${PORT:-3000}/api/docs${NC}"
            echo -e "${GREEN}🔗 API 端點：http://localhost:${PORT:-3000}${NC}"
            echo -e "${GREEN}🗄️ 資料庫：localhost:${DB_PORT:-5432}${NC}"
            break
        else
            echo -e "${YELLOW}⏳ 等待應用程式初始化...${NC}"
        fi
    fi

    echo -e "${YELLOW}⏳ 等待中... ($counter/${timeout}s)${NC}"
    sleep 5
    counter=$((counter + 5))
done

if [ $counter -ge $timeout ]; then
    echo -e "${YELLOW}⚠️  檢查超時，但容器可能仍在啟動中${NC}"

    # 檢查容器狀態
    echo -e "${BLUE}📋 檢查容器狀態：${NC}"
    docker compose ps

    # 最後檢查服務是否實際可用
    echo -e "${BLUE}🔍 檢查服務是否實際可用...${NC}"
    if curl -s -m 5 "http://localhost:${PORT:-3000}/api/docs" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 服務實際可用！${NC}"
        echo -e "${GREEN}📖 Swagger 文件：http://localhost:${PORT:-3000}/api/docs${NC}"
        echo -e "${GREEN}🔗 API 端點：http://localhost:${PORT:-3000}${NC}"
        echo -e "${YELLOW}⚠️  建議：服務已可用，Docker 健康檢查稍後會通過${NC}"
    else
        echo -e "${RED}❌ 服務無法訪問，請檢查日誌${NC}"
        echo -e "${YELLOW}📋 檢查 backend 容器日誌：${NC}"
        docker compose logs --tail=20 backend
        exit 1
    fi
fi

echo -e "${GREEN}🎉 Backend 重新建置完成！${NC}"
echo ""
echo -e "${BLUE}📋 常用指令：${NC}"
echo -e "  查看所有服務: ${YELLOW}docker compose ps${NC}"
echo -e "  查看 backend 日誌: ${YELLOW}docker compose logs -f backend${NC}"
echo -e "  查看資料庫日誌: ${YELLOW}docker compose logs -f db${NC}"
echo -e "  停止 backend: ${YELLOW}docker compose stop backend${NC}"
echo -e "  重啟 backend: ${YELLOW}docker compose restart backend${NC}"
echo -e "  進入 backend: ${YELLOW}docker compose exec backend /bin/sh${NC}"
echo -e "  進入資料庫: ${YELLOW}docker compose exec db psql -U ${DB_USERNAME} -d ${DB_NAME}${NC}"