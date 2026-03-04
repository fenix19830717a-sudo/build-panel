# BuildAI Framework

一个 B2B SaaS 中控平台，支持多服务器管理、应用分发和 AI 能力集成。

## 系统架构

```
┌─────────────────────────────────────────────────────┐
│              SaaS Controller (中控平台)              │
│         React + NestJS + PostgreSQL + Redis         │
└────────────────────────┬────────────────────────────┘
                         │ mTLS + HTTPS
                         ▼
┌─────────────────────────────────────────────────────┐
│               Agent (部署在各服务器)                  │
│              Go + Docker + SSH Client               │
└─────────────────────────────────────────────────────┘
```

## 快速开始

### 1. 启动中控平台

```bash
cd deploy
docker-compose up -d
```

### 2. 在远程服务器安装 Agent

```bash
curl -fsSL https://buildai.io/install.sh | bash
```

### 3. 访问 Web 界面

打开 http://localhost:3000

默认账号: `admin@buildai.io` / `admin123`

## 项目结构

```
buildai-framework/
├── framework/              # 核心框架
│   ├── controller/         # 中控服务 (NestJS)
│   ├── agent/              # Agent 服务 (Go)
│   ├── web/                # Web 前端 (React)
│   └── sdk/                # 应用开发 SDK
├── apps/                   # 应用集合
│   ├── server-manager/     # 远程服务器管理
│   └── polymarket-bot/     # Polymarket 交易机器人
└── deploy/                 # 部署配置
```

## 开发团队

- **Agent-1 (Framework Core)**: 框架核心开发
- **Agent-2 (ServerManager)**: 服务器管理应用
- **Agent-3 (PolymarketBot)**: 交易机器人应用

## 文档

- [SPEC.md](docs/SPEC.md) - 项目规格说明书
- [DESIGN.md](docs/DESIGN.md) - 系统设计文档
- [TASKS.md](docs/TASKS.md) - 开发任务清单

## License

MIT
