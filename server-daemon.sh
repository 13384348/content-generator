#!/bin/bash

# 服务器守护进程脚本 - 确保服务器永久稳定运行

SERVER_DIR="/opt/content-generator/backend"
PID_FILE="/tmp/content-generator.pid"
LOG_FILE="/tmp/content-generator.log"

echo "🔧 启动服务器守护进程..."

# 1. 彻底清理所有旧进程
echo "🧹 清理所有旧进程..."
pkill -f "node server.js" 2>/dev/null || true
sleep 2

# 2. 检查并清理PID文件
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "杀死旧进程: $OLD_PID"
        kill -9 "$OLD_PID" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
fi

# 3. 启动新的服务器进程（使用nohup确保进程不会因SSH断开而终止）
echo "🚀 启动新服务器进程..."
cd "$SERVER_DIR"
nohup node server.js > "$LOG_FILE" 2>&1 &
NEW_PID=$!

# 4. 保存PID
echo "$NEW_PID" > "$PID_FILE"

# 5. 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 5

# 6. 检查服务器是否正常运行
if ps -p "$NEW_PID" > /dev/null 2>&1; then
    echo "✅ 服务器成功启动，PID: $NEW_PID"
    echo "📋 日志文件: $LOG_FILE"
    echo "🌐 访问地址: http://8.154.36.16:5004"

    # 测试HTTP响应
    if curl -s --connect-timeout 10 http://localhost:5004/api/about > /dev/null; then
        echo "✅ HTTP服务正常响应"
    else
        echo "⚠️  HTTP服务可能需要更多时间启动"
    fi
else
    echo "❌ 服务器启动失败"
    echo "📋 错误日志:"
    tail -20 "$LOG_FILE"
    exit 1
fi

echo "🎉 服务器守护进程配置完成！"
echo ""
echo "📖 使用说明:"
echo "  - 查看服务器状态: ps -p \$(cat $PID_FILE)"
echo "  - 查看服务器日志: tail -f $LOG_FILE"
echo "  - 停止服务器: kill \$(cat $PID_FILE)"
echo "  - 重启服务器: 重新运行此脚本"