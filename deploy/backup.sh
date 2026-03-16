#!/bin/bash
# BuildAI Framework 备份脚本
# 自动备份所有数据库和配置文件

set -e

# 配置
BACKUP_DIR="${BACKUP_DIR:-/opt/buildai-framework/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="buildai_backup_${TIMESTAMP}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# 创建备份目录
create_backup_dir() {
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
    mkdir -p "$BACKUP_PATH"
    info "备份目录: $BACKUP_PATH"
}

# 备份 PostgreSQL 数据库
backup_postgres() {
    info "备份 PostgreSQL 数据库..."
    
    # 获取容器名称
    CONTAINER=$(docker ps --format "table {{.Names}}" | grep postgres | head -1)
    
    if [ -z "$CONTAINER" ]; then
        error "未找到 PostgreSQL 容器"
        return 1
    fi
    
    info "使用容器: $CONTAINER"
    
    # 列出所有数据库
    DATABASES=$(docker exec $CONTAINER psql -U buildai -l -t | cut -d'|' -f1 | sed -e 's/ //g' -e '/^$/d' | grep -v template | grep -v postgres)
    
    for DB in $DATABASES; do
        info "备份数据库: $DB"
        docker exec $CONTAINER pg_dump -U buildai -Fc $DB > "${BACKUP_PATH}/${DB}.dump"
    done
    
    info "PostgreSQL 备份完成"
}

# 备份配置文件
backup_configs() {
    info "备份配置文件..."
    
    CONFIG_BACKUP="${BACKUP_PATH}/configs"
    mkdir -p "$CONFIG_BACKUP"
    
    # 备份环境变量
    if [ -f "/opt/buildai-framework/.env" ]; then
        cp "/opt/buildai-framework/.env" "$CONFIG_BACKUP/"
        info "备份 .env 文件"
    fi
    
    # 备份 docker-compose 配置
    if [ -f "/opt/buildai-framework/docker-compose.full.yml" ]; then
        cp "/opt/buildai-framework/docker-compose.full.yml" "$CONFIG_BACKUP/"
        info "备份 docker-compose.full.yml"
    fi
    
    # 备份 Nginx 配置
    if [ -d "/opt/buildai-framework/deploy" ]; then
        cp -r "/opt/buildai-framework/deploy" "$CONFIG_BACKUP/"
        info "备份 deploy 目录"
    fi
    
    info "配置文件备份完成"
}

# 备份数据卷
backup_volumes() {
    info "备份 Docker 数据卷..."
    
    VOLUMES=$(docker volume ls --format "{{.Name}}" | grep -E "buildai|postgres|redis")
    
    for VOLUME in $VOLUMES; do
        info "备份卷: $VOLUME"
        docker run --rm -v $VOLUME:/data -v "$BACKUP_PATH:/backup" alpine tar czf "/backup/${VOLUME}.tar.gz" -C /data .
    done
    
    info "数据卷备份完成"
}

# 压缩备份
compress_backup() {
    info "压缩备份..."
    
    cd "$BACKUP_DIR"
    tar czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    info "备份压缩完成: ${BACKUP_NAME}.tar.gz"
    
    # 显示备份大小
    BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    info "备份大小: $BACKUP_SIZE"
}

# 清理旧备份
cleanup_old_backups() {
    info "清理 ${RETENTION_DAYS} 天前的备份..."
    
    find "$BACKUP_DIR" -name "buildai_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    info "旧备份清理完成"
}

# 上传到云存储 (可选)
upload_to_cloud() {
    if [ -n "$S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
        info "上传到 S3..."
        
        aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" "s3://${S3_BUCKET}/backups/"
        
        info "S3 上传完成"
    fi
}

# 发送通知 (可选)
send_notification() {
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"BuildAI 备份完成: ${BACKUP_NAME}\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
}

# 主函数
main() {
    info "========================================="
    info "BuildAI Framework 备份开始"
    info "========================================="
    
    create_backup_dir
    backup_postgres
    backup_configs
    backup_volumes
    compress_backup
    cleanup_old_backups
    upload_to_cloud
    send_notification
    
    info "========================================="
    info "BuildAI Framework 备份完成"
    info "备份文件: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    info "========================================="
}

# 运行主函数
main "$@"
