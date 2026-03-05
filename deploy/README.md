# BuildAI Framework 部署配置

## 目录结构

```
deploy/
├── nginx.conf              # Nginx 反向代理配置
├── nginx-ssl.conf          # SSL/TLS 配置
├── prometheus.yml          # Prometheus 监控配置
├── install-agent.sh        # Agent 安装脚本
├── backup.sh               # 备份脚本
└── update.sh               # 更新脚本
```

## 快速开始

### 1. 安装 BuildAI Framework

在目标服务器上运行：

```bash
curl -fsSL https://raw.githubusercontent.com/your-org/buildai-framework/main/deploy/install-agent.sh | sudo bash
```

或手动安装：

```bash
git clone https://github.com/your-org/buildai-framework.git /opt/buildai-framework
cd /opt/buildai-framework
sudo ./deploy/install-agent.sh
```

### 2. 配置环境变量

编辑 `.env` 文件，设置数据库密码和其他配置：

```bash
nano /opt/buildai-framework/.env
```

### 3. 启动服务

```bash
cd /opt/buildai-framework
docker-compose -f docker-compose.full.yml up -d
```

### 4. 访问服务

- Controller: http://your-server-ip:3000
- WebsiteTemplate: http://your-server-ip:8080
- StoreApp: http://your-server-ip:8090
- CMSApp: http://your-server-ip:8100

## 维护命令

### 备份

```bash
./deploy/backup.sh
```

### 更新

```bash
./deploy/update.sh
```

带备份和迁移的完整更新：

```bash
./deploy/update.sh -b -m -c
```

### 查看日志

```bash
# 所有服务
docker-compose -f docker-compose.full.yml logs -f

# 特定服务
docker-compose -f docker-compose.full.yml logs -f controller
```

### 重启服务

```bash
docker-compose -f docker-compose.full.yml restart
```

## SSL/TLS 配置

使用 Let's Encrypt 自动配置 SSL：

```bash
# 安装 certbot
docker run -it --rm \
  -v /opt/buildai-framework/deploy/ssl:/etc/letsencrypt \
  -v /opt/buildai-framework/deploy/nginx.conf:/etc/nginx/nginx.conf:ro \
  -p 80:80 \
  certbot/certbot certonly --standalone -d your-domain.com
```

然后修改 `docker-compose.full.yml` 挂载 SSL 证书。

## 监控

启用 Prometheus + Grafana：

```bash
docker-compose -f docker-compose.full.yml --profile monitoring up -d
```

访问 Grafana: http://your-server-ip:3001 (默认密码: admin/admin)
