#!/bin/bash

# Docker 建置測試腳本
# 測試 Docker Compose 建置流程

set -e

echo "🧪 開始測試 Docker 建置流程..."

# 停止並清理現有容器
echo "🧹 清理現有容器..."
docker compose down -v --remove-orphans

# 清理 Docker image（可選）
# docker rmi $(docker images "phantom*" -q) 2>/dev/null || true

# 重建並啟動容器
echo "🏗️ 重建並啟動容器..."
docker compose up -d --build

# 監控容器啟動狀態
echo "📊 監控容器啟動狀態..."

# 等待資料庫容器健康檢查通過
echo "⏳ 等待資料庫健康檢查..."
while [ "$(docker inspect --format='{{.State.Health.Status}}' phantom_db_integrated)" != "healthy" ]; do
    echo "資料庫健康檢查狀態: $(docker inspect --format='{{.State.Health.Status}}' phantom_db_integrated)"
    sleep 5
done

echo "✅ 資料庫容器健康檢查通過"

# 等待後端容器健康檢查通過
echo "⏳ 等待後端健康檢查..."
timeout=20  # 5 分鐘超時
elapsed=0
while [ "$(docker inspect --format='{{.State.Health.Status}}' phantom_backend_integrated 2>/dev/null || echo 'starting')" != "healthy" ] && [ $elapsed -lt $timeout ]; do
    status=$(docker inspect --format='{{.State.Health.Status}}' phantom_backend_integrated 2>/dev/null || echo 'starting')
    echo "後端健康檢查狀態: $status (等待時間: ${elapsed}s)"
    
    # 顯示後端容器日誌（最後 10 行）
    echo "📋 後端容器日誌："
    docker logs --tail 10 phantom_backend_integrated
    
    sleep 10
    elapsed=$((elapsed + 10))
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ 後端容器健康檢查超時"
    echo "📋 完整後端容器日誌："
    docker logs phantom_backend_integrated
    exit 1
fi

echo "✅ 後端容器健康檢查通過"

# 測試 API 端點
echo "🧪 測試 API 端點..."

# 測試登入端點
echo "🔐 測試登入端點..."
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"userName": "admin", "password": "admin123"}' \
  http://localhost:3000/auth/login || echo "ERROR")

if [[ $LOGIN_RESPONSE == *"accessToken"* ]]; then
    echo "✅ 登入端點測試成功"
    # 提取 access token
    ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo "🔑 取得 Access Token: ${ACCESS_TOKEN:0:50}..."
    
    # 測試受保護的端點
    echo "🏪 測試商店端點..."
    STORES_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
      http://localhost:3000/stores || echo "ERROR")
    
    if [[ $STORES_RESPONSE == *"["* ]]; then
        echo "✅ 商店端點測試成功"
    else
        echo "⚠️ 商店端點測試失敗"
        echo "回應: $STORES_RESPONSE"
    fi
else
    echo "❌ 登入端點測試失敗"
    echo "回應: $LOGIN_RESPONSE"
fi

# 顯示容器狀態
echo "📊 容器狀態："
docker compose ps

echo "🎉 Docker 建置流程測試完成！"