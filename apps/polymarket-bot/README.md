# Polymarket Trading Bot

自动化 Polymarket 预测市场交易机器人。

## 功能特性

- 📊 多策略交易支持（趋势跟踪、套利）
- 💼 自动化钱包管理
- 🛡️ 完善的风控系统
- 🌐 Web API 管理界面
- 📈 实时数据推送
- 🔒 私钥加密存储

## 快速开始

### 安装

```bash
git clone <repository>
cd polymarket-bot
python -m venv venv
source venv/bin/activate
pip install -e .
```

### 配置

1. 复制配置文件模板：
```bash
cp config.yaml.example config.yaml
```

2. 编辑 `config.yaml` 配置：
- API 密钥
- 钱包私钥（将被加密存储）
- 策略参数
- 风控设置

### 运行

```bash
python src/main.py
```

### Web 服务

```bash
uvicorn src.web.api:app --host 0.0.0.0 --port 8000
```

## 项目结构

```
src/
├── api/          # Polymarket API 封装
├── wallet/       # 钱包管理
├── strategies/   # 交易策略
├── risk/         # 风控模块
├── execution/    # 订单执行
├── portfolio/    # 持仓管理
├── web/          # FastAPI 服务
├── models/       # Pydantic 模型
├── utils/        # 工具函数
└── main.py       # 入口
```

## API 端点

- `GET /markets` - 市场列表
- `GET /positions` - 当前持仓
- `POST /orders` - 下单
- `GET /config` - 策略配置
- `WebSocket /ws` - 实时数据推送

## 安全提示

⚠️ 私钥通过 Fernet 加密存储，请妥善保管加密密钥。
⚠️ 建议使用 dry-run 模式测试策略后再进行真实交易。
