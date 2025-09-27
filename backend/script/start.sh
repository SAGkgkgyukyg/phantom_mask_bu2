#!/bin/bash

# Backend 容器啟動腳本
# 確保在應用程式啟動前執行必要的 migration

set -e

echo "🚀 開始啟動 Phantom Mask Backend..."

# 等待資料庫連接就緒
echo "⏳ 等待資料庫連接..."
until pg_isready -h $DB_HOST -p 5432 -U $DB_USERNAME; do
  echo "資料庫尚未準備就緒，等待 2 秒後重試..."
  sleep 2
done

echo "✅ 資料庫連接成功"

# 執行 TypeORM migration
echo "🔄 執行資料庫 migration..."

# 建置應用程式 (如果尚未建置)
if [ ! -d "dist" ]; then
  echo "📦 建置應用程式..."
  npm run build
fi

# 執行 migration
echo "🗄️ 執行 TypeORM migration..."
npm run migration:run

if [ $? -eq 0 ]; then
  echo "✅ Migration 執行成功"
else
  echo "❌ Migration 執行失敗"
  exit 1
fi

# 啟動應用程式
echo "🌟 啟動 NestJS 應用程式..."
exec npm run start:prod