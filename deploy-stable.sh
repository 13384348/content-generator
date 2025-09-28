#!/bin/bash

# 稳定部署脚本 - 避免服务器冲突和连接重置问题

echo "🚀 开始稳定部署..."

# 1. 构建前端
echo "📦 构建前端..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

# 2. 清理服务器进程
echo "🧹 清理服务器进程..."
ssh root@8.154.36.16 "pkill -f 'node server.js'"
sleep 3

# 3. 上传前端文件
echo "📤 上传前端文件..."
scp -r dist/* root@8.154.36.16:/opt/content-generator/frontend/dist/

# 4. 上传后端文件（如有修改）
echo "📤 上传后端文件..."
cd ../backend
scp server.js root@8.154.36.16:/opt/content-generator/backend/
scp database/init-safe.js root@8.154.36.16:/opt/content-generator/backend/database/

# 5. 启动单个服务器实例
echo "🔄 启动服务器..."
ssh root@8.154.36.16 "cd /opt/content-generator/backend && nohup node server.js > /tmp/server.log 2>&1 &"

# 6. 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 5

# 7. 检查服务器状态
echo "🔍 检查服务器状态..."
if ssh root@8.154.36.16 "curl -s http://localhost:5004/api/about > /dev/null"; then
    echo "✅ 部署成功！服务器正常运行在 http://8.154.36.16:5004"
else
    echo "❌ 部署失败，服务器未正常响应"
    exit 1
fi

echo "🎉 稳定部署完成！"