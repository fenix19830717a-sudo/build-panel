#!/bin/bash
# BuildAI Agent 安装脚本
# 在目标服务器上运行此脚本安装 BuildAI Framework

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# 检查 root 权限
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "请使用 root 权限运行此脚本 (sudo)"
    fi
}

# 安装依赖
install_dependencies() {
    info "正在安装依赖..."
    
    # 更新包列表
    apt-get update
    
    # 安装必要工具
    apt-get install -y \
        curl \
        wget \
        git \
        jq \
        ca-certificates \
        gnupg \
        lsb-release \
        software-properties-common \
        apt-transport-https
    
    info "依赖安装完成"
}

# 安装 Docker
install_docker() {
    info "正在安装 Docker..."
    
    if command -v docker &> /dev/null; then
        warn "Docker 已安装，跳过安装"
        docker --version
        return
    fi
    
    # 添加 Docker 官方 GPG 密钥
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    
    # 添加 Docker 仓库
    echo \
        "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # 启动 Docker
    systemctl start docker
    systemctl enable docker
    
    info "Docker 安装完成"
    docker --version
}

# 安装 Docker Compose
install_docker_compose() {
    info "正在安装 Docker Compose..."
    
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        warn "Docker Compose 已安装，跳过安装"
        return
    fi
    
    # 安装 Docker Compose v2 (插件)
    apt-get install -y docker-compose-plugin
    
    # 创建兼容的符号链接
    ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose
    
    info "Docker Compose 安装完成"
    docker-compose --version
}

# 创建目录结构
create_directories() {
    info "创建目录结构..."
    
    BASE_DIR="/opt/buildai-framework"
    
    mkdir -p $BASE_DIR
    mkdir -p $BASE_DIR/deploy/ssl
    mkdir -p $BASE_DIR/backups
    mkdir -p $BASE_DIR/logs
    
    info "目录结构创建完成: $BASE_DIR"
}

# 克隆代码
clone_repository() {
    info "克隆代码仓库..."
    
    BASE_DIR="/opt/buildai-framework"
    
    if [ -d "$BASE_DIR/.git" ]; then
        warn "代码已存在，执行更新..."
        cd $BASE_DIR
        git pull origin main
    else
        # 需要替换为实际的仓库地址
        REPO_URL="${REPO_URL:-https://github.com/your-org/buildai-framework.git}"
        git clone $REPO_URL $BASE_DIR
    fi
    
    info "代码克隆/更新完成"
}

# 配置环境变量
setup_environment() {
    info "配置环境变量..."
    
    BASE_DIR="/opt/buildai-framework"
    
    if [ ! -f "$BASE_DIR/.env" ]; then
        cat > $BASE_DIR/.env << 'EOF'
# 数据库配置
DB_USERNAME=buildai
DB_PASSWORD=$(openssl rand -base64 32)
DB_DATABASE=buildai

# Redis 配置
REDIS_PASSWORD=$(openssl rand -base64 32)

# JWT 配置
JWT_SECRET=$(openssl rand -base64 64)

# WebsiteTemplate 数据库
WT_DB_USERNAME=wt_buildai
WT_DB_PASSWORD=$(openssl rand -base64 32)
WT_DB_DATABASE=website_template
WT_JWT_SECRET=$(openssl rand -base64 64)

# StoreApp 数据库
STORE_DB_USERNAME=store_buildai
STORE_DB_PASSWORD=$(openssl rand -base64 32)
STORE_DB_DATABASE=storeapp
STORE_JWT_SECRET=$(openssl rand -base64 64)

# CMSApp 数据库
CMS_DB_USERNAME=cms_buildai
CMS_DB_PASSWORD=$(openssl rand -base64 32)
CMS_DB_DATABASE=cmsapp
CMS_JWT_SECRET=$(openssl rand -base64 64)

# OpenAI API Key (可选)
OPENAI_API_KEY=
EOF
        
        info "环境变量文件已创建: $BASE_DIR/.env"
        warn "请编辑 .env 文件设置强密码"
    else
        warn "环境变量文件已存在，跳过创建"
    fi
}

# 启动服务
start_services() {
    info "启动 BuildAI 服务..."
    
    BASE_DIR="/opt/buildai-framework"
    cd $BASE_DIR
    
    # 拉取镜像
    docker-compose -f docker-compose.full.yml pull
    
    # 启动服务
    docker-compose -f docker-compose.full.yml up -d
    
    info "服务启动完成"
    
    # 显示状态
    docker-compose -f docker-compose.full.yml ps
}

# 设置自动更新
setup_auto_update() {
    info "设置自动更新..."
    
    # 创建更新脚本
    cat > /opt/buildai-framework/deploy/update.sh << 'EOF'
#!/bin/bash
set -e
cd /opt/buildai-framework
docker-compose -f docker-compose.full.yml pull
docker-compose -f docker-compose.full.yml up -d --remove-orphans
docker image prune -f
EOF
    
    chmod +x /opt/buildai-framework/deploy/update.sh
    
    # 添加到 crontab (每天凌晨 3 点检查更新)
    (crontab -l 2>/dev/null; echo "0 3 * * * /opt/buildai-framework/deploy/update.sh >> /var/log/buildai-update.log 2>&1") | crontab -
    
    info "自动更新已设置"
}

# 主函数
main() {
    info "开始安装 BuildAI Framework..."
    
    check_root
    install_dependencies
    install_docker
    install_docker_compose
    create_directories
    clone_repository
    setup_environment
    start_services
    setup_auto_update
    
    info "========================================="
    info "BuildAI Framework 安装完成！"
    info "========================================="
    info "访问地址:"
    info "  - Controller: http://your-server-ip:3000"
    info "  - Website Template: http://your-server-ip:8080"
    info "  - Store App: http://your-server-ip:8090"
    info "========================================="
    info "配置文件: /opt/buildai-framework/.env"
    info "日志目录: /opt/buildai-framework/logs"
    info "备份目录: /opt/buildai-framework/backups"
    info "========================================="
}

# 运行主函数
main "$@"
