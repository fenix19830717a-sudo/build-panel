<div align="center">

# B2B SaaS Platform

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**企业级 B2B SaaS 平台 - 集成 AI 能力与分布式节点管理**

[快速开始](#快速开始) • [文档](#文档索引) • [功能特性](#功能特性) • [贡献指南](#贡献指南)

</div>

---

## 项目简介

B2B SaaS Platform 是一个功能丰富的企业级平台，提供 AI 内容生成、自动化交易、数据爬取和分布式节点管理等核心能力。采用模块化架构设计，支持灵活的应用扩展和第三方服务集成。

### 核心功能概述

- **AI 驱动** - 集成 Gemini AI，提供智能内容生成和自动化操作
- **模块化架构** - 可插拔的应用系统，按需扩展业务功能
- **分布式部署** - 支持多节点部署，实现任务分发与负载均衡
- **企业级特性** - 完善的用户管理、计费系统和权限控制

---

## 功能特性

### 🤖 AI 内容生成
- 集成 Google Gemini AI API
- 支持多种内容生成场景
- AI 辅助运营和决策支持

### 📈 Polymarket 交易机器人
- 自动化预测市场交易
- 策略配置与风险管理
- 实时市场数据分析

### 🕷️ 爬虫任务管理
- 分布式爬虫任务调度
- 数据采集与处理流水线
- 支持多种数据源

### 🌐 节点分布式部署
- 多节点协同工作
- 任务分发与负载均衡
- 节点状态监控

### 🧩 模块化应用系统
- 应用商店机制
- 即插即用的应用模块
- 自定义应用开发支持

### 👥 用户管理和计费
- 完整的用户认证系统
- 订阅计费管理
- 权限与角色控制

### 🔌 第三方服务集成
- 多平台 API 集成
- Webhook 支持
- OAuth 认证集成

---

## 快速开始

### 环境要求

- **Node.js** >= 18.x
- **npm** >= 9.x 或 **pnpm** >= 8.x
- **SQLite** 3.x

### 安装步骤

```bash
# 克隆仓库
git clone <repository-url>
cd b2b-over-sever-framework

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 设置 GEMINI_API_KEY 等必要配置
```

### 启动命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

---

## 文档索引

| 文档 | 描述 |
|------|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | 系统架构设计文档 |
| [API.md](API.md) | API 接口文档 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 部署指南 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 开发贡献指南 |
| [ENV.md](ENV.md) | 环境变量配置说明 |
| [DATABASE.md](DATABASE.md) | 数据库设计文档 |
| [DEVELOPMENT.md](DEVELOPMENT.md) | 开发指南 |

---

## 技术栈

### 前端技术

| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Tailwind CSS | 样式框架 |
| React Router | 路由管理 |

### 后端技术

| 技术 | 用途 |
|------|------|
| Node.js | 运行时环境 |
| Express | Web 框架 |
| SQLite | 数据库 |
| better-sqlite3 | 数据库驱动 |

### AI 集成

| 服务 | 用途 |
|------|------|
| Google Gemini | AI 内容生成 |
| AI Studio | 应用开发平台 |

---

## 项目结构

```
b2b-over-sever-framework/
├── src/                    # 前端源码
│   ├── apps/               # 应用模块
│   │   ├── ai-operations/  # AI 运营
│   │   ├── polymarket-bot/ # 交易机器人
│   │   ├── b2b-leads/      # B2B 线索
│   │   ├── site-generator/ # 站点生成
│   │   └── ...             # 其他应用
│   ├── components/         # 公共组件
│   ├── pages/              # 页面组件
│   └── types/              # 类型定义
├── node-agent/             # 节点代理服务
│   ├── apps/               # 节点应用
│   ├── src/                # 核心代码
│   └── config/             # 配置文件
├── server.ts               # 服务端入口
├── package.json            # 项目配置
└── ...                     # 配置文件
```

---

## 截图

> 📸 截图待补充

---

## 贡献指南

我们欢迎所有形式的贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解：

- 代码规范
- 提交指南
- 开发流程
- 问题反馈

---

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**Made with ❤️ by B2B SaaS Team**

</div>
