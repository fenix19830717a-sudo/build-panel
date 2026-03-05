# BuildAI Framework - 部署文档

## 1. 服务器要求

### 1.1 最低配置

| 组件 | CPU | 内存 | 磁盘 | 网络 |
|------|-----|------|------|------|
| Controller | 2核 | 4GB | 50GB SSD | 10Mbps |
| PostgreSQL | 2核 | 4GB | 100GB SSD | 10Mbps |
| Redis | 1核 | 2GB | 20GB SSD | 10Mbps |
| Agent Node | 2核 | 4GB | 50GB SSD | 10Mbps |

### 1.2 推荐配置（生产环境）

| 组件 | CPU | 内存 | 磁盘 | 网络 |
|------|-----|------|------|------|
| Controller | 4核 | 8GB | 100GB SSD | 100Mbps |
| PostgreSQL | 4核 | 8GB | 500GB SSD | 100Mbps |
| Redis | 2核 | 4GB | 50GB SSD | 100Mbps |
| Agent Node | 4核 | 8GB | 200GB SSD | 100Mbps |

### 1.3 操作系统要求

- **Linux**: Ubuntu 22.04 LTS / Debian 12 / CentOS 8+
- **Windows**: Windows Server 2022 (Agent 节点)
- **Docker**: 24.0+
- **Docker Compose**: 2.20+

## 2. Docker 部署

### 2.1 快速启动（开发环境）

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/buildai-framework.git
cd buildai-framework

# 2. 启动完整环境
docker-compose up -d

# 3. 查看状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f controller
```

### 2.2 生产环境部署

#### 2.2.1 准备环境

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 创建目录
mkdir -p /opt/buildai/{data,logs,backups}
```

#### 2.2.2 配置环境变量

```bash
# 创建环境变量文件
cat > /opt/buildai/.env << 'EOF'
# 应用配置
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# 数据库配置
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=buildai
DB_PASSWORD=your-secure-database-password
DB_DATABASE=buildai

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-redis-password

# MinIO 配置
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-minio-access-key
MINIO_SECRET_KEY=your-minio-secret-key
MINIO_BUCKET=buildai

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI 配置
AI_API_KEY=your-openai-api-key
AI_MODEL=gpt-4
EOF
```

#### 2.2.3 创建 Docker Compose 配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: buildai-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - /opt/buildai/data/postgres:/var/lib/postgresql/data
      - /opt/buildai/backups:/backups
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME} -d ${DB_DATABASE}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - buildai-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: buildai-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - /opt/buildai/data/redis:/data
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - buildai-network

  # MinIO 对象存储
  minio:
    image: minio/minio:latest
    container_name: buildai-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - /opt/buildai/data/minio:/data
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - buildai-network

  # Controller 服务
  controller:
    build:
      context: ./framework/controller
      dockerfile: Dockerfile
    container_name: buildai-controller
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV}
      PORT: ${PORT}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
      DB_HOST: ${DB_HOST}
      DB_PORT: ${DB_PORT}
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE}
      REDIS_HOST: ${REDIS_HOST}
      REDIS_PORT: ${REDIS_PORT}
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    ports:
      - "3000:3000"
    volumes:
      - /opt/buildai/logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - buildai-network

  # Web 前端
  web:
    build:
      context: ./framework/web
      dockerfile: Dockerfile
    container_name: buildai-web
    restart: unless-stopped
    environment:
      API_URL: http://controller:3000
    ports:
      - "80:80"
    depends_on:
      - controller
    networks:
      - buildai-network

networks:
  buildai-network:
    driver: bridge
```

#### 2.2.4 启动服务

```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 停止并删除数据卷（谨慎使用）
docker-compose -f docker-compose.prod.yml down -v
```

## 3. 环境变量说明

### 3.1 核心配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| NODE_ENV | 运行环境 | development | 是 |
| PORT | 服务端口 | 3000 | 是 |
| JWT_SECRET | JWT 密钥 | - | 是 |
| JWT_EXPIRES_IN | JWT 过期时间 | 7d | 否 |

### 3.2 数据库配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| DB_HOST | 数据库主机 | localhost | 是 |
| DB_PORT | 数据库端口 | 5432 | 是 |
| DB_USERNAME | 数据库用户名 | postgres | 是 |
| DB_PASSWORD | 数据库密码 | - | 是 |
| DB_DATABASE | 数据库名称 | buildai | 是 |

### 3.3 Redis 配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| REDIS_HOST | Redis 主机 | localhost | 是 |
| REDIS_PORT | Redis 端口 | 6379 | 是 |
| REDIS_PASSWORD | Redis 密码 | - | 否 |

### 3.4 存储配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| MINIO_ENDPOINT | MinIO 地址 | localhost | 否 |
| MINIO_PORT | MinIO 端口 | 9000 | 否 |
| MINIO_ACCESS_KEY | MinIO 访问密钥 | - | 否 |
| MINIO_SECRET_KEY | MinIO 秘密密钥 | - | 否 |
| MINIO_BUCKET | MinIO 桶名 | buildai | 否 |

### 3.5 邮件配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| SMTP_HOST | SMTP 服务器地址 | - | 否 |
| SMTP_PORT | SMTP 端口 | 587 | 否 |
| SMTP_USER | SMTP 用户名 | - | 否 |
| SMTP_PASS | SMTP 密码 | - | 否 |

### 3.6 AI 配置

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| AI_API_KEY | OpenAI API Key | - | 否 |
| AI_API_URL | AI API 地址 | https://api.openai.com/v1 | 否 |
| AI_MODEL | AI 模型 | gpt-4 | 否 |

## 4. SSL 配置

### 4.1 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期（Certbot 会自动配置定时任务）
sudo certbot renew --dry-run
```

