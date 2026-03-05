# DBBackup - 数据库备份管理平台

## 简介

DBBackup 是 BuildAI Framework 的数据库备份管理平台，支持 MySQL、PostgreSQL、MongoDB 等多种数据库的自动备份。提供定时备份、多种存储后端、备份加密、恢复管理等功能。

核心功能：
- 多数据库类型支持
- 定时备份（Cron 表达式）
- 多种存储后端（本地、S3、MinIO、SFTP）
- 备份加密和压缩
- 点-in-time 恢复
- 备份验证和监控

## 功能特性

### 数据库支持
- ✅ **MySQL** - mysqldump 逻辑备份 + xtrabackup 物理备份
- ✅ **PostgreSQL** - pg_dump 逻辑备份 + pg_basebackup 物理备份
- ✅ **MongoDB** - mongodump 逻辑备份
- ✅ **Redis** - RDB 持久化备份
- ✅ **连接测试** - 备份前自动测试连接

### 备份策略
- ✅ **定时备份** - 支持 Cron 表达式
- ✅ **全量备份** - 完整数据库备份
- ✅ **增量备份** - 基于 WAL/OpLog 的增量
- ✅ **差异备份** - 基于上次全量的差异
- ✅ **保留策略** - 自动清理过期备份

### 存储后端
- ✅ **本地存储** - 本地磁盘存储
- ✅ **AWS S3** - Amazon S3 对象存储
- ✅ **MinIO** - 兼容 S3 的自托管对象存储
- ✅ **SFTP** - SFTP/SCP 远程存储
- ✅ **阿里云 OSS** - 阿里云对象存储
- ✅ **腾讯云 COS** - 腾讯云对象存储

### 安全功能
- ✅ **AES-256 加密** - 备份文件加密
- ✅ **Gzip 压缩** - 减少存储空间
- ✅ **密码管理** - 安全的密码存储
- ✅ **访问控制** - 基于角色的访问

### 恢复功能
- ✅ **点-in-time 恢复** - 恢复到任意时间点
- ✅ **备份验证** - 自动验证备份完整性
- ✅ **恢复测试** - 自动恢复测试
- ✅ **下载备份** - 直接下载备份文件

## 技术栈

### 后端
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 14+（元数据存储）
- **ORM**: TypeORM
- **Scheduler**: node-cron / Bull
- **Encryption**: crypto (AES-256-GCM)

### 前端
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Ant Design
- **Charts**: Recharts
- **State**: Zustand

## 快速开始

### 环境要求
- Node.js 20+
- PostgreSQL 14+（用于元数据）
- Docker（可选，用于测试数据库）

### 安装依赖

```bash
# 后端
cd apps/dbbackup/backend
npm install

# 前端
cd ../frontend
npm install
```

### 环境配置

```bash
# 后端配置
cd apps/dbbackup/backend
cp .env.example .env

# 编辑 .env 文件
```

### 数据库初始化

```bash
cd apps/dbbackup/backend
npm run migration:run
```

### 启动开发服务器

```bash
# 后端 (端口 3000)
cd apps/dbbackup/backend
npm run start:dev

# 前端 (端口 3001)
cd apps/dbbackup/frontend
npm run dev
```

### 生产构建

```bash
# 后端
cd apps/dbbackup/backend
npm run build

# 前端
cd apps/dbbackup/frontend
npm run build
```

## API 文档

启动后端后访问：
```
http://localhost:3000/api/docs
```

### 主要 API

#### 数据库管理
- `GET /api/v1/databases` - 获取数据库列表
- `POST /api/v1/databases` - 添加数据库
- `GET /api/v1/databases/:id` - 获取数据库详情
- `PUT /api/v1/databases/:id` - 更新数据库
- `DELETE /api/v1/databases/:id` - 删除数据库
- `POST /api/v1/databases/test-connection` - 测试连接

#### 备份管理
- `GET /api/v1/backups` - 获取备份列表
- `POST /api/v1/backups` - 创建备份
- `GET /api/v1/backups/:id` - 获取备份详情
- `DELETE /api/v1/backups/:id` - 删除备份
- `GET /api/v1/backups/:id/download` - 下载备份
- `POST /api/v1/backups/:id/verify` - 验证备份

#### 恢复管理
- `GET /api/v1/restore` - 获取恢复记录
- `POST /api/v1/restore` - 执行恢复
- `GET /api/v1/restore/:id` - 获取恢复详情

#### 备份策略
- `GET /api/v1/policies` - 获取策略列表
- `POST /api/v1/policies` - 创建策略
- `PUT /api/v1/policies/:id` - 更新策略
- `DELETE /api/v1/policies/:id` - 删除策略

