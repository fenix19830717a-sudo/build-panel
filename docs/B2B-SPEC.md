# B2B Framework - 应用开发规范 (确认版)

## 应用标准（严格执行）

每个应用必须包含：
1. **前端页面** - 面向终端用户的展示界面
2. **人工管理后台** - 管理员操作界面
3. **数据库** - PostgreSQL + TypeORM
4. **AI使用的API接口** - 提供给AI Agent调用的RESTful API

## 集成要求
- 集成到 SaaS 平台 (BuildAI Framework)
- 通过中控平台一键部署到服务器
- 支持多租户架构

## 开发模式
1. **先开发独立站模板** (WebsiteTemplate)
2. **然后根据客户需求修改前端** (主题/颜色/内容)
3. **全自动开发** - 无需人工干预
4. **自动推送** - 每完成一个应用自动推送到GitHub

## 应用清单（按此顺序开发）

### Phase 1: 基础模板 ✅
- [x] **WebsiteTemplate** - 多租户独立站模板
  - Backend: NestJS + 多租户
  - Frontend: React + 主题系统
  - Admin: 主题配置/内容管理/AI助手

### Phase 2: 业务应用 🏗️ 待开发
- [ ] **StoreApp** - 电商独立站 (B2C/B2B)
- [ ] **CMSApp** - 内容管理系统 (博客/新闻)
- [ ] **ChatService** - 智能客服系统

### Phase 3: 行业应用 📋 待开发
- [ ] **JewelryStore** - 珠宝展示 (faraglobal.com)
- [ ] **SupplierPortal** - 供应商门户 (芙蓉出海)
- [ ] **ProductCatalog** - 产品目录
- [ ] **InquirySystem** - 询盘管理
- [ ] **B2BProductShowcase** - B2B产品展示 (晟通达)
- [ ] **QuotationSystem** - 报价系统

### Phase 4: 工具应用 📋 待开发
- [ ] **SiteMonitor** - 网站监控
- [ ] **LogCollector** - 日志收集
- [ ] **DBBackup** - 数据库备份

## 技术栈标准
- **Backend**: NestJS + TypeScript + TypeORM
- **Frontend**: React + Vite + Tailwind CSS
- **Admin**: React + Ant Design
- **Database**: PostgreSQL
- **Cache**: Redis
- **AI**: RESTful API (OpenAI/Claude/Kimi)

## 项目结构标准
```
apps/{app-name}/
├── frontend/          # 前端页面
├── admin/             # 管理后台
├── backend/           # 后端API (含AI接口)
├── database/          # 数据库迁移
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 全自动开发流程
1. 启动3个Agent并行开发
2. Backend → Frontend → Admin 顺序
3. 每完成一个模块提交代码
4. 应用完成后自动推送到GitHub
5. 立即开始下一个应用

## 当前状态
- ✅ Phase 1 完成 (WebsiteTemplate)
- 🏗️ Phase 2 准备开始 (StoreApp/CMSApp/ChatService 已完成，需确认)
- 📋 Phase 3/4 待开发
