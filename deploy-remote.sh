#!/bin/bash
# BuildAI Framework 远程部署脚本
# 在日本服务器上直接运行此脚本

set -e

echo "========================================"
echo "BuildAI Framework 远程部署脚本"
echo "========================================"
echo ""

# 配置
DEPLOY_DIR="/opt/buildai-framework"
GITHUB_REPO="https://github.com/fenix19830717a-sudo/build-panel.git"
BACKUP_DIR="/opt/backups"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数: 打印状态
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. 检查系统
print_status "检查系统环境..."
if [ "$EUID" -ne 0 ]; then 
    print_error "请使用 root 权限运行此脚本"
    exit 1
fi

# 2. 安装基础工具
print_status "安装基础工具..."
apt-get update -qq
apt-get install -y -qq git curl wget net-tools

# 3. 安装 Docker
print_status "检查并安装 Docker..."
if ! command -v docker &> /dev/null; then
    print_status "安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    usermod -aG docker root
fi
DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
print_status "Docker 版本: $DOCKER_VERSION"

# 4. 安装 Docker Compose
print_status "检查并安装 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    print_status "安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi
COMPOSE_VERSION=$(docker-compose --version | awk '{print $4}')
print_status "Docker Compose 版本: $COMPOSE_VERSION"

# 5. 备份旧版本
print_status "备份旧版本..."
if [ -d "$DEPLOY_DIR" ]; then
    BACKUP_NAME="buildai-backup-$(date +%Y%m%d-%H%M%S)"
    mv "$DEPLOY_DIR" "/opt/$BACKUP_NAME"
    print_status "旧版本已备份到: /opt/$BACKUP_NAME"
fi

# 6. 克隆代码
print_status "克隆最新代码..."
cd /opt
git clone --depth 1 "$GITHUB_REPO" buildai-framework
cd buildai-framework
git log --oneline -3
print_status "代码克隆完成"

# 7. 创建环境配置
print_status "创建环境配置..."

# Controller 环境
cat > framework/controller/.env << EOF
NODE_ENV=production
PORT=8080
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=buildai_$(openssl rand -hex 8)
DB_DATABASE=buildai_controller
JWT_SECRET=$(openssl rand -hex 32)
REDIS_HOST=redis
REDIS_PORT=6379
LOG_LEVEL=info
EOF

print_status "Controller 环境配置已创建"

# 8. 创建 docker-compose.yml
print_status "创建 Docker Compose 配置..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: buildai-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-buildai_secure}
      POSTGRES_DB: buildai_controller
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: buildai-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # BuildAI Controller
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
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres_data:
  redis_data:
EOF

print_status "Docker Compose 配置已创建"

# 9. 启动服务
print_status "启动服务..."
docker-compose up -d --build

# 10. 等待服务启动
print_status "等待服务启动..."
sleep 30

# 11. 检查状态
print_status "检查服务状态..."
echo ""
echo "========================================"
echo "部署状态"
echo "========================================"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 12. 检查 Controller 健康
echo ""
print_status "检查 Controller 健康状态..."
if curl -s http://localhost:8080/health > /dev/null 2&&1 || curl -s http://localhost:8080/api/v1 > /dev/null 2&&1; then
    print_status "✅ Controller 运行正常"
else
    print_warning "Controller 可能还在启动中，请稍后检查"
    docker logs buildai-controller --tail 20
fi

# 13. 完成
echo ""
echo "========================================"
echo "✅ 部署完成!"
echo "========================================"
echo ""
echo "访问地址:"
echo "  Controller API: http://$(curl -s ifconfig.me):8080/api/v1"
echo "  API 文档:       http://$(curl -s ifconfig.me):8080/api/docs"
echo ""
echo "管理命令:"
echo "  查看日志: docker logs -f buildai-controller"
echo "  重启服务: docker-compose restart"
echo "  更新代码: cd $DEPLOY_DIR && git pull && docker-compose up -d --build"
echo ""
echo "备份目录: /opt/backups"
echo "代码目录: $DEPLOY_DIR"
echo ""