## 部署

### Docker 部署（推荐）

```bash
# 完整部署（包含 MinIO 和测试数据库）
cd apps/dbbackup
docker-compose -f docker-compose.full.yml up -d

# 仅部署应用
docker-compose up -d
```

### 生产环境部署

1. **配置环境变量**
   ```bash
   NODE_ENV=production
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=dbbackup
   ENCRYPTION_KEY=your-32-char-encryption-key
   BACKUP_DIR=/app/backups
   ```

2. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name backup.yourdomain.com;
       
       location / {
           root /path/to/dbbackup/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **启动服务**
   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```

## 目录结构

```
apps/dbbackup/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── databases/    # 数据库模块
│   │   │   ├── backups/      # 备份模块
│   │   │   ├── restore/      # 恢复模块
│   │   │   ├── policies/     # 策略模块
│   │   │   └── storage/      # 存储模块
│   │   ├── backup-engines/   # 备份引擎
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # 页面
│   │   └── App.tsx
│   └── package.json
├── docker/
│   └── docker-compose.yml
└── README.md
```

## 数据库配置示例

### MySQL

```json
{
  "name": "生产 MySQL",
  "type": "mysql",
  "host": "mysql.example.com",
  "port": 3306,
  "username": "backup_user",
  "password": "encrypted_password",
  "database": "myapp",
  "options": {
    "backupType": "logical",
    "includeTables": ["users", "orders"],
    "excludeTables": ["logs", "cache"]
  }
}
```

### PostgreSQL

```json
{
  "name": "生产 PostgreSQL",
  "type": "postgresql",
  "host": "postgres.example.com",
  "port": 5432,
  "username": "backup_user",
  "password": "encrypted_password",
  "database": "myapp",
  "options": {
    "backupType": "logical",
    "format": "custom"
  }
}
```

### MongoDB

```json
{
  "name": "生产 MongoDB",
  "type": "mongodb",
  "host": "mongo.example.com",
  "port": 27017,
  "username": "backup_user",
  "password": "encrypted_password",
  "database": "myapp",
  "options": {
    "authSource": "admin",
    "oplog": true
  }
}
```

## 备份策略配置

### 定时备份

```json
{
  "name": "每日全量备份",
  "databaseId": "db-id",
  "schedule": "0 2 * * *",
  "backupType": "full",
  "storage": {
    "type": "s3",
    "bucket": "my-backups",
    "path": "daily/"
  },
  "retention": {
    "keepDays": 30,
    "keepCount": 10
  },
  "encryption": true,
  "compression": true
}
```

### 存储配置

#### S3 存储

```json
{
  "type": "s3",
  "config": {
    "region": "us-east-1",
    "bucket": "my-backup-bucket",
    "accessKeyId": "AKIA...",
    "secretAccessKey": "...",
    "path": "backups/"
  }
}
```

#### MinIO 存储

```json
{
  "type": "minio",
  "config": {
    "endpoint": "minio.example.com",
    "port": 9000,
    "useSSL": true,
    "bucket": "backups",
    "accessKey": "minio",
    "secretKey": "minio123"
  }
}
```

#### SFTP 存储

```json
{
  "type": "sftp",
  "config": {
    "host": "backup-server.example.com",
    "port": 22,
    "username": "backup",
    "privateKey": "path/to/key",
    "path": "/backups/"
  }
}
```

## 恢复操作

### 从备份恢复

1. 进入「恢复管理」
2. 选择要恢复的备份
3. 配置恢复选项：
   - 目标数据库（可选新数据库）
   - 恢复选项（覆盖/追加）
4. 点击「开始恢复」
5. 等待恢复完成

### 点-in-time 恢复

1. 选择数据库
2. 选择目标时间点
3. 系统自动计算需要的备份
4. 执行恢复

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| NODE_ENV | 运行环境 | 是 |
| PORT | 服务端口 | 是 |
| DB_HOST | 数据库主机 | 是 |
| DB_PORT | 数据库端口 | 是 |
| DB_USERNAME | 数据库用户名 | 是 |
| DB_PASSWORD | 数据库密码 | 是 |
| DB_DATABASE | 数据库名称 | 是 |
| ENCRYPTION_KEY | 加密密钥（32字符） | 是 |
| BACKUP_DIR | 本地备份目录 | 是 |
| REDIS_HOST | Redis 主机 | 否 |
| REDIS_PORT | Redis 端口 | 否 |

## 许可证

MIT
