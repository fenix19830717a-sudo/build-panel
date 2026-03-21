# 环境变量配置说明

本文档详细说明了项目所需的所有环境变量配置。

---

## 目录

- [AI 服务相关](#ai-服务相关)
- [服务配置](#服务配置)
- [Node Agent 配置](#node-agent-配置)
- [配置示例](#配置示例)

---

## AI 服务相关

### GEMINI_API_KEY

| 属性 | 值 |
|------|-----|
| 变量名 | `GEMINI_API_KEY` |
| 类型 | `string` |
| 默认值 | 无 |
| 是否必需 | 否（使用 Gemini 服务时必需） |
| 用途说明 | Google Gemini AI API 密钥，用于调用 Gemini AI 模型进行智能对话和分析功能 |
| 示例值 | `AIzaSyC...` |

### OPENAI_API_KEY

| 属性 | 值 |
|------|-----|
| 变量名 | `OPENAI_API_KEY` |
| 类型 | `string` |
| 默认值 | 无 |
| 是否必需 | 否（使用 OpenAI 服务时必需） |
| 用途说明 | OpenAI API 密钥，用于调用 GPT 系列模型进行智能对话和分析功能 |
| 示例值 | `sk-proj-...` |

### KIMI_API_KEY

| 属性 | 值 |
|------|-----|
| 变量名 | `KIMI_API_KEY` |
| 类型 | `string` |
| 默认值 | 无 |
| 是否必需 | 否（使用 Kimi 服务时必需） |
| 用途说明 | Kimi（月之暗面）API 密钥，用于调用 Kimi AI 模型进行智能对话和分析功能 |
| 示例值 | `kimi-api-...` |

### VOLCENGINE_API_KEY

| 属性 | 值 |
|------|-----|
| 变量名 | `VOLCENGINE_API_KEY` |
| 类型 | `string` |
| 默认值 | 无 |
| 是否必需 | 否（使用火山引擎服务时必需） |
| 用途说明 | 火山引擎 API 密钥，用于调用火山引擎 AI 服务进行智能对话和分析功能 |
| 示例值 | `volcengine-...` |

### MINIMAX_API_KEY

| 属性 | 值 |
|------|-----|
| 变量名 | `MINIMAX_API_KEY` |
| 类型 | `string` |
| 默认值 | 无 |
| 是否必需 | 否（使用 Minimax 服务时必需） |
| 用途说明 | Minimax API 密钥，用于调用 Minimax AI 模型进行智能对话和分析功能 |
| 示例值 | `minimax-...` |

---

## 服务配置

### PORT

| 属性 | 值 |
|------|-----|
| 变量名 | `PORT` |
| 类型 | `number` |
| 默认值 | `3000` |
| 是否必需 | 否 |
| 用途说明 | 主服务监听端口，用于指定服务器运行的端口号 |
| 示例值 | `3000`、`8080` |

### NODE_ENV

| 属性 | 值 |
|------|-----|
| 变量名 | `NODE_ENV` |
| 类型 | `string` |
| 默认值 | `development` |
| 是否必需 | 否 |
| 用途说明 | 运行环境标识，用于区分开发环境和生产环境，影响日志输出和错误处理行为 |
| 可选值 | `development`、`production`、`test` |
| 示例值 | `production` |

### NODE_SECRET_KEY

| 属性 | 值 |
|------|-----|
| 变量名 | `NODE_SECRET_KEY` |
| 类型 | `string` |
| 默认值 | `your-secret-key-change-in-production` |
| 是否必需 | 是（生产环境必需） |
| 用途说明 | 主服务节点认证密钥，用于验证 Node Agent 与主服务之间的通信安全，生产环境必须修改默认值 |
| 示例值 | `my-super-secret-key-2024` |

### DISABLE_HMR

| 属性 | 值 |
|------|-----|
| 变量名 | `DISABLE_HMR` |
| 类型 | `boolean` |
| 默认值 | `false` |
| 是否必需 | 否 |
| 用途说明 | 是否禁用热模块替换（HMR），在某些开发场景下可能需要禁用 |
| 可选值 | `true`、`false` |
| 示例值 | `true` |

---

## Node Agent 配置

以下环境变量用于配置 Node Agent（分布式节点代理）：

### NODE_NAME

| 属性 | 值 |
|------|-----|
| 变量名 | `NODE_NAME` |
| 类型 | `string` |
| 默认值 | `Node-Agent` |
| 是否必需 | 否 |
| 用途说明 | 节点名称，用于在集群中标识当前节点，便于管理和日志追踪 |
| 示例值 | `My-Node-1`、`worker-node-east` |

### NODE_PORT

| 属性 | 值 |
|------|-----|
| 变量名 | `NODE_PORT` |
| 类型 | `number` |
| 默认值 | `3100` |
| 是否必需 | 否 |
| 用途说明 | Node Agent 服务监听端口 |
| 示例值 | `3100`、`3101` |

### NODE_REGION

| 属性 | 值 |
|------|-----|
| 变量名 | `NODE_REGION` |
| 类型 | `string` |
| 默认值 | `default` |
| 是否必需 | 否 |
| 用途说明 | 节点所在区域，用于分布式部署时的区域管理和任务调度 |
| 示例值 | `us-east`、`cn-north`、`eu-west` |

### NODE_TYPE

| 属性 | 值 |
|------|-----|
| 变量名 | `NODE_TYPE` |
| 类型 | `string` |
| 默认值 | `worker` |
| 是否必需 | 否 |
| 用途说明 | 节点类型，用于区分不同功能的节点 |
| 可选值 | `worker`、`master`、`scheduler` |
| 示例值 | `worker` |

### MASTER_URL

| 属性 | 值 |
|------|-----|
| 变量名 | `MASTER_URL` |
| 类型 | `string` |
| 默认值 | `http://localhost:3000` |
| 是否必需 | 否（分布式部署时必需） |
| 用途说明 | 主服务地址，Node Agent 通过此地址与主服务通信并注册 |
| 示例值 | `http://localhost:3000`、`https://master.example.com` |

### SECRET_KEY

| 属性 | 值 |
|------|-----|
| 变量名 | `SECRET_KEY` |
| 类型 | `string` |
| 默认值 | `default-secret-key` |
| 是否必需 | 是（生产环境必需） |
| 用途说明 | Node Agent 认证密钥，必须与主服务的 `NODE_SECRET_KEY` 保持一致，用于验证节点身份 |
| 示例值 | `my-super-secret-key-2024` |

---

## 配置示例

### 开发环境配置示例

```env
# AI API Keys
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
KIMI_API_KEY=
VOLCENGINE_API_KEY=
MINIMAX_API_KEY=

# Server Config
PORT=3000
NODE_ENV=development
NODE_SECRET_KEY=dev-secret-key
```

### 生产环境配置示例

```env
# AI API Keys
GEMINI_API_KEY=your-production-gemini-api-key
OPENAI_API_KEY=your-production-openai-api-key
KIMI_API_KEY=your-production-kimi-api-key
VOLCENGINE_API_KEY=your-production-volcengine-api-key
MINIMAX_API_KEY=your-production-minimax-api-key

# Server Config
PORT=3000
NODE_ENV=production
NODE_SECRET_KEY=your-secure-production-secret-key-change-this
```

### Node Agent 配置示例

```env
# Node Agent Config
NODE_NAME=worker-node-1
NODE_PORT=3100
NODE_REGION=us-east
NODE_TYPE=worker
MASTER_URL=https://master.example.com
SECRET_KEY=your-secure-production-secret-key
```

---

## 注意事项

1. **安全性**：所有 API 密钥和认证密钥应妥善保管，不要提交到版本控制系统
2. **生产环境**：生产环境必须修改所有默认密钥值
3. **密钥一致性**：Node Agent 的 `SECRET_KEY` 必须与主服务的 `NODE_SECRET_KEY` 保持一致
4. **AI 服务**：至少配置一个 AI 服务的 API 密钥以使用智能对话功能
5. **配置优先级**：环境变量优先级高于配置文件，Node Agent 会优先读取环境变量

---

## 相关文件

- 主服务配置示例：[.env.example](.env.example)
- Node Agent 配置说明：[node-agent/README.md](node-agent/README.md)
