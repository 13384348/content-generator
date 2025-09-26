#!/bin/bash

# 服务器更新脚本
echo "🚀 正在更新服务器应用..."

# 进入应用目录
cd /opt/content-generator

# 停止当前应用
echo "⏹️ 停止当前应用..."
pkill -f "node.*server.js" || true

# 重新启动应用服务
echo "🔄 重新启动应用..."
nohup node server.js > app.log 2>&1 &

# 等待应用启动
sleep 5

# 检查应用状态
echo "✅ 检查应用状态..."
if curl -f http://localhost:5004/api/health > /dev/null 2>&1; then
    echo "🎉 应用更新成功！"
    echo "📊 应用状态: 运行中"
    echo "🌐 访问地址: http://8.154.36.16"
else
    echo "❌ 应用启动失败，查看日志:"
    tail -20 app.log
    exit 1
fi

echo "✨ 更新完成！"