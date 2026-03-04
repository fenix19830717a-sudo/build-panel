# BuildAI Framework - 开发任务清单 (TASKS)

## 开发团队分工

| Agent | 代号 | 职责 | 工作目录 |
|-------|------|------|----------|
| Agent-1 | **Framework Core** | 核心框架开发（中控 + Agent） | `/framework` |
| Agent-2 | **ServerManager** | 远程服务器管理应用 | `/apps/server-manager` |
| Agent-3 | **PolymarketBot** | 交易机器人应用 | `/apps/polymarket-bot` |

---

## 阶段 1: 框架核心 (Agent-1)

### Sprint 1.1: 项目初始化
- [x] 1.1.1 创建项目目录结构
- [ ] 1.1.2 初始化 Git 仓库并推送到 GitHub
- [ ] 1.1.3 创建 Docker Compose 基础配置
- [ ] 1.1.4 设置 CI/CD 工作流 (GitHub Actions)

### Sprint 1.2: Controller 中控服务
- [ ] 1.2.1 初始化 NestJS 项目
- [ ] 1.2.2 配置 TypeORM + PostgreSQL
- [ ] 1.2.3 实现用户认证模块 (JWT)
- [ ] 1.2.4 实现用户管理 CRUD
- [ ] 1.2.5 实现服务器管理模块
- [ ] 1.2.6 实现 API Key 管理模块
- [ ] 1.2.7 实现应用管理模块
- [ ] 1.2.8 集成 Redis 缓存和消息队列

### Sprint 1.3: Agent 服务端
- [ ] 1.3.1 初始化 Go 项目
- [ ] 1.3.2 实现 HTTP API Server
- [ ] 1.3.3 实现心跳上报机制
- [ ] 1.3.4 实现 Docker 容器管理
- [ ] 1.3.5 实现命令执行模块
- [ ] 1.3.6 实现文件操作模块
- [ ] 1.3.7 实现 mTLS 加密通信
- [ ] 1.3.8 编写 Agent 安装脚本

### Sprint 1.4: Web 前端
- [ ] 1.4.1 初始化 React + Ant Design 项目
- [ ] 1.4.2 实现登录/注册页面
- [ ] 1.4.3 实现 Dashboard 仪表盘
- [ ] 1.4.4 实现服务器列表页面
- [ ] 1.4.5 实现服务器详情页面
- [ ] 1.4.6 实现应用市场页面
- [ ] 1.4.7 实现 API Key 管理页面

### Sprint 1.5: 集成测试
- [ ] 1.5.1 中控 ↔ Agent 通信测试
- [ ] 1.5.2 端到端部署测试
- [ ] 1.5.3 性能测试和优化

---

## 阶段 2: ServerManager 应用 (Agent-2)

### Sprint 2.1: 后端开发
- [ ] 2.1.1 初始化 Node.js + Express 项目
- [ ] 2.1.2 实现 WebSocket 终端服务 (xterm.js)
- [ ] 2.1.3 实现文件管理 API
- [ ] 2.1.4 实现进程管理 API
- [ ] 2.1.5 实现系统服务管理 API
- [ ] 2.1.6 实现日志查看 API
- [ ] 2.1.7 创建 Dockerfile

### Sprint 2.2: 前端开发
- [ ] 2.2.1 创建 ServerManager 前端页面
- [ ] 2.2.2 集成 XTerm.js 终端组件
- [ ] 2.2.3 实现文件管理器界面
- [ ] 2.2.4 实现进程管理界面
- [ ] 2.2.5 实现服务管理界面

### Sprint 2.3: 集成与测试
- [ ] 2.3.1 与中控平台集成
- [ ] 2.3.2 编写部署配置
- [ ] 2.3.3 功能测试

---

## 阶段 3: PolymarketBot 应用 (Agent-3)

### Sprint 3.1: 核心功能
- [ ] 3.1.1 初始化 Python 项目
- [ ] 3.1.2 实现 Polymarket API 封装
- [ ] 3.1.3 实现钱包管理模块
- [ ] 3.1.4 实现市场数据抓取
- [ ] 3.1.5 实现策略基类和接口

### Sprint 3.2: 交易策略
- [ ] 3.2.1 实现趋势跟踪策略
- [ ] 3.2.2 实现套利策略
- [ ] 3.2.3 实现风控模块（止损/止盈）
- [ ] 3.2.4 实现持仓管理

### Sprint 3.3: 接口与部署
- [ ] 3.3.1 创建 Web API (FastAPI)
- [ ] 3.3.2 创建 Dockerfile
- [ ] 3.3.3 编写配置文档
- [ ] 3.3.4 与中控平台集成

### Sprint 3.4: 测试
- [ ] 3.4.1 模拟交易测试
- [ ] 3.4.2 风控规则测试

---

## 阶段 4: 集成与优化 (所有 Agent)

### Sprint 4.1: 系统集成
- [ ] 4.1.1 完整部署流程测试
- [ ] 4.1.2 监控告警配置
- [ ] 4.1.3 日志收集配置

### Sprint 4.2: 文档与交付
- [ ] 4.2.1 编写 API 文档
- [ ] 4.2.2 编写部署文档
- [ ] 4.2.3 编写用户手册

---

## 当前优先级队列

### 🔴 当前 Sprint (Week 1)

**Agent-1 (Framework Core):**
1. [ ] 1.1.2 初始化 Git 仓库并推送到 GitHub
2. [ ] 1.2.1 初始化 NestJS 项目
3. [ ] 1.2.2 配置 TypeORM + PostgreSQL
4. [ ] 1.2.3 实现用户认证模块
5. [ ] 1.3.1 初始化 Go Agent 项目

**Agent-2 (ServerManager):**
1. [ ] 等待 Framework Core 完成基础 API
2. [ ] 2.1.1 初始化 Node.js 项目 (准备)

**Agent-3 (PolymarketBot):**
1. [ ] 等待 Framework Core 完成基础 API
2. [ ] 3.1.1 初始化 Python 项目 (准备)

---

## Git 工作流程

```bash
# 分支策略
main                    # 生产分支
develop                 # 开发分支
feature/agent-X/task-N  # 功能分支

# 提交规范
feat: 新功能
fix: 修复
docs: 文档
refactor: 重构
test: 测试
chore: 构建/工具
```

---

## 沟通机制

1. **每日同步**: 在主会话更新进度
2. **阻塞问题**: 立即在主会话提出
3. **代码评审**: 通过 GitHub PR
4. **集成测试**: 每周五统一进行
