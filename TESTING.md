# BuildAI Framework 测试文档

## 概述

本文档描述了 BuildAI Framework 的测试策略、测试覆盖范围和运行方式。

## 测试进度

### ✅ 已完成

#### WebsiteTemplate Backend (108 个测试通过)
| 服务 | 测试文件 | 覆盖率 |
|------|----------|--------|
| TenantsService | `src/modules/tenants/tenants.service.spec.ts` | 100% |
| ThemesService | `src/modules/themes/themes.service.spec.ts` | 100% |
| ContentsService | `src/modules/contents/contents.service.spec.ts` | 100% |
| ProductsService | `src/modules/products/products.service.spec.ts` | 100% |
| AiService | `src/modules/ai/ai.service.spec.ts` | 100% |

#### StoreApp Backend
| 服务 | 测试文件 | 状态 |
|------|----------|------|
| ProductsService | `src/modules/products/products.service.spec.ts` | ✅ 已创建 |
| OrdersService | `src/modules/orders/orders.service.spec.ts` | ✅ 已创建 |
| CartService | `src/modules/cart/cart.service.spec.ts` | ✅ 已创建 |

#### CMSApp Backend
| 服务 | 测试文件 | 状态 |
|------|----------|------|
| ArticlesService | `src/modules/articles/articles.service.spec.ts` | ✅ 已创建 |
| CategoriesService | `src/modules/categories/categories.service.spec.ts` | ✅ 已创建 |

#### ChatService Backend
| 服务 | 测试文件 | 状态 |
|------|----------|------|
| ChatService | `src/modules/chat/chat.service.spec.ts` | ✅ 已创建 |
| TicketsService | `src/modules/tickets/tickets.service.spec.ts` | ✅ 已创建 |
| KnowledgeService | `src/modules/knowledge/knowledge.service.spec.ts` | ✅ 已创建 |

### ⏳ 待完成

- [ ] 前端组件测试 (React Testing Library)
- [ ] API 集成测试
- [ ] E2E 测试 (Playwright)

## 运行测试

### WebsiteTemplate (已完成)

```bash
cd apps/website-template/backend
npm test

# 带覆盖率
npm test -- --coverage

# 监视模式
npm test -- --watch
```

### StoreApp

```bash
cd apps/store-app/backend
npm test
```

### CMSApp

```bash
cd apps/cms-app/backend
npm test
```

### ChatService

```bash
cd apps/chat-service/backend
npm test
```

## 测试覆盖统计

### WebsiteTemplate Backend
```
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All services                 |   100   |   100    |   100   |   100   |
 ai.service.ts               |   100   |   100    |   100   |   100   |
 contents.service.ts         |   100   |   100    |   100   |   100   |
 products.service.ts         |   100   |   100    |   100   |   100   |
 tenants.service.ts          |   100   |   100    |   100   |   100   |
 themes.service.ts           |   100   |   100    |   100   |   100   |
```

## 测试规范

### 单元测试最佳实践

1. **独立性**: 每个测试应该独立运行，不依赖其他测试
2. **可重复性**: 测试结果应该一致，不受外部因素影响
3. **快速执行**: 测试应该快速完成
4. **清晰命名**: 测试描述应该清楚地说明测试内容

### Mock 策略

- **Repository**: 使用 Jest mock 模拟 TypeORM Repository
- **外部服务**: Mock HTTP 请求和第三方服务
- **数据库**: 使用内存数据库或 mock 数据库操作

### 测试结构

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something when condition', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## 测试覆盖检查清单

### CRUD 操作
- [x] Create
- [x] Read (findAll, findOne)
- [x] Update
- [x] Delete/Remove

### 错误处理
- [x] NotFoundException
- [x] ConflictException
- [x] BadRequestException

### 查询功能
- [x] 分页
- [x] 过滤
- [x] 搜索
- [x] 排序

### 业务逻辑
- [x] 状态变更
- [x] 计算逻辑
- [x] 关联操作

## 文件清单

### 测试工具
- `apps/website-template/backend/jest.config.js` - Jest 配置
- `apps/website-template/backend/test/test-utils.ts` - 测试工具函数

### WebsiteTemplate 测试
- `src/modules/tenants/tenants.service.spec.ts` (18 个测试)
- `src/modules/themes/themes.service.spec.ts` (21 个测试)
- `src/modules/contents/contents.service.spec.ts` (17 个测试)
- `src/modules/products/products.service.spec.ts` (25 个测试)
- `src/modules/ai/ai.service.spec.ts` (27 个测试)

### StoreApp 测试
- `src/modules/products/products.service.spec.ts`
- `src/modules/orders/orders.service.spec.ts`
- `src/modules/cart/cart.service.spec.ts`

### CMSApp 测试
- `src/modules/articles/articles.service.spec.ts`
- `src/modules/categories/categories.service.spec.ts`

### ChatService 测试
- `src/modules/chat/chat.service.spec.ts`
- `src/modules/tickets/tickets.service.spec.ts`
- `src/modules/knowledge/knowledge.service.spec.ts`

## 持续集成

建议在 CI/CD 管道中添加以下步骤：

```yaml
- name: Run Tests
  run: |
    cd apps/website-template/backend
    npm test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 备注

- WebsiteTemplate Backend 的测试已全部通过，服务层覆盖率达到 100%
- DTO 和 Controller 层未写测试，因为这些通常是简单的数据转换和路由委托
- 其他应用的测试文件已创建，需要在对应应用中安装依赖后运行
