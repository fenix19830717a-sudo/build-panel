# 贡献指南

感谢您有兴趣为本项目做出贡献！本文档将帮助您了解如何参与项目开发。

## 目录

- [开发环境搭建](#开发环境搭建)
- [项目结构](#项目结构)
- [代码规范](#代码规范)
- [Git 工作流](#git-工作流)
- [开发流程](#开发流程)
- [测试指南](#测试指南)
- [Pull Request 流程](#pull-request-流程)
- [发布流程](#发布流程)
- [社区准则](#社区准则)

---

## 开发环境搭建

### 前置要求

在开始之前，请确保您的系统已安装以下软件：

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | 推荐使用 LTS 版本 |
| npm | >= 9.0.0 | 随 Node.js 一起安装 |
| Git | >= 2.0.0 | 版本控制工具 |
| VS Code | 最新版 | 推荐的代码编辑器 |

#### 推荐的 VS Code 扩展

- **ESLint** - JavaScript/TypeScript 代码检查
- **Prettier** - 代码格式化
- **Tailwind CSS IntelliSense** - Tailwind CSS 智能提示
- **TypeScript Vue Plugin (Volar)** - TypeScript 支持

### 克隆仓库

```bash
# 克隆仓库
git clone https://github.com/your-username/b2b-over-sever-framework.git

# 进入项目目录
cd b2b-over-sever-framework
```

### 安装依赖

```bash
# 安装主项目依赖
npm install

# 安装 node-agent 子项目依赖
cd node-agent && npm install && cd ..
```

### 配置开发环境

1. 复制环境变量模板文件：

```bash
cp .env.example .env
```

2. 配置必要的环境变量：

```env
# AI API Keys
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
KIMI_API_KEY=your_kimi_api_key
VOLCENGINE_API_KEY=your_volcengine_api_key
MINIMAX_API_KEY=your_minimax_api_key

# Server Config
PORT=3000
NODE_ENV=development
```

### 运行开发服务器

```bash
# 启动主项目开发服务器
npm run dev

# 启动 node-agent 开发服务器（另一个终端）
npm run dev:node
```

开发服务器启动后，访问 `http://localhost:3000` 查看应用。

---

## 项目结构

### 目录结构说明

```
b2b-over-sever-framework/
├── .trae/                    # Trae 配置和规范文件
│   └── specs/                # 项目规范文档
├── node-agent/               # Node Agent 子项目
│   ├── apps/                 # Agent 应用模块
│   │   ├── data-scraper/     # 数据抓取应用
│   │   └── trading-bot/      # 交易机器人应用
│   ├── config/               # 配置文件
│   └── src/                  # 源代码
│       ├── app-loader.ts     # 应用加载器
│       ├── communicator.ts   # 通信模块
│       ├── http-server.ts    # HTTP 服务器
│       ├── index.ts          # 入口文件
│       ├── logger.ts         # 日志模块
│       ├── monitor.ts        # 监控模块
│       └── types.ts          # 类型定义
├── src/                      # 主项目源代码
│   ├── apps/                 # 应用模块
│   │   ├── ai-operations/    # AI 运营模块
│   │   ├── b2b-leads/        # B2B 线索模块
│   │   ├── cloud-browser/    # 云浏览器模块
│   │   ├── customer-service/ # 客服模块
│   │   ├── logistics-tracking/ # 物流追踪模块
│   │   ├── market-research/  # 市场研究模块
│   │   ├── polymarket-bot/   # Polymarket 机器人
│   │   ├── site-generator/   # 站点生成器
│   │   └── social-media/     # 社交媒体模块
│   ├── components/           # 公共组件
│   │   ├── ActionButton.tsx  # 操作按钮组件
│   │   ├── GlobalOnboarding.tsx # 全局引导组件
│   │   └── Layout.tsx        # 布局组件
│   ├── pages/                # 页面组件
│   │   └── apps/             # 应用页面
│   ├── types/                # TypeScript 类型定义
│   ├── App.tsx               # 应用根组件
│   ├── db.ts                 # 数据库配置
│   ├── index.css             # 全局样式
│   └── main.tsx              # 应用入口
├── .env.example              # 环境变量模板
├── .gitignore                # Git 忽略配置
├── index.html                # HTML 入口文件
├── package.json              # 项目配置
├── server.ts                 # Express 服务器
├── tsconfig.json             # TypeScript 配置
└── vite.config.ts            # Vite 配置
```

### 主要文件说明

| 文件 | 说明 |
|------|------|
| `server.ts` | Express 服务器入口，处理 API 路由和 Vite 中间件 |
| `vite.config.ts` | Vite 构建配置，包含路径别名和插件配置 |
| `tsconfig.json` | TypeScript 编译配置 |
| `src/App.tsx` | React 应用根组件，定义路由和全局状态 |
| `src/main.tsx` | React 应用入口文件 |
| `src/db.ts` | SQLite 数据库配置和初始化 |

---

## 代码规范

### TypeScript 编码规范

#### 类型定义

```typescript
// 使用 interface 定义对象类型
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// 使用 type 定义联合类型和工具类型
type Status = 'pending' | 'active' | 'completed';
type PartialUser = Partial<User>;

// 避免使用 any，使用 unknown 代替
function processData(data: unknown): void {
  if (typeof data === 'string') {
    console.log(data);
  }
}
```

#### 函数定义

```typescript
// 使用箭头函数和明确的返回类型
const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

// 使用默认参数
const greet = (name: string, greeting: string = 'Hello'): string => {
  return `${greeting}, ${name}!`;
};
```

#### 模块导入

```typescript
// 使用路径别名
import { Button } from '@/components/Button';
import { User } from '@/types';

// 按类型分组导入
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Settings } from 'lucide-react';
```

### React 组件规范

#### 组件结构

```tsx
import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}) => {
  const baseStyles = 'rounded-lg font-medium transition-colors';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size]))}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};
```

#### Hooks 使用规范

```tsx
// 自定义 Hook 以 use 开头
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  }, [key]);

  return [storedValue, setValue] as const;
};
```

### CSS/Tailwind 规范

#### 类名组织

```tsx
// 使用 clsx 和 tailwind-merge 组合类名
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// 按照以下顺序组织类名
const buttonStyles = cn(
  'rounded-lg font-medium',
  'transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  isActive && 'bg-blue-600 text-white',
  disabled && 'opacity-50 cursor-not-allowed'
);
```

#### 响应式设计

```tsx
// 移动优先的响应式设计
<div className="
  flex flex-col
  gap-4
  p-4
  md:flex-row md:gap-6 md:p-6
  lg:gap-8 lg:p-8
">
  {children}
</div>
```

### 命名约定

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| 组件文件 | PascalCase | `Button.tsx`, `UserProfile.tsx` |
| 工具函数文件 | camelCase | `formatDate.ts`, `apiClient.ts` |
| 类型文件 | camelCase | `types.ts`, `apiTypes.ts` |
| 组件名 | PascalCase | `Button`, `UserProfile` |
| 函数名 | camelCase | `fetchUsers`, `handleSubmit` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| CSS 类 | kebab-case | `btn-primary`, `card-header` |
| 环境变量 | UPPER_SNAKE_CASE | `GEMINI_API_KEY`, `NODE_ENV` |

### 注释规范

```typescript
/**
 * 获取用户信息的异步函数
 * @param id - 用户唯一标识符
 * @returns Promise 包含用户信息的对象
 * @throws {Error} 当用户不存在时抛出错误
 */
const getUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error(`User ${id} not found`);
  }
  return response.json();
};

// TODO: 添加缓存机制
// FIXME: 处理网络超时情况
// NOTE: 此函数依赖于外部 API
```

---

## Git 工作流

### 分支命名规范

| 分支类型 | 命名格式 | 示例 |
|----------|----------|------|
| 功能分支 | `feature/功能名称` | `feature/user-authentication` |
| 修复分支 | `fix/问题描述` | `fix/login-error` |
| 热修复分支 | `hotfix/问题描述` | `hotfix/security-patch` |
| 发布分支 | `release/版本号` | `release/1.2.0` |
| 文档分支 | `docs/描述` | `docs/api-documentation` |

### 提交信息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): add OAuth login support` |
| `fix` | Bug 修复 | `fix(api): resolve timeout issue` |
| `docs` | 文档更新 | `docs(readme): update installation guide` |
| `style` | 代码格式调整 | `style(button): fix indentation` |
| `refactor` | 代码重构 | `refactor(utils): simplify date formatting` |
| `perf` | 性能优化 | `perf(list): implement virtual scrolling` |
| `test` | 测试相关 | `test(auth): add unit tests for login` |
| `chore` | 构建/工具相关 | `chore(deps): update dependencies` |
| `ci` | CI 配置 | `ci(github): add workflow for testing` |

#### 提交示例

```
feat(dashboard): add real-time data refresh

- Implement WebSocket connection for live updates
- Add auto-refresh toggle in settings
- Display connection status indicator

Closes #123
```

### 分支策略

```
main (生产分支)
  │
  ├── develop (开发分支)
  │     │
  │     ├── feature/new-feature
  │     ├── fix/bug-fix
  │     └── release/1.0.0
  │
  └── hotfix/critical-fix
```

---

## 开发流程

### 创建功能分支

```bash
# 确保在最新的 develop 分支
git checkout develop
git pull origin develop

# 创建新的功能分支
git checkout -b feature/your-feature-name
```

### 开发和测试

1. **编写代码**
   - 遵循代码规范
   - 保持提交粒度适中
   - 及时运行类型检查

2. **本地测试**
   ```bash
   # 运行类型检查
   npm run lint

   # 启动开发服务器测试
   npm run dev
   ```

3. **构建验证**
   ```bash
   # 构建项目
   npm run build
   ```

### 提交代码

```bash
# 查看修改状态
git status

# 添加修改的文件
git add .

# 提交修改
git commit -m "feat(module): add new feature"

# 推送到远程仓库
git push origin feature/your-feature-name
```

### 创建 Pull Request

1. 在 GitHub 上创建 Pull Request
2. 填写 PR 模板
3. 等待代码审查
4. 根据反馈修改代码

---

## 测试指南

### 测试框架

本项目使用以下测试工具：

- **Vitest** - 单元测试框架
- **React Testing Library** - React 组件测试
- **MSW** - API Mock 服务

### 编写单元测试

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('bg-blue-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-200');
  });
});
```

### 编写集成测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits form with valid credentials', async () => {
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error for invalid email', async () => {
    render(<LoginForm onLogin={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行特定测试文件
npm run test -- Button.test.tsx

# 运行测试并生成覆盖率报告
npm run test -- --coverage

# 监听模式
npm run test -- --watch
```

---

## Pull Request 流程

### PR 模板

```markdown
## 描述
简要描述此 PR 的目的和实现方式。

## 变更类型
- [ ] 新功能 (feat)
- [ ] Bug 修复 (fix)
- [ ] 重构 (refactor)
- [ ] 文档更新 (docs)
- [ ] 其他: ________

## 相关 Issue
Closes #

## 变更内容
- 变更点 1
- 变更点 2

## 测试
- [ ] 已添加单元测试
- [ ] 已添加集成测试
- [ ] 手动测试通过

## 截图
如有 UI 变更，请添加截图。

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 类型检查通过 (`npm run lint`)
- [ ] 构建成功 (`npm run build`)
- [ ] 测试通过
- [ ] 已更新相关文档
```

### 代码审查标准

审查者将从以下方面评估 PR：

1. **代码质量**
   - 遵循编码规范
   - 代码可读性和可维护性
   - 无冗余代码

2. **功能正确性**
   - 实现符合需求
   - 边界情况处理
   - 错误处理

3. **性能**
   - 无性能退化
   - 资源使用合理

4. **安全性**
   - 无安全漏洞
   - 敏感数据处理正确

5. **测试覆盖**
   - 测试用例充分
   - 测试通过

### 合并条件

PR 需满足以下条件才能合并：

- [ ] 至少 1 位审查者批准
- [ ] 所有 CI 检查通过
- [ ] 无合并冲突
- [ ] 类型检查通过
- [ ] 测试覆盖率不降低

---

## 发布流程

### 版本号规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

```
MAJOR.MINOR.PATCH

- MAJOR: 不兼容的 API 变更
- MINOR: 向后兼容的功能新增
- PATCH: 向后兼容的问题修复
```

预发布版本：
- `1.0.0-alpha.1` - 内部测试版本
- `1.0.0-beta.1` - 公开测试版本
- `1.0.0-rc.1` - 候选发布版本

### 发布检查清单

- [ ] 更新 `package.json` 版本号
- [ ] 更新 `CHANGELOG.md`
- [ ] 运行完整测试套件
- [ ] 构建生产版本
- [ ] 创建 Git 标签
- [ ] 合并到 main 分支
- [ ] 部署到生产环境

### 更新日志

`CHANGELOG.md` 格式：

```markdown
# Changelog

## [1.2.0] - 2024-01-15

### Added
- 新增用户认证功能
- 添加深色模式支持

### Changed
- 优化首页加载性能
- 更新依赖版本

### Fixed
- 修复登录页面样式问题
- 解决移动端布局错位

### Deprecated
- 旧版 API 将在 2.0.0 版本移除

### Security
- 修复 XSS 漏洞
```

---

## 社区准则

### 行为准则

我们致力于为所有人提供友好、安全和受欢迎的环境。请遵守以下准则：

**我们的承诺**

- 使用包容性语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

**不可接受的行为**

- 使用性化的语言或图像
- 捣乱、侮辱/贬损评论以及人身或政治攻击
- 公开或私下的骚扰
- 未经明确许可，发布他人的私人信息
- 其他在专业环境中可能被合理认为不适当的行为

### 沟通渠道

- **GitHub Issues** - 问题报告和功能请求
- **GitHub Discussions** - 一般讨论和问答
- **Pull Requests** - 代码贡献

### 问题报告

发现 Bug 或有功能建议？请通过 GitHub Issues 提交：

1. 搜索现有 Issues，避免重复
2. 使用 Issue 模板
3. 提供详细的复现步骤
4. 附上相关日志和截图

---

## 获取帮助

如果您在贡献过程中遇到任何问题，可以：

1. 查阅项目文档
2. 搜索现有的 Issues 和 Discussions
3. 创建新的 Discussion 提问

感谢您的贡献！
