#!/bin/bash

echo "🔍 測試資料庫連接和設定..."
echo "================================"

# 測試資料庫連接
echo "📊 資料庫連接測試："
docker compose exec db psql -U phantom_user -d phantom_mask_db -c "SELECT 
    current_database() as database_name,
    current_user as current_user,
    inet_server_addr() as server_ip,
    inet_server_port() as server_port;"

echo ""
echo "🧩 已安裝的擴充套件："
docker compose exec db psql -U phantom_user -d phantom_mask_db -c "SELECT name, default_version, installed_version FROM pg_available_extensions WHERE installed_version IS NOT NULL;"

echo ""
echo "📋 資料庫清單："
docker compose exec db psql -U phantom_user -d phantom_mask_db -c "\l" 2>/dev/null | grep -E "(phantom|Name|---|^$)"

echo ""
echo "👤 使用者權限："
docker compose exec db psql -U phantom_user -d phantom_mask_db -c "SELECT 
    rolname as username,
    rolsuper as is_superuser,
    rolcreatedb as can_create_db,
    rolcanlogin as can_login
FROM pg_roles 
WHERE rolname = 'phantom_user';"

echo ""
echo "🕐 資料庫時區設定："
docker compose exec db psql -U phantom_user -d phantom_mask_db -c "SELECT current_setting('timezone') as current_timezone;"

echo ""
echo "✅ 資料庫連接測試完成！"