# StoreApp Backend

NestJS + TypeScript + TypeORM + PostgreSQL

## 目录结构

```
src/
├── modules/
│   ├── auth/           # 认证模块
│   ├── users/          # 用户模块
│   ├── products/       # 产品模块
│   ├── categories/     # 分类模块
│   ├── orders/         # 订单模块
│   ├── cart/           # 购物车模块
│   └── ai/             # AI模块
├── common/             # 通用工具
├── database/           # 数据库配置
└── main.ts             # 入口文件
```

## 安装依赖

```bash
npm install
```

## 运行

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## API 文档

启动后访问: http://localhost:3000/api/docs

## 环境变量

```bash
PORT=3000
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=storeapp
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```
