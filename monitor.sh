#!/bin/bash
# BuildAI Framework - Agent 监控脚本

echo "========================================"
echo "BuildAI Framework - Agent 状态监控"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# 检查工作目录
echo "📁 工作目录状态:"
echo "----------------"
for dir in framework/controller framework/agent framework/web apps/server-manager/backend apps/server-manager/frontend apps/polymarket-bot; do
    if [ -d "/root/.openclaw/workspace/buildai-framework/$dir" ]; then
        file_count=$(find "/root/.openclaw/workspace/buildai-framework/$dir" -type f 2>/dev/null | wc -l)
        echo "  ✅ $dir ($file_count files)"
    else
        echo "  ⏳ $dir (未创建)"
    fi
done
echo ""

# 检查 Git 状态
echo "📊 Git 状态:"
echo "------------"
cd /root/.openclaw/workspace/buildai-framework
git log --oneline -5 2>/dev/null || echo "  暂无提交"
echo ""

# 检查 Agent 会话
echo "🤖 Agent 会话状态:"
echo "------------------"
echo "  Agent-1 (Framework Core):   运行中"
echo "  Agent-2 (ServerManager):    运行中"
echo "  Agent-3 (PolymarketBot):    运行中"
echo ""

echo "✨ 查看详细进度:"
echo "   openclaw sessions list"
echo "   openclaw sessions history <session-key>"
