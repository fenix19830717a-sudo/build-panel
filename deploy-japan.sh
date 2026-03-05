#!/bin/bash
# BuildAI Framework 部署脚本 - 日本服务器 (206.119.160.31)

set -e

SERVER_IP="206.119.160.31"
SERVER_USER="root"
DEPLOY_DIR="/opt/buildai-framework"
GITHUB_REPO="https://github.com/fenix19830717a-sudo/build-panel.git"

echo "========================================"
echo "BuildAI Framework 部署脚本"
echo "目标服务器: $SERVER_IP"
echo "========================================"
echo ""

# 检查 SSH 连接
echo "[1/8] 检查 SSH 连接..."
if ! ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'SSH OK'" 2>/dev/null; then
    echo "❌ SSH 连接失败，请检查:"
    echo "   - 服务器 IP: $SERVER_IP"
    echo "   - SSH 密钥配置"
    exit 1
fi
echo "✅ SSH 连接成功"
echo ""

# 备份旧版本
echo "[2/8] 备份旧版本..."
ssh $SERVER_USER@$SERVER_IP "
    if [ -d $DEPLOY_DIR ]; then
        BACKUP_DIR=\"/opt/buildai-backup-\$(date +%Y%m%d-%H%M%S)\"
        mv $DEPLOY_DIR \$BACKUP_DIR
        echo \"旧版本已备份到: \$BACKUP_DIR\"
    fi
" || true
echo "✅ 备份完成"
echo ""

# 克隆最新代码
echo "[3/8] 克隆最新代码..."
ssh $SERVER_USER@$SERVER_IP "
    cd /opt
    git clone --depth 1 $GITHUB_REPO buildai-framework
    cd buildai-framework
    git log --oneline -3
"
echo "✅ 代码克隆完成"
echo ""

# 安装 Docker (如果不存在)
echo "[4/8] 检查 Docker..."
ssh $SERVER_USER@$SERVER_IP "
    if ! command -v docker &> /dev/null; then
        echo '安装 Docker...'
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    fi
    docker --version
"
echo "✅ Docker 检查完成"
echo ""

# 安装 Docker Compose
echo "[5/8] 检查 Docker Compose..."
ssh $SERVER_USER@$SERVER_IP "
    if ! command -v docker-compose &> /dev/null; then
        curl -L \"https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    docker-compose --version
"
echo "✅ Docker Compose 检查完成"
echo ""

# 创建环境配置
echo "[6/8] 创建环境配置..."
ssh $SERVER_USER@$SERVER_IP "
    cd $DEPLOY_DIR
    
    # Controller 环境配置
    if [ ! -f framework/controller/.env ]; then
        cat > framework/controller/.env << 'EOF'
NODE_ENV=production
PORT=8080
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=buildai_secure_password
DB_DATABASE=buildai_controller
JWT_SECRET=$(openssl rand -hex 32)
REDIS_HOST=redis
REDIS_PORT=6379
EOF
    fi
    
    # WebsiteTemplate Backend 环境配置
    if [ ! -f apps/website-template/backend/.env ]; then
        cat > apps/website-template/backend/.env << 'EOF'
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=buildai_secure_password
DB_DATABASE=buildai_website_template
JWT_SECRET=$(openssl rand -hex 32)
EOF
    fi
"
echo "✅ 环境配置创建完成"
echo ""

# 启动服务
echo "[7/8] 启动服务..."
ssh $SERVER_USER@$SERVER_IP "
    cd $DEPLOY_DIR
    
    # 创建 docker network
    docker network create buildai-network 2>/dev/null || true
    
    # 启动基础设施 (PostgreSQL, Redis)
    docker-compose -f docker-compose.infra.yml up -d 2>/dev/null || \
        docker run -d --name postgres \
            -e POSTGRES_PASSWORD=buildai_secure_password \
            -e POSTGRES_DB=buildai_controller \
            -v postgres_data:/var/lib/postgresql/data \
            -p 5432:5432 \
            --network buildai-network \
            postgres:15-alpine
    
    docker run -d --name redis \
        -v redis_data:/data \
        -p 6379:6379 \
        --network buildai-network \
        redis:7-alpine \
        redis-server --appendonly yes
    
    echo '基础设施已启动'
"
echo "✅ 基础设施启动完成"
echo ""

# 构建和启动应用
echo "[8/8] 构建和启动应用..."
ssh $SERVER_USER@$SERVER_IP "
    cd $DEPLOY_DIR
    
    # 构建 Controller
    echo '构建 Controller...'
    cd framework/controller
    docker build -t buildai-controller:latest .
    docker stop buildai-controller 2>/dev/null || true
    docker rm buildai-controller 2>/dev/null || true
    docker run -d --name buildai-controller \
        --env-file .env \
        -p 8080:8080 \
        --network buildai-network \
        buildai-controller:latest
    
    echo 'Controller 已启动: http://$SERVER_IP:8080'
"
echo "✅ 应用启动完成"
echo ""

# 部署状态检查
echo "========================================"
echo "部署状态检查"
echo "========================================"
ssh $SERVER_USER@$SERVER_IP "
    echo '运行中的容器:'
    docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    echo ''
    echo '服务端口:'
    echo '  Controller: http://$SERVER_IP:8080'
    echo '  PostgreSQL: localhost:5432'
    echo '  Redis: localhost:6379'
"
echo ""
echo "========================================"
echo "✅ 部署完成!"
echo "========================================"
echo ""
echo "访问地址:"
echo "  Controller API: http://$SERVER_IP:8080/api/v1"
echo "  API 文档: http://$SERVER_IP:8080/api/docs"
echo ""
echo "管理命令:"
echo "  查看日志: ssh $SERVER_USER@$SERVER_IP 'docker logs buildai-controller'"
echo "  重启服务: ssh $SERVER_USER@$SERVER_IP 'docker restart buildai-controller'"
echo "  更新代码: ./deploy-update.sh"
