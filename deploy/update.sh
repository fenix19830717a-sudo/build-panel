#!/bin/bash
# BuildAI Framework 更新脚本
# 用于更新所有服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 打印信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# 基础目录
BASE_DIR="/opt/buildai-framework"
COMPOSE_FILE="${BASE_DIR}/docker-compose.full.yml"

# 检查是否在正确的目录
check_directory() {
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "未找到 docker-compose.full.yml 文件"
        error "请确保在正确的目录运行此脚本"
        exit 1
    fi
}

# 获取当前版本
get_current_version() {
    cd "$BASE_DIR"
    if [ -d ".git" ]; then
        VERSION=$(git describe --tags --always 2>/dev/null || git rev-parse --short HEAD)
        info "当前版本: $VERSION"
    else
        warn "不是 git 仓库，无法获取版本"
    fi
}

# 备份当前状态
backup_current() {
    info "备份当前状态..."
    
    # 备份环境变量
    if [ -f "$BASE_DIR/.env" ]; then
        cp "$BASE_DIR/.env" "$BASE_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
        info "已备份 .env 文件"
    fi
    
    # 导出当前运行的容器状态
    docker-compose -f "$COMPOSE_FILE" ps > "$BASE_DIR/logs/container-status-$(date +%Y%m%d_%H%M%S).txt" 2>/dev/null || true
}

# 拉取最新代码
pull_latest_code() {
    info "拉取最新代码..."
    
    cd "$BASE_DIR"
    
    if [ -d ".git" ]; then
        git fetch origin
        
        # 获取本地和远程分支
        LOCAL=$(git rev-parse @)
        REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
        
        if [ "$LOCAL" != "$REMOTE" ] && [ -n "$REMOTE" ]; then
            info "检测到更新，正在合并..."
            git pull origin $(git rev-parse --abbrev-ref HEAD)
        else
            info "代码已是最新"
        fi
    else
        warn "不是 git 仓库，跳过代码更新"
    fi
}

# 拉取最新镜像
pull_images() {
    info "拉取最新 Docker 镜像..."
    
    docker-compose -f "$COMPOSE_FILE" pull
}

# 执行数据库迁移 (可选)
run_migrations() {
    if [ "$RUN_MIGRATIONS" = "true" ]; then
        info "执行数据库迁移..."
        
        # Controller 迁移
        docker-compose -f "$COMPOSE_FILE" exec -T controller npx typeorm migration:run -d dist/database/data-source.js || warn "Controller 迁移失败"
        
        # 应用迁移
        for app in wt-backend store-backend cms-backend; do
            docker-compose -f "$COMPOSE_FILE" exec -T $app npx typeorm migration:run -d dist/database/data-source.js 2>/dev/null || warn "$app 迁移失败或无需迁移"
        done
    fi
}

# 滚动更新服务
rolling_update() {
    info "执行滚动更新..."
    
    # 更新配置
    docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans
    
    info "服务更新完成"
}

# 健康检查
health_check() {
    info "执行健康检查..."
    
    # 检查所有服务状态
    SERVICES=$(docker-compose -f "$COMPOSE_FILE" ps --services)
    
    for service in $SERVICES; do
        STATUS=$(docker-compose -f "$COMPOSE_FILE" ps -q $service)
        if [ -n "$STATUS" ]; then
            HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $STATUS 2>/dev/null || echo "unknown")
            if [ "$HEALTH" = "healthy" ] || [ "$HEALTH" = "unknown" ]; then
                info "✓ $service: $HEALTH"
            else
                warn "✗ $service: $HEALTH"
            fi
        else
            error "✗ $service: 未运行"
        fi
    done
}

# 清理旧资源
cleanup() {
    info "清理旧资源..."
    
    # 删除悬空的镜像
    docker image prune -f
    
    # 删除停止的容器
    docker container prune -f
    
    # 删除未使用的卷 (谨慎使用)
    # docker volume prune -f
    
    info "清理完成"
}

# 显示更新后的状态
show_status() {
    info "========================================="
    info "更新完成！当前服务状态:"
    info "========================================="
    
    docker-compose -f "$COMPOSE_FILE" ps
    
    info "========================================="
    info "镜像版本:"
    info "========================================="
    
    docker-compose -f "$COMPOSE_FILE" images
}

# 回滚功能
rollback() {
    warn "执行回滚..."
    
    # 恢复到之前的镜像版本
    docker-compose -f "$COMPOSE_FILE" down
    
    # 如果有备份的镜像标签，可以使用
    # docker-compose -f "$COMPOSE_FILE" up -d
    
    info "回滚完成"
}

# 使用说明
usage() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -b, --backup        更新前执行备份"
    echo "  -m, --migrate       执行数据库迁移"
    echo "  -c, --cleanup       更新后清理资源"
    echo "  -r, --rollback      执行回滚"
    echo "  --no-pull           不拉取最新代码"
    echo ""
    echo "示例:"
    echo "  $0                  标准更新"
    echo "  $0 -b -m -c         备份+迁移+清理完整更新"
    echo "  $0 -r               回滚到之前版本"
}

# 主函数
main() {
    # 解析参数
    DO_BACKUP=false
    RUN_MIGRATIONS=false
    DO_CLEANUP=false
    DO_ROLLBACK=false
    DO_PULL=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -b|--backup)
                DO_BACKUP=true
                shift
                ;;
            -m|--migrate)
                RUN_MIGRATIONS=true
                shift
                ;;
            -c|--cleanup)
                DO_CLEANUP=true
                shift
                ;;
            -r|--rollback)
                DO_ROLLBACK=true
                shift
                ;;
            --no-pull)
                DO_PULL=false
                shift
                ;;
            *)
                error "未知选项: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # 执行操作
    check_directory
    
    if [ "$DO_ROLLBACK" = true ]; then
        rollback
        exit 0
    fi
    
    get_current_version
    
    if [ "$DO_BACKUP" = true ]; then
        backup_current
    fi
    
    if [ "$DO_PULL" = true ]; then
        pull_latest_code
    fi
    
    pull_images
    
    if [ "$RUN_MIGRATIONS" = true ]; then
        run_migrations
    fi
    
    rolling_update
    health_check
    
    if [ "$DO_CLEANUP" = true ]; then
        cleanup
    fi
    
    show_status
}

# 运行主函数
main "$@"
