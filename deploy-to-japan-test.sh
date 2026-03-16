#!/bin/bash
# BuildAI Framework 部署到日本服务器 - 测试环境

SERVER_IP="206.119.160.31"
SERVER_USER="root"
SERVER_PASS="Fenix19830717A@123"
DEPLOY_DIR="/opt/buildai-framework-test"
GITHUB_REPO="https://github.com/fenix19830717a-sudo/build-panel.git"

echo "========================================"
echo "BuildAI Framework 部署到日本服务器"
echo "服务器: $SERVER_IP"
echo "模式: 测试环境 (无域名)"
echo "========================================"
echo ""

# 使用 sshpass 自动输入密码
if ! command -v sshpass &> /dev/null; then
    echo "安装 sshpass..."
    apt-get update -qq && apt-get install -y -qq sshpass
fi

# SSH 选项
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

# 1. 检查连接
echo "[1/6] 连接服务器..."
sshpass -p "$SERVER_PASS" ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "echo '连接成功'"
if [ $? -ne 0 ]; then
    echo "❌ 连接失败"
    exit 1
fi
echo "✅ 连接成功"
echo ""

# 2. 安装 Docker
echo "[2/6] 安装 Docker..."
sshpass -p "$SERVER_PASS" ssh $SSH_OPTS $SERVER_USER@$SERVER_IP '
    if ! command -v docker &> /dev/null; then
        echo "安装 Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    fi
    docker --version
'
echo "✅ Docker 就绪"
echo ""

# 3. 克隆代码
echo "[3/6] 克隆代码..."
sshpass -p "$SERVER_PASS" ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "
    rm -rf $DEPLOY_DIR
    mkdir -p /opt
    cd /opt
    git clone --depth 1 $GITHUB_REPO buildai-framework-test
    cd buildai-framework-test
    echo '代码克隆完成'
    ls -la
"
echo "✅ 代码克隆完成"
echo ""

# 4. 创建环境配置
echo "[4/6] 创建环境配置..."
sshpass -p "$SERVER_PASS" ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "
    cd $DEPLOY_DIR/framework/controller
    cat > .env << 'EOF'
NODE_ENV=production
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=buildai_test_2024
DB_DATABASE=buildai_controller
JWT_SECRET=buildai_jwt_secret_key_for_testing_only
REDIS_HOST=localhost
REDIS_PORT=6379
LOG_LEVEL=info
EOF
    echo '环境配置已创建'
"
echo "✅ 环境配置完成"
echo ""

# 5. 创建 docker-compose.test.yml
echo "[5/6] 创建测试部署配置..."
sshpass -p "$SERVER_PASS" ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "cat > $DEPLOY_DIR/docker-compose.test.yml << 'EOF'
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
      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]
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
      test: [\"CMD\", \"wget\", \"--quiet\", \"--tries=1\", \"--spider\", \"http://localhost:8080/api/v1\"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

volumes:
  postgres_test_data:
  redis_test_data:
EOF
    echo 'docker-compose 配置已创建'
"
echo "✅ 部署配置完成"
echo ""

# 6. 启动服务
echo "[6/6] 启动服务..."
sshpass -p "$SERVER_PASS" ssh $SSH_OPTS $SERVER_USER@$SERVER_IP "
    cd $DEPLOY_DIR
    echo '启动 Docker 服务...'
    docker-compose -f docker-compose.test.yml down 2>/dev/null || true
    docker-compose -f docker-compose.test.yml up -d --build
    
    echo ''
    echo '等待服务启动...'
    sleep 20
    
    echo ''
    echo '服务状态:'
    docker-compose -f docker-compose.test.yml ps
    
    echo ''
    echo '容器日志:'
    docker logs buildai-controller-test --tail 10 2>/dev/null || echo '容器还在启动中...'
"

if [ $? -eq 0 ]; then
    echo "✅ 服务启动完成"
else
    echo "⚠️ 服务启动可能有问题，请检查日志"
fi
echo ""

# 完成
echo "========================================"
echo "✅ 部署完成!"
echo "========================================"
echo ""
echo "访问地址:"
echo "  Controller API: http://$SERVER_IP:8080/api/v1"
echo "  API 文档:       http://$SERVER_IP:8080/api/docs"
echo ""
echo "管理命令:"
echo "  查看日志: ssh $SERVER_USER@$SERVER_IP 'docker logs buildai-controller-test -f'"
echo "  重启服务: ssh $SERVER_USER@$SERVER_IP 'docker-compose -f $DEPLOY_DIR/docker-compose.test.yml restart'"
echo "  停止服务: ssh $SERVER_USER@$SERVER_IP 'docker-compose -f $DEPLOY_DIR/docker-compose.test.yml down'"
echo ""
echo "代码目录: $DEPLOY_DIR"
echo ""
