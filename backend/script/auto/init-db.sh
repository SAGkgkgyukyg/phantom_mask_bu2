#!/bin/bash
set -e

# 這個腳本會在 PostgreSQL 容器初始化時執行
# 用來建立自訂的使用者和資料庫

echo "🔧 初始化 PostgreSQL 資料庫和使用者..."

# 檢查環境變數
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
    echo "❌ 錯誤：缺少必要的環境變數"
    echo "需要的環境變數：POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB"
    exit 1
fi

echo "📋 資料庫配置："
echo "  - 使用者: $POSTGRES_USER"
echo "  - 資料庫: $POSTGRES_DB"
echo "  - 主機: $(hostname)"

# 執行 SQL 命令來確保資料庫和使用者設定正確
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- 建立 UUID 擴充套件
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- 顯示目前連接資訊
    SELECT 'Connected to database: ' || current_database() as info;
    SELECT 'Connected as user: ' || current_user as info;
    
    -- 設定時區
    SET timezone = 'Asia/Taipei';
    
    -- 顯示版本資訊
    SELECT version();
EOSQL

echo "✅ 資料庫初始化完成！"
echo "🎉 資料庫 '$POSTGRES_DB' 和使用者 '$POSTGRES_USER' 已準備就緒"