#!/bin/bash

# 檢查和驗證 .env 檔案中的資料庫設定

echo "🔍 檢查 .env 檔案中的資料庫設定..."

if [ ! -f .env ]; then
    echo "❌ 找不到 .env 檔案"
    exit 1
fi

echo "📋 目前的資料庫設定："
echo "================================"

# 讀取並顯示環境變數
source .env

echo "DB_HOST: ${DB_HOST:-未設定}"
echo "DB_PORT: ${DB_PORT:-未設定}"
echo "DB_USERNAME: ${DB_USERNAME:-未設定}"
echo "DB_PASSWORD: ${DB_PASSWORD:-未設定}"
echo "DB_NAME: ${DB_NAME:-未設定}"

echo "================================"

# 檢查必要變數
missing_vars=()

if [ -z "$DB_USERNAME" ]; then
    missing_vars+=("DB_USERNAME")
fi

if [ -z "$DB_PASSWORD" ]; then
    missing_vars+=("DB_PASSWORD")
fi

if [ -z "$DB_NAME" ]; then
    missing_vars+=("DB_NAME")
fi

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ 缺少必要的環境變數："
    printf "   - %s\n" "${missing_vars[@]}"
    exit 1
else
    echo "✅ 所有必要的資料庫環境變數都已設定"
fi

echo ""
echo "🚀 準備啟動 Docker 服務..."
echo "將會建立："
echo "  - PostgreSQL 使用者: $DB_USERNAME"
echo "  - PostgreSQL 資料庫: $DB_NAME"
echo "  - 監聽埠號: $DB_PORT"