### 4.2 手动配置 Nginx SSL

```nginx
# /etc/nginx/sites-available/buildai
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书
    ssl_certificate /path/to/your/fullchain.pem;
    ssl_certificate_key /path/to/your/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 前端
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 4.3 应用配置

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/buildai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. 备份与恢复

### 5.1 数据库备份

```bash
#!/bin/bash
# backup.sh - 数据库备份脚本

BACKUP_DIR="/opt/buildai/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="buildai"
DB_USER="buildai"

# 创建备份
pg_dump -h localhost -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 保留最近 7 天的备份
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

### 5.2 自动备份（Cron）

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点执行备份
0 2 * * * /opt/buildai/scripts/backup.sh >> /opt/buildai/logs/backup.log 2>&1
```

### 5.3 数据恢复

```bash
#!/bin/bash
# restore.sh - 数据库恢复脚本

BACKUP_FILE=$1
DB_NAME="buildai"
DB_USER="buildai"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# 解压并恢复
gunzip -c $BACKUP_FILE | psql -h localhost -U $DB_USER -d $DB_NAME

echo "Restore completed from: $BACKUP_FILE"
```

### 5.4 完整系统备份

```bash
#!/bin/bash
# full-backup.sh - 完整系统备份

BACKUP_DIR="/opt/buildai/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="buildai_full_$DATE"

# 停止服务
docker-compose -f /opt/buildai/docker-compose.prod.yml stop

# 备份数据目录
tar -czf $BACKUP_DIR/${BACKUP_NAME}.tar.gz \
    /opt/buildai/data \
    /opt/buildai/.env \
    /opt/buildai/docker-compose.prod.yml

# 启动服务
docker-compose -f /opt/buildai/docker-compose.prod.yml start

echo "Full backup completed: ${BACKUP_NAME}.tar.gz"
```

## 6. Agent 节点部署

### 6.1 安装 Agent

```bash
# 下载安装脚本
curl -fsSL https://yourdomain.com/install-agent.sh | bash

# 或者手动安装
docker run -d \
    --name buildai-agent \
    --restart unless-stopped \
    --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /opt/buildai-agent:/data \
    -e CONTROLLER_URL=https://yourdomain.com \
    -e AGENT_TOKEN=your-agent-token \
    buildai/agent:latest
```

### 6.2 Agent 配置

```yaml
# /opt/buildai-agent/config.yaml
agent:
  id: agent-001
  name: Production Server 1
  controller_url: https://yourdomain.com
  token: your-agent-token
  heartbeat_interval: 30
  
security:
  tls_enabled: true
  cert_file: /data/certs/agent.crt
  key_file: /data/certs/agent.key
  ca_file: /data/certs/ca.crt
  
features:
  docker: true
  ssh: true
  file_manager: true
  process_monitor: true
```

## 7. 监控与日志

### 7.1 日志查看

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f controller

# 查看最近 100 行日志
docker-compose logs --tail=100 controller
```

### 7.2 健康检查

```bash
# Controller 健康检查
curl http://localhost:3000/health

# 数据库健康检查
docker-compose exec postgres pg_isready -U buildai

# Redis 健康检查
docker-compose exec redis redis-cli ping
```

### 7.3 资源监控

```bash
# 查看容器资源使用
docker stats

# 查看系统资源使用
htop
```

## 8. 故障排除

### 8.1 常见问题

#### 服务无法启动

```bash
# 检查端口占用
sudo netstat -tlnp | grep :3000

# 检查磁盘空间
df -h

# 查看详细错误日志
docker-compose logs --no-color controller
```

#### 数据库连接失败

```bash
# 检查数据库状态
docker-compose ps postgres

# 检查网络连接
docker-compose exec controller ping postgres

# 检查数据库日志
docker-compose logs postgres
```

#### SSL 证书问题

```bash
# 检查证书有效期
openssl x509 -in /path/to/cert.pem -noout -dates

# 测试 SSL 配置
openssl s_client -connect yourdomain.com:443
```

### 8.2 重置密码

```bash
# 进入数据库容器
docker-compose exec postgres psql -U buildai -d buildai

# 重置管理员密码
UPDATE users SET password_hash = '$2b$10$...' WHERE email = 'admin@example.com';
```

## 9. 升级指南

### 9.1 应用升级

```bash
# 1. 备份数据
/opt/buildai/scripts/backup.sh

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建镜像
docker-compose -f docker-compose.prod.yml build --no-cache

# 4. 重启服务
docker-compose -f docker-compose.prod.yml up -d

# 5. 验证升级
curl http://localhost:3000/health
```

### 9.2 数据库迁移

```bash
# 进入后端容器
docker-compose exec controller sh

# 执行迁移
npm run migration:run

# 如有问题，回滚迁移
npm run migration:revert
```

## 10. 安全加固

### 10.1 防火墙配置

```bash
# UFW 配置（Ubuntu）
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 10.2 Fail2ban 配置

```bash
# 安装 Fail2ban
sudo apt-get install -y fail2ban

# 配置
sudo cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
EOF

sudo systemctl restart fail2ban
```

### 10.3 定期安全更新

```bash
# 创建安全更新脚本
cat > /opt/buildai/scripts/security-update.sh << 'EOF'
#!/bin/bash
apt-get update
apt-get upgrade -y
docker images | grep -v REPOSITORY | awk '{print $1":"$2}' | xargs -I {} docker pull {}
docker system prune -f
EOF

chmod +x /opt/buildai/scripts/security-update.sh

# 每周日凌晨 3 点执行
0 3 * * 0 /opt/buildai/scripts/security-update.sh >> /opt/buildai/logs/security-update.log 2>&1
```
