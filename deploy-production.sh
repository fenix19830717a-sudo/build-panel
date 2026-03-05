#!/bin/bash
# BuildAI Framework 生产环境部署脚本
# 在目标服务器上运行

set -e

DEPLOY_DIR="/opt/buildai-framework"
GITHUB_REPO="https://github.com/fenix19830717a-sudo/build-panel.git"

echo "========================================"
echo "BuildAI Framework 生产环境部署"
echo "========================================"
echo ""

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 root 权限运行"
    exit 1
fi

# 1. 安装基础工具
echo "[1/8] 安装基础工具..."
apt-get update -qq
apt-get install -y -qq git curl wget net-tools postgresql-client redis-tools

# 2. 安装 Docker
echo "[2/8] 安装 Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi
docker --version

# 3. 安装 Docker Compose
echo "[3/8] 安装 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi
docker-compose --version

# 4. 备份旧版本
echo "[4/8] 备份旧版本..."
if [ -d "$DEPLOY_DIR" ]; then
    BACKUP_NAME="/opt/buildai-backup-$(date +%Y%m%d-%H%M%S)"
    mv "$DEPLOY_DIR" "$BACKUP_NAME"
    echo "旧版本已备份到: $BACKUP_NAME"
fi

# 5. 克隆最新代码
echo "[5/8] 克隆代码..."
cd /opt
git clone --depth 1 "$GITHUB_REPO" buildai-framework
cd buildai-framework

echo "最新提交:"
git log --oneline -1

# 6. 创建环境配置
echo "[6/8] 创建生产环境配置..."
cd framework/controller

# 生成安全的随机密码
DB_PASSWORD=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)

cat > .env << EOF
NODE_ENV=production
PORT=8080
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=buildai_controller
JWT_SECRET=$JWT_SECRET
REDIS_HOST=redis
REDIS_PORT=6379
LOG_LEVEL=info
EOF

echo "环境配置已创建 (数据库密码已生成)"
cd $DEPLOY_DIR

# 7. 创建 Docker Compose 配置
echo "[7/8] 创建 Docker Compose 配置..."
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: buildai-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: buildai_controller
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - buildai-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: buildai-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - buildai-network
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  controller:
    build:
      context: ./framework/controller
      dockerfile: Dockerfile
    container_name: buildai-controller
    restart: unless-stopped
    env_file:
      - ./framework/controller/.env
    ports:
      - "8080:8080"
    networks:
      - buildai-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/api/v1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  postgres_data:
  redis_data:

networks:
  buildai-network:
    driver: bridge
EOF

# 8. 启动服务
echo "[8/8] 启动服务..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml up -d --build

echo ""
echo "等待服务启动..."
sleep 30

echo ""
echo "服务状态:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "检查日志..."
docker logs buildai-controller --tail 20 2>/dev/null || echo "容器还在启动中..."

# 获取服务器 IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "========================================"
echo "✅ 生产环境部署完成!"
echo "========================================"
echo ""
echo "访问地址:"
echo "  API:      http://$SERVER_IP:8080/api/v1"
echo "  文档:     http://$SERVER_IP:8080/api/docs"
echo ""
echo "管理命令:"
echo "  查看日志: docker logs buildai-controller -f"
echo "  重启服务: docker-compose -f $DEPLOY_DIR/docker-compose.prod.yml restart"
echo "  停止服务: docker-compose -f $DEPLOY_DIR/docker-compose.prod.yml down"
echo ""
echo "数据库密码保存在: $DEPLOY_DIR/framework/controller/.env"
echo "请妥善保管!"
echo ""
