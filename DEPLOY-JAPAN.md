# BuildAI Framework - 日本服务器部署指南

## 服务器信息
- **IP**: 206.119.160.31
- **位置**: 日本
- **用户**: root
- **用途**: BuildAI Framework 部署

---

## 部署前准备

### 1. 配置 SSH 访问

需要在服务器上添加部署密钥：

```bash
# 在日本服务器上执行
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILicjvTqtTla80JC4pKcYBM3LkMebdC8R/9pdQabZm6f buildai@openclaw.local" >> ~/.ssh/authorized_keys
```

或者使用密码登录（当前密码: Fenix19830717A@123）

---

## 快速部署命令

### 方式 1: 自动部署脚本 (推荐)

```bash
# 1. 登录到日本服务器
ssh root@206.119.160.31

# 2. 下载并运行部署脚本
curl -fsSL https://raw.githubusercontent.com/fenix19830717a-sudo/build-panel/main/deploy-remote.sh | bash
```

### 方式 2: 手动部署

```bash
# 1. 登录到日本服务器
ssh root@206.119.160.31

# 2. 进入部署目录
cd /opt

# 3. 备份旧版本 (如果存在)
if [ -d buildai-framework ]; then
    mv buildai-framework buildai-backup-$(date +%Y%m%d-%H%M%S)
fi

# 4. 克隆最新代码
git clone --depth 1 https://github.com/fenix19830717a-sudo/build-panel.git buildai-framework
cd buildai-framework

# 5. 安装 Docker (如果不存在)
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 6. 安装 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 7. 创建环境配置
cd framework/controller
cp .env.example .env
# 编辑 .env 文件，设置数据库密码等

# 8. 启动服务
docker-compose up -d

# 9. 检查状态
docker ps
```

---

## 服务架构

部署后的服务架构：

```
日本服务器 (206.119.160.31)
├── buildai-controller (端口 8080)
│   ├── SaaS 中控平台
│   └── API 文档 (/api/docs)
├── PostgreSQL (端口 5432)
├── Redis (端口 6379)
└── Nginx (端口 80/443)
```

---

## 访问地址

部署完成后：

| 服务 | URL |
|------|-----|
| Controller API | http://206.119.160.31:8080/api/v1 |
| API 文档 | http://206.119.160.31:8080/api/docs |
| Web UI | http://206.119.160.31:8080 |

---

## 管理命令

```bash
# 查看所有容器状态
docker ps

# 查看 Controller 日志
docker logs -f buildai-controller

# 重启 Controller
docker restart buildai-controller

# 进入容器调试
docker exec -it buildai-controller /bin/sh

# 更新代码
cd /opt/buildai-framework
git pull origin main
docker-compose up -d --build
```

---

## 应用部署

Controller 部署完成后，可以通过中控平台部署各个应用：

1. 登录 Web UI: http://206.119.160.31:8080
2. 配置服务器 (localhost)
3. 一键部署应用:
   - WebsiteTemplate
   - StoreApp
   - CMSApp
   - ChatService
   - SiteMonitor
   - LogCollector
   - DBBackup

---

## 故障排查

### 问题 1: Docker 无法启动
```bash
# 检查 Docker 状态
systemctl status docker

# 重启 Docker
systemctl restart docker
```

### 问题 2: 端口被占用
```bash
# 检查端口占用
netstat -tlnp | grep 8080

# 停止占用端口的进程
kill -9 <PID>
```

### 问题 3: 数据库连接失败
```bash
# 检查 PostgreSQL 状态
docker logs postgres

# 重置数据库 (会丢失数据)
docker-compose down -v
docker-compose up -d
```

---

## 备份与恢复

### 自动备份
```bash
# 创建备份脚本
cat > /opt/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/backups/$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

# 备份数据库
docker exec postgres pg_dump -U postgres buildai_controller > $BACKUP_DIR/database.sql

# 备份代码
tar -czf $BACKUP_DIR/buildai.tar.gz /opt/buildai-framework

echo "备份完成: $BACKUP_DIR"
EOF
chmod +x /opt/backup.sh

# 添加定时任务
echo "0 2 * * * /opt/backup.sh" | crontab -
```

### 手动恢复
```bash
# 恢复数据库
docker exec -i postgres psql -U postgres buildai_controller < backup.sql

# 恢复代码
tar -xzf buildai-backup.tar.gz -C /opt/
```

---

## 安全建议

1. **修改默认密码**
   - 数据库密码
   - 管理员账号密码

2. **配置防火墙**
   ```bash
   # 只允许特定 IP 访问管理端口
   ufw allow from YOUR_IP to any port 8080
   ```

3. **启用 SSL**
   - 配置 Nginx 反向代理
   - 申请 Let's Encrypt 证书

4. **定期更新**
   ```bash
   # 每周更新代码
   cd /opt/buildai-framework
   git pull origin main
   docker-compose up -d --build
   ```

---

## 联系方式

如有部署问题，请联系：
- GitHub Issues: https://github.com/fenix19830717a-sudo/build-panel/issues
