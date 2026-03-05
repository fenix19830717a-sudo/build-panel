#!/bin/bash
# BuildAI Framework 启动检查脚本

set -e

echo "========================================"
echo "BuildAI Framework 启动检查"
echo "========================================"
echo ""

# 检查环境变量
echo "[1/4] 检查环境变量..."
required_vars=("DB_HOST" "DB_PORT" "DB_USERNAME" "DB_PASSWORD" "DB_DATABASE" "JWT_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=($var)
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "❌ 缺少环境变量: ${missing_vars[*]}"
  exit 1
fi
echo "✅ 环境变量检查通过"
echo ""

# 检查数据库连接
echo "[2/4] 检查数据库连接..."
MAX_RETRIES=30
RETRY_COUNT=0

while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ 数据库连接失败 (超时)"
    exit 1
  fi
  echo "  等待数据库... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done
echo "✅ 数据库连接成功"
echo ""

# 检查 Redis 连接
echo "[3/4] 检查 Redis 连接..."
if [ -n "$REDIS_HOST" ]; then
  if ! redis-cli -h "$REDIS_HOST" -p "${REDIS_PORT:-6379}" ping > /dev/null 2>&1; then
    echo "⚠️ Redis 连接失败 (非致命错误)"
  else
    echo "✅ Redis 连接成功"
  fi
else
  echo "⚠️ 未配置 Redis"
fi
echo ""

# 检查数据库表
echo "[4/4] 检查数据库表..."
TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | xargs)

if [ -z "$TABLE_COUNT" ] || [ "$TABLE_COUNT" = "0" ]; then
  echo "⚠️ 数据库表未创建 (将自动运行迁移)"
else
  echo "✅ 数据库表已存在 ($TABLE_COUNT 个表)"
fi
echo ""

echo "========================================"
echo "✅ 启动检查完成"
echo "========================================"
echo ""
