# LogCollector - 集中式日志收集与分析平台

## 项目结构

```
logcollector/
├── backend/           # NestJS 后端
│   ├── src/
│   │   ├── modules/   # 功能模块
│   │   ├── common/    # 公共工具
│   │   └── database/  # 数据库配置
│   └── Dockerfile
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/# 组件
│   │   ├── pages/     # 页面
│   │   └── services/  # API服务
│   └── Dockerfile
└── docker/            # Docker Compose配置
    └── docker-compose.yml
```

## 快速开始

### 使用 Docker Compose

```bash
cd docker
docker-compose up -d
```

### 手动启动

**后端:**
```bash
cd backend
npm install
npm run start:dev
```

**前端:**
```bash
cd frontend
npm install
npm run dev
```

## 默认端口

- 后端 API: http://localhost:3000
- 前端界面: http://localhost:5173
- PostgreSQL: localhost:5432

## API 文档

启动后访问: http://localhost:3000/api/docs
