#!/bin/bash
# BuildAI Framework 日本服务器部署脚本 (测试环境)
# 在目标服务器上运行此脚本

set -e

SERVER_IP=$(curl -s ifconfig.me)
DEPLOY_DIR="/opt/buildai-framework-test"
GITHUB_REPO="https://github.com/fenix19830717a-sudo/build-panel.git"

echo "========================================"
echo "BuildAI Framework 部署脚本"
echo "服务器 IP: $SERVER_IP"
echo "模式: 测试环境"
echo "========================================"
echo ""

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 root 权限运行"
    exit 1
fi

# 1. 安装基础工具
echo "[1/7] 安装基础工具..."
apt-get update -qq
apt-get install -y -qq git curl wget net-tools

# 2. 安装 Docker
echo "[2/7] 安装 Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi
docker --version

# 3. 安装 Docker Compose
echo "[3/7] 安装 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi
docker-compose --version

# 4. 克隆代码
echo "[4/7] 克隆代码..."
rm -rf $DEPLOY_DIR
mkdir -p /opt
cd /opt
git clone --depth 1 $GITHUB_REPO buildai-framework-test
cd buildai-framework-test

# 5. 创建环境配置
echo "[5/7] 创建环境配置..."
cd framework/controller
cat > .env << EOF
NODE_ENV=production
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=buildai_test_2024
DB_DATABASE=buildai_controller
JWT_SECRET=$(openssl rand -hex 32)
REDIS_HOST=localhost
REDIS_PORT=6379
LOG_LEVEL=info
EOF

cd $DEPLOY_DIR

# 6. 创建 docker-compose
echo "[6/7] 创建 Docker Compose 配置..."
cat > docker-compose.test.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: buildai-postgres-test
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: buildai_test_2024
      POSTGRES_DB: buildai_controller
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: buildai-redis-test
    restart: unless-stopped
    volumes:
      - redis_test_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    command: redis-server --appendonly yes

  controller:
    build:
      context: ./framework/controller
      dockerfile: Dockerfile
    container_name: buildai-controller-test
    restart: unless-stopped
    env_file:
      - ./framework/controller/.env
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/api/v1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

volumes:
  postgres_test_data:
  redis_test_data:
EOF

# 7. 启动服务
echo "[7/7] 启动服务..."
docker-compose -f docker-compose.test.yml down 2>/dev/null || true
docker-compose -f docker-compose.test.yml up -d --build

echo ""
echo "等待服务启动..."
sleep 15

echo ""
echo "服务状态:"
docker-compose -f docker-compose.test.yml ps

echo ""
echo "========================================"
echo "✅ 部署完成!"
echo "========================================"
echo ""
echo "访问地址:"
echo "  Controller API: http://$SERVER_IP:8080/api/v1"
echo "  API 文档:       http://$SERVER_IP:8080/api/docs"
echo ""
echo "管理命令:"
echo "  查看日志: docker logs buildai-controller-test -f"
echo "  重启服务: docker-compose -f $DEPLOY_DIR/docker-compose.test.yml restart"
echo "  停止服务: docker-compose -f $DEPLOY_DIR/docker-compose.test.yml down"
echo ""